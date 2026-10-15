import mimetypes
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from config.storage import CloudflareR2MediaStorage


MEDIA_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'}


class Command(BaseCommand):
    help = 'Upload frontend photos and videos to stable site/ keys in Cloudflare R2.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='List files without uploading them.')

    def handle(self, *args, **options):
        if not settings.USE_CLOUDFLARE_R2:
            raise CommandError('Cloudflare R2 is not enabled or its credentials are incomplete.')

        frontend = Path(settings.BASE_DIR).parent / 'frontend'
        roots = ((frontend / 'public', 'site'), (frontend / 'assets', 'site/source-assets'))
        files = []
        for root, prefix in roots:
            if root.exists():
                files.extend(
                    (path, f"{prefix}/{path.relative_to(root).as_posix()}")
                    for path in root.rglob('*')
                    if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS
                )

        if options['dry_run']:
            for _, key in files:
                self.stdout.write(key)
            self.stdout.write(self.style.SUCCESS(f'{len(files)} files ready to upload.'))
            return

        storage = CloudflareR2MediaStorage()
        client = storage.connection.meta.client
        uploaded = 0
        for path, key in files:
            content_type = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
            is_versioned = key.startswith('site/assets/optimized/') and '-' in path.stem
            if is_versioned:
                cache_control = 'public, max-age=31536000, immutable'
            elif path.suffix.lower() in {'.mp4', '.webm'}:
                cache_control = 'public, max-age=2592000, stale-while-revalidate=604800'
            else:
                cache_control = 'public, max-age=604800, stale-while-revalidate=86400'
            self.stdout.write(f'Uploading {key} ... ', ending='')
            with path.open('rb') as source:
                client.put_object(
                    Bucket=storage.bucket_name,
                    Key=key,
                    Body=source,
                    ContentType=content_type,
                    CacheControl=cache_control,
                )
            client.head_object(Bucket=storage.bucket_name, Key=key)
            uploaded += 1
            self.stdout.write(self.style.SUCCESS('OK'))

        self.stdout.write(self.style.SUCCESS(f'Uploaded and verified {uploaded} site media files.'))

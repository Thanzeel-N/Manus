from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from config.storage import CloudflareR2MediaStorage


class Command(BaseCommand):
    help = 'Download fixed site media from R2 into frontend/public. Existing files are kept by default.'

    def add_arguments(self, parser):
        parser.add_argument('--overwrite', action='store_true', help='Replace existing local files.')

    def handle(self, *args, **options):
        if not settings.USE_CLOUDFLARE_R2:
            raise CommandError('Cloudflare R2 storage is not enabled for this environment.')

        public_root = (Path(settings.BASE_DIR).parent / 'frontend' / 'public').resolve()
        storage = CloudflareR2MediaStorage()
        client = storage.connection.meta.client
        paginator = client.get_paginator('list_objects_v2')
        downloaded = skipped = 0

        for page in paginator.paginate(Bucket=storage.bucket_name, Prefix='site/'):
            for item in page.get('Contents', []):
                key = item['Key']
                relative = Path(key.removeprefix('site/'))
                destination = (public_root / relative).resolve()
                if public_root not in destination.parents or key.endswith('/'):
                    continue
                if destination.exists() and not options['overwrite']:
                    skipped += 1
                    continue

                destination.parent.mkdir(parents=True, exist_ok=True)
                client.download_file(storage.bucket_name, key, str(destination))
                downloaded += 1
                self.stdout.write(f'Downloaded {key}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Downloaded {downloaded} fixed site files; kept {skipped} existing files.'
            )
        )

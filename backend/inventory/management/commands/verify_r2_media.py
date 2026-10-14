import json
import re
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from config.storage import CloudflareR2MediaStorage
from inventory.management.commands.sync_site_media_to_r2 import MEDIA_EXTENSIONS


class Command(BaseCommand):
    help = 'Verify that every local frontend media asset exists in Cloudflare R2.'

    def handle(self, *args, **options):
        if not settings.USE_CLOUDFLARE_R2:
            raise CommandError('Cloudflare R2 is not enabled or its credentials are incomplete.')

        frontend = Path(settings.BASE_DIR).parent / 'frontend'
        roots = ((frontend / 'public', 'site'), (frontend / 'assets', 'site/source-assets'))
        expected = {}
        for root, prefix in roots:
            if root.exists():
                expected.update(
                    (f'{prefix}/{path.relative_to(root).as_posix()}', path)
                    for path in root.rglob('*')
                    if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS
                )

        manifest_path = frontend / 'public' / 'assets' / 'optimized' / 'manifest.json'
        if manifest_path.exists():
            manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
            for image in manifest.values():
                urls = [image['src']]
                urls.extend(candidate.strip().split()[0] for candidate in image['srcSet'].split(','))
                for url in urls:
                    expected.setdefault(f'site/{url.lstrip("/")}', None)

        site_media_pattern = re.compile(r'["\'](/site-media/[^"\']+)["\']')
        for source_root in (frontend / 'app', frontend / 'components', frontend / 'lib'):
            for source in source_root.rglob('*'):
                if source.suffix not in {'.js', '.jsx', '.ts', '.tsx'}:
                    continue
                for url in site_media_pattern.findall(source.read_text(encoding='utf-8')):
                    if '${' not in url:
                        expected.setdefault(f'site/{url.removeprefix("/site-media/")}', None)

        storage = CloudflareR2MediaStorage()
        client = storage.connection.meta.client
        missing = []
        mismatched = []
        for key, path in expected.items():
            try:
                remote = client.head_object(Bucket=storage.bucket_name, Key=key)
            except Exception:
                missing.append(key)
                continue
            if path and remote.get('ContentLength') != path.stat().st_size:
                mismatched.append(key)

        if missing or mismatched:
            details = []
            if missing:
                details.append(f'missing: {", ".join(missing)}')
            if mismatched:
                details.append(f'size mismatch: {", ".join(mismatched)}')
            raise CommandError('R2 verification failed; ' + '; '.join(details))

        self.stdout.write(self.style.SUCCESS(
            f'Verified {len(expected)} frontend media files in Cloudflare R2.'
        ))

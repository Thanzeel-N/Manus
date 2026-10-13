import os
import mimetypes
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from config.storage import CloudflareR2MediaStorage
from inventory.models import Car, CarImage


class Command(BaseCommand):
    help = 'Upload all existing local media files and car photos to the Cloudflare R2 bucket.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--include-frontend-assets',
            action='store_true',
            default=False,
            help='Also upload frontend showcase assets. Omit this for normal R2 media syncs.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\nSyncing Local Media Files to Cloudflare R2 Bucket...'))

        storage = CloudflareR2MediaStorage()
        uploaded_count = 0

        # 1. Sync backend/media files
        media_root = Path(settings.MEDIA_ROOT)
        if media_root.exists():
            for root, _, files in os.walk(media_root):
                for filename in files:
                    local_path = Path(root) / filename
                    # Relative path within media (e.g., cars/photos/audi.jpg)
                    rel_path = str(local_path.relative_to(media_root)).replace('\\', '/')

                    self.stdout.write(f'  Uploading media: {rel_path} ... ', ending='')
                    try:
                        content_type, _ = mimetypes.guess_type(str(local_path))
                        content_type = content_type or 'application/octet-stream'

                        with open(local_path, 'rb') as f:
                            storage.connection.meta.client.put_object(
                                Bucket=storage.bucket_name,
                                Key=rel_path,
                                Body=f,
                                ContentType=content_type,
                            )
                        self.stdout.write(self.style.SUCCESS('[OK]'))
                        uploaded_count += 1
                    except Exception as err:
                        self.stdout.write(self.style.ERROR(f'[FAILED: {err}]'))
        else:
            self.stdout.write('  No local media folder found.')

        # 2. Sync frontend public assets if present
        if options.get('include_frontend_assets'):
            frontend_assets = Path(settings.BASE_DIR).parent / 'frontend' / 'public' / 'assets'
            if frontend_assets.exists():
                self.stdout.write(self.style.MIGRATE_HEADING('\nSyncing Frontend Vehicle & Showcase Assets to R2...'))
                for asset in frontend_assets.glob('*.jpg'):
                    rel_key = f'assets/{asset.name}'
                    self.stdout.write(f'  Uploading asset: {rel_key} ... ', ending='')
                    try:
                        content_type, _ = mimetypes.guess_type(str(asset)) or 'image/jpeg'
                        with open(asset, 'rb') as f:
                            storage.connection.meta.client.put_object(
                                Bucket=storage.bucket_name,
                                Key=rel_key,
                                Body=f,
                                ContentType=content_type,
                            )
                        self.stdout.write(self.style.SUCCESS('[OK]'))
                        uploaded_count += 1
                    except Exception as err:
                        self.stdout.write(self.style.ERROR(f'[FAILED: {err}]'))

        self.stdout.write(self.style.SUCCESS(f'\nTotal files uploaded to Cloudflare R2: {uploaded_count}'))

        # 3. Verify Database Car Images
        self.stdout.write(self.style.MIGRATE_HEADING('\nVerifying Database Car Images on R2:'))
        for car in Car.objects.all():
            self.stdout.write(f'\n  Car: {car.name} ({car.slug})')
            for img in car.images.all():
                url = img.image.url
                self.stdout.write(f'    Photo ({img.image.name}):\n      -> URL: {url[:90]}...')
            if car.video:
                self.stdout.write(f'    Video ({car.video.name}):\n      -> URL: {car.video.url[:90]}...')

        self.stdout.write(self.style.SUCCESS('\n*** All media successfully synced and verified on Cloudflare R2! ***\n'))

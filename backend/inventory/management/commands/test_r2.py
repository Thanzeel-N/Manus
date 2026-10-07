import time
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from config.storage import CloudflareR2MediaStorage


class Command(BaseCommand):
    help = 'Verify Cloudflare R2 bucket connectivity, permissions, and media URL generation.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\nChecking Cloudflare R2 Storage Configuration...'))

        bucket = getattr(settings, 'CLOUDFLARE_R2_BUCKET_NAME', '')
        account_id = getattr(settings, 'CLOUDFLARE_R2_ACCOUNT_ID', '')
        access_key = getattr(settings, 'CLOUDFLARE_R2_ACCESS_KEY_ID', '')
        secret_key = getattr(settings, 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', '')
        endpoint = getattr(settings, 'CLOUDFLARE_R2_ENDPOINT_URL', '')
        custom_domain = getattr(settings, 'CLOUDFLARE_R2_CUSTOM_DOMAIN', '')

        self.stdout.write(f'  • Bucket Name:   {bucket or "(not set)"}')
        self.stdout.write(f'  • Account ID:    {account_id or "(not set)"}')
        self.stdout.write(f'  • Endpoint:      {endpoint or "(not set)"}')
        self.stdout.write(f'  • Custom Domain: {custom_domain or "(none, using direct endpoint)"}')
        self.stdout.write(f'  • Access Key ID: {"*" * 6 + access_key[-4:] if len(access_key) >= 4 else "(not set)"}')

        missing = []
        if not bucket:
            missing.append('CLOUDFLARE_R2_BUCKET_NAME')
        if not access_key:
            missing.append('CLOUDFLARE_R2_ACCESS_KEY_ID')
        if not secret_key:
            missing.append('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
        if not endpoint:
            missing.append('CLOUDFLARE_R2_ACCOUNT_ID (or CLOUDFLARE_R2_ENDPOINT_URL)')

        if missing:
            self.stdout.write(self.style.ERROR('\n[X] Missing required Cloudflare R2 configuration variables:'))
            for var in missing:
                self.stdout.write(self.style.WARNING(f'    - {var}'))
            self.stdout.write('\nPlease provide these in your backend/.env file or environment.\n')
            return

        self.stdout.write(self.style.NOTICE('\nAttempting R2 upload & round-trip verification...'))
        try:
            storage = CloudflareR2MediaStorage()
            test_filename = f'r2_healthcheck_{int(time.time())}.txt'
            content = ContentFile(b'Cloudflare R2 health check passed for Manu Car World showroom.')

            saved_path = storage.save(test_filename, content)
            self.stdout.write(self.style.SUCCESS(f'  [✓] Successfully uploaded test object: {saved_path}'))

            public_url = storage.url(saved_path)
            self.stdout.write(self.style.SUCCESS(f'  [✓] Generated Public Media URL: {public_url}'))

            exists = storage.exists(saved_path)
            if exists:
                self.stdout.write(self.style.SUCCESS('  [✓] Verified file existence in bucket.'))

            storage.delete(saved_path)
            self.stdout.write(self.style.SUCCESS('  [✓] Cleaned up temporary healthcheck file.'))

            self.stdout.write(self.style.SUCCESS('\n*** Cloudflare R2 Storage is fully working and ready for car uploads! ***\n'))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f'\n[X] Cloudflare R2 connection failed: {exc}'))
            self.stdout.write('\nTroubleshooting tips:')
            self.stdout.write('  1. Verify your R2 API Token has "Object Read & Write" permission.')
            self.stdout.write('  2. Confirm your Account ID matches your Cloudflare dashboard URL.')
            self.stdout.write('  3. Ensure the bucket name exists in Cloudflare R2 dashboard.\n')

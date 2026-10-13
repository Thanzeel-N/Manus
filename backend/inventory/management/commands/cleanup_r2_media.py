from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from inventory.models import Car, CarImage


class Command(BaseCommand):
    help = 'Find orphaned car photos and videos in Cloudflare R2. Dry-run by default.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Permanently delete orphaned objects. Without this flag, only list them.',
        )

    def handle(self, *args, **options):
        if not hasattr(default_storage, 'bucket'):
            raise CommandError('Cloudflare R2 storage is not enabled for this environment.')

        referenced = {
            name
            for name in CarImage.objects.values_list('image', flat=True)
            if name
        }
        referenced.update(
            name
            for name in Car.objects.values_list('video', flat=True)
            if name
        )

        orphaned = []
        for prefix in ('cars/photos/', 'cars/videos/'):
            for item in default_storage.bucket.objects.filter(Prefix=prefix):
                if item.key not in referenced:
                    orphaned.append(item.key)

        if not orphaned:
            self.stdout.write(self.style.SUCCESS('No orphaned R2 car media found.'))
            return

        action = 'Deleting' if options['delete'] else 'Would delete'
        for key in orphaned:
            self.stdout.write(f'{action}: {key}')
            if options['delete']:
                default_storage.delete(key)

        if options['delete']:
            self.stdout.write(self.style.SUCCESS(f'Deleted {len(orphaned)} orphaned R2 objects.'))
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'Found {len(orphaned)} orphaned R2 objects. '
                    'Run again with --delete after reviewing this list.'
                )
            )

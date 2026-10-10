from datetime import datetime, time, timedelta
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from showroom.models import Car, TestDriveSlot

class Command(BaseCommand):
    help = 'Create one-hour test-drive slots, 10:00–17:00 IST (excluding 13:00). Existing blocked slots are preserved.'
    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=14)
        parser.add_argument('--car', help='Optional car slug')
    def handle(self, *args, **options):
        if not 1 <= options['days'] <= 90:
            raise CommandError('Days must be between 1 and 90.')
        cars = Car.objects.filter(status='available')
        if options['car']:
            cars = cars.filter(slug=options['car'])
        count = 0
        for car in cars:
            for day in range(1, options['days'] + 1):
                date = timezone.localdate() + timedelta(days=day)
                for hour in [10, 11, 12, 14, 15, 16, 17]:
                    _, created = TestDriveSlot.objects.get_or_create(car=car, starts_at=timezone.make_aware(datetime.combine(date, time(hour))))
                    count += created
        self.stdout.write(self.style.SUCCESS(f'Created {count} slots.'))

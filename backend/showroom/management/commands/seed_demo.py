from datetime import timedelta, datetime, time
from pathlib import Path
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils import timezone
from showroom.models import Car, CarImage, TestDriveSlot

class Command(BaseCommand):
    help = 'Create clearly labelled sample cars and 14 days of demo test-drive slots.'
    def handle(self, *args, **options):
        examples = [('bmw', 'BMW', 'BMW 3 Series', '320d Luxury Line', 2021, 32000, '32.50', 'Diesel', 'Sedan'), ('mercedes', 'Mercedes-Benz', 'Mercedes-Benz C-Class', 'C 220d Progressive', 2020, 41000, '29.90', 'Diesel', 'Sedan'), ('audi', 'Audi', 'Audi Q5', '45 TFSI Premium Plus', 2022, 24000, '46.50', 'Petrol', 'SUV')]
        for slug, brand, name, variant, year, mileage, price, fuel, body in examples:
            car, created = Car.objects.get_or_create(slug=slug, defaults=dict(brand=brand, name=name, variant=variant, year=year, mileage=mileage, price=price, fuel=fuel, body=body, status='available', is_sample=True, description='Sample listing for demonstration. Confirm actual specifications, condition and availability with the showroom.'))
            if created:
                path = Path(__file__).resolve().parents[4] / 'public' / 'assets' / f'{slug}.jpg'
                with path.open('rb') as image:
                    CarImage.objects.create(car=car, image=File(image, name=path.name), caption='Illustrative photo')
            if not car.is_sample:
                continue
            for day in range(1, 15):
                date = timezone.localdate() + timedelta(days=day)
                for hour in [10, 11, 12, 14, 15, 16, 17]:
                    TestDriveSlot.objects.get_or_create(car=car, starts_at=timezone.make_aware(datetime.combine(date, time(hour))))
        self.stdout.write(self.style.SUCCESS('Demo stock and slots ready.'))

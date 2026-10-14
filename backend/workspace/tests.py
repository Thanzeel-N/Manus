from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from bookings.models import Booking, TestDriveSlot
from inventory.models import Car


class InventoryDeleteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_superuser('owner', 'owner@example.com', 'password')
        self.client.force_login(self.user)

    def make_car(self, slug='delete-me'):
        return Car.objects.create(
            slug=slug,
            brand='Test',
            name='Delete Me',
            variant='Base',
            year=2024,
            mileage=1000,
            price=10,
            fuel='Petrol',
            transmission='Automatic',
            body='Sedan',
            condition='Used',
            status='sold',
        )

    def test_owner_can_delete_car(self):
        car = self.make_car()

        response = self.client.delete(f'/api/workspace/inventory/{car.pk}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Car.objects.filter(pk=car.pk).exists())

    def test_car_with_booking_history_cannot_be_deleted(self):
        car = self.make_car()
        slot = TestDriveSlot.objects.create(
            car=car,
            starts_at=timezone.now() + timedelta(days=1),
        )
        Booking.objects.create(
            slot=slot,
            name='Customer',
            email='customer@example.com',
            phone='+919876543210',
            status='cancelled',
        )

        response = self.client.delete(f'/api/workspace/inventory/{car.pk}/')

        self.assertEqual(response.status_code, 409)
        self.assertTrue(Car.objects.filter(pk=car.pk).exists())
        self.assertIn('booking history', response.json()['detail'])

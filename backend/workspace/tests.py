from datetime import timedelta
from io import BytesIO
from tempfile import TemporaryDirectory

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from PIL import Image

from bookings.models import Booking, TestDriveSlot
from inventory.models import Car, DeliveryPhoto


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


class DeliveryPhotoWorkspaceTests(TestCase):
    def setUp(self):
        self.media = TemporaryDirectory()
        self.media_settings = self.settings(MEDIA_ROOT=self.media.name)
        self.media_settings.enable()
        self.user = User.objects.create_user('staff', password='password', is_staff=True)
        self.client.force_login(self.user)

    def tearDown(self):
        self.media_settings.disable()
        self.media.cleanup()

    def image(self, name, portrait=False):
        output = BytesIO()
        size = (40, 70) if portrait else (70, 40)
        Image.new('RGB', size, '#c52b23').save(output, format='JPEG')
        return SimpleUploadedFile(name, output.getvalue(), content_type='image/jpeg')

    def test_staff_can_upload_multiple_images_as_webp(self):
        response = self.client.post('/api/workspace/deliveries/', {
            'photos': [self.image('one.jpg'), self.image('two.jpg', portrait=True)],
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(DeliveryPhoto.objects.count(), 2)
        self.assertTrue(all(photo.image.name.endswith('.webp') for photo in DeliveryPhoto.objects.all()))
        self.assertEqual({(photo.width, photo.height) for photo in DeliveryPhoto.objects.all()}, {(70, 40), (40, 70)})

    def test_new_uploads_remove_oldest_images_above_twelve(self):
        first = self.client.post('/api/workspace/deliveries/', {
            'photos': [self.image(f'photo-{index}.jpg') for index in range(12)],
        })
        oldest_ids = set(DeliveryPhoto.objects.order_by('created_at', 'id').values_list('id', flat=True)[:2])

        response = self.client.post('/api/workspace/deliveries/', {
            'photos': [self.image('new-one.jpg'), self.image('new-two.jpg')],
        })

        self.assertEqual(first.status_code, 201)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['count'], 12)
        self.assertEqual(DeliveryPhoto.objects.count(), 12)
        self.assertFalse(DeliveryPhoto.objects.filter(id__in=oldest_ids).exists())

    def test_more_than_twelve_files_is_rejected(self):
        response = self.client.post('/api/workspace/deliveries/', {
            'photos': [self.image(f'photo-{index}.jpg') for index in range(13)],
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(DeliveryPhoto.objects.count(), 0)

    def test_staff_can_delete_one_specific_delivery_photo(self):
        upload = self.client.post('/api/workspace/deliveries/', {
            'photos': [self.image('keep.jpg'), self.image('remove.jpg')],
        })
        remove_id = upload.json()['results'][0]['id']
        keep_id = upload.json()['results'][1]['id']

        response = self.client.delete(f'/api/workspace/deliveries/{remove_id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(DeliveryPhoto.objects.filter(id=remove_id).exists())
        self.assertTrue(DeliveryPhoto.objects.filter(id=keep_id).exists())
        self.assertEqual(DeliveryPhoto.objects.count(), 1)

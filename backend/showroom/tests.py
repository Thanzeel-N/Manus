from datetime import timedelta
from io import BytesIO
from tempfile import TemporaryDirectory
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from django.core.cache import cache
from PIL import Image
from rest_framework.test import APIClient
from .models import Car, TestDriveSlot, Booking, EmailVerification
from django.contrib.auth.hashers import make_password
from .admin import MultipleImageField, CarForm

class BookingTests(TestCase):
    def setUp(self):
        import time
        from django.contrib.auth import get_user_model
        cache.clear()
        self.client = APIClient()
        self.customer = get_user_model().objects.create_user(username='google_test', email='test@example.com')
        session = self.client.session
        session['customer_id'] = self.customer.pk
        session['customer_login_at'] = time.time()
        session.save()
        self.car = Car.objects.create(slug='test-car', name='Test car', brand='Test', year=2022, price=20, fuel='Petrol', body='SUV', status='available')
        self.slot = TestDriveSlot.objects.create(car=self.car, starts_at=timezone.now() + timedelta(days=1))
        self.payload = {'slot': self.slot.pk, 'name': 'Test Customer', 'phone': '+919876543210'}

    def test_duplicate_booking_and_cancellation(self):
        first = self.client.post('/api/bookings/', self.payload)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(first.data['status'], 'pending')
        self.assertEqual(Booking.objects.get().customer, self.customer)
        self.assertIsNotNone(Booking.objects.get().email_verified_at)
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 409)
        self.assertEqual(self.client.get('/api/cars/test-car/slots/').data, [])
        Booking.objects.update(status='cancelled')
        self.assertEqual(len(self.client.get('/api/cars/test-car/slots/').data), 1)
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 201)

    def test_logged_out_and_old_otp_payload_cannot_book(self):
        self.client = APIClient()
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 401)
        self.assertEqual(self.client.post('/api/bookings/', {**self.payload, 'verification_code': '123456', 'email': 'test@example.com'}).status_code, 401)

    def test_blocked_past_and_sold(self):
        self.slot.blocked = True
        self.slot.save()
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 409)
        self.slot.blocked = False
        self.slot.starts_at = timezone.now() - timedelta(hours=1)
        self.slot.save()
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 409)
        self.slot.starts_at = timezone.now() + timedelta(days=1)
        self.slot.save()
        self.car.status = 'sold'
        self.car.save()
        self.assertEqual(self.client.post('/api/bookings/', self.payload).status_code, 409)

    def test_invalid_contact_and_slot(self):
        self.assertEqual(self.client.post('/api/bookings/', {**self.payload, 'phone': 'bad'}).status_code, 400)
        self.assertEqual(self.client.post('/api/bookings/', {**self.payload, 'slot': 999}).status_code, 400)

    def test_drafts_private_and_admin_requires_login(self):
        self.car.status = 'draft'
        self.car.save()
        self.assertEqual(self.client.get('/api/cars/').data, [])
        self.assertEqual(self.client.get('/api/cars/test-car/').status_code, 404)
        self.assertEqual(self.client.get('/admin/showroom/car/').status_code, 302)

class UploadTests(TestCase):
    def test_admin_saves_multiple_photos_and_optional_video(self):
        from django.contrib.auth import get_user_model
        from .models import CarImage
        user = get_user_model().objects.create_superuser('staff', 'staff@example.com', 'test-only-password')
        self.client.force_login(user)
        def photo(name):
            data = BytesIO()
            Image.new('RGB', (10, 10)).save(data, 'JPEG')
            return SimpleUploadedFile(name, data.getvalue(), content_type='image/jpeg')
        with TemporaryDirectory() as media, override_settings(MEDIA_ROOT=media):
            response = self.client.post('/admin/showroom/car/add/', {
                'slug': 'upload-test', 'brand': 'Test', 'name': 'Upload test', 'year': 2023,
                'mileage': 1000, 'price': '20.00', 'fuel': 'Petrol', 'transmission': 'Automatic',
                'body': 'SUV', 'condition': 'Used', 'status': 'available',
                'photos': [photo('one.jpg'), photo('two.jpg')],
                'video': SimpleUploadedFile('walkaround.mp4', b'video-test-fixture', content_type='video/mp4'),
                'images-TOTAL_FORMS': '0', 'images-INITIAL_FORMS': '0', 'images-MIN_NUM_FORMS': '0', 'images-MAX_NUM_FORMS': '1000', '_save': 'Save'
            })
            self.assertEqual(response.status_code, 302)
            car = Car.objects.get(slug='upload-test')
            self.assertEqual(car.images.count(), 2)
            self.assertTrue(car.video.name.endswith('.mp4'))
            detail = self.client.get('/api/cars/upload-test/').json()
            self.assertEqual(len(detail['images']), 2)
            self.assertTrue(detail['video'].startswith('/media/'))

    def test_multiple_images_validate_every_file(self):
        def photo(name):
            data = BytesIO()
            Image.new('RGB', (10, 10)).save(data, 'JPEG')
            return SimpleUploadedFile(name, data.getvalue(), content_type='image/jpeg')
        field = CarForm.base_fields['photos']
        self.assertEqual(len(field.clean([photo('one.jpg'), photo('two.jpg')])), 2)
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            field.clean([photo('one.jpg'), SimpleUploadedFile('bad.jpg', b'not an image')])
    def test_video_size_and_extension(self):
        from django.core.exceptions import ValidationError
        field = Car._meta.get_field('video')
        with self.assertRaises(ValidationError):
            field.clean(SimpleUploadedFile('bad.html', b'bad'), Car())
        oversized = SimpleUploadedFile('large.mp4', b'video')
        oversized.size = 101 * 1024 * 1024
        with self.assertRaises(ValidationError):
            field.clean(oversized, Car())

from datetime import timedelta
from django.contrib.auth.models import User, Group, Permission
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, Client
from django.utils import timezone
from .models import Car, Booking, TestDriveSlot, Enquiry


class DashboardTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('setup_staff', verbosity=0)
        cls.staff = User.objects.create_user('staff', password='test-password', is_staff=True)
        cls.staff.groups.add(Group.objects.get(name='Showroom staff'))
        cls.restricted = User.objects.create_user('restricted', is_staff=True)
        cls.admin = User.objects.create_superuser('owner', 'owner@example.com', 'test-password')
        cls.car = Car.objects.create(slug='dashboard-car', brand='BMW', name='Dashboard car', year=2022, price=20, fuel='Petrol', body='SUV', status='available')
        cls.enquiry = Enquiry.objects.create(name='Customer', phone='9876543210', interest='BMW', message='<script>alert(1)</script>')
        cls.slot = TestDriveSlot.objects.create(car=cls.car, starts_at=timezone.now() + timedelta(days=1))
        cls.booking = Booking.objects.create(slot=cls.slot, name='Driver', phone='9876543210', email='driver@example.com')

    def setUp(self):
        cache.clear()

    def test_authentication_and_permissions(self):
        self.assertRedirects(self.client.get('/dashboard/'), '/admin/login/?next=/dashboard/', fetch_redirect_response=False)
        self.client.force_login(self.restricted)
        response = self.client.get('/dashboard/')
        self.assertNotContains(response, 'Customer')
        for section in ['inventory', 'enquiries', 'test-drives']:
            self.assertEqual(self.client.get(f'/dashboard/?section={section}').status_code, 403)
            self.assertEqual(self.client.post(f'/dashboard/?section={section}', {'id': 1, 'status': 'closed'}).status_code, 403)
        self.client.force_login(self.staff)
        self.assertEqual(self.client.get('/admin/auth/user/').status_code, 403)
        self.assertEqual(self.client.get(f'/admin/showroom/car/{self.car.pk}/delete/').status_code, 403)

    def test_sections_and_search(self):
        self.client.force_login(self.staff)
        for section in ['overview', 'inventory', 'enquiries', 'test-drives']:
            response = self.client.get(f'/dashboard/?section={section}')
            self.assertEqual(response.status_code, 200)
            self.assertIn('no-store', response.headers['Cache-Control'])
        self.assertContains(self.client.get('/dashboard/?section=inventory&q=BMW'), 'Dashboard car')
        self.assertNotContains(self.client.get('/dashboard/?section=inventory&q=missing'), 'Dashboard car')
        self.assertContains(self.client.get('/dashboard/?section=enquiries'), '&lt;script&gt;')
        self.assertNotContains(self.client.get('/dashboard/'), 'Staff &amp; access')
        self.client.force_login(self.admin)
        self.assertContains(self.client.get('/dashboard/'), 'Staff &amp; access')

    def test_follow_up_and_inventory_persist(self):
        self.client.force_login(self.staff)
        self.client.post('/dashboard/?section=enquiries', {'id': self.enquiry.pk, 'status': 'contacted', 'notes': 'Call tomorrow'})
        self.enquiry.refresh_from_db()
        self.assertEqual((self.enquiry.status, self.enquiry.notes), ('contacted', 'Call tomorrow'))
        self.client.post('/dashboard/?section=inventory', {'id': self.car.pk, 'status': 'sold'})
        self.car.refresh_from_db()
        self.assertEqual(self.car.status, 'sold')
        self.client.post('/dashboard/?section=inventory', {'id': self.car.pk, 'status': 'invalid'})
        self.car.refresh_from_db()
        self.assertEqual(self.car.status, 'sold')

    def test_booking_conflict_and_unavailable_slot(self):
        self.client.force_login(self.staff)
        self.client.post('/dashboard/?section=test-drives', {'id': self.booking.pk, 'status': 'confirmed'})
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'confirmed')
        self.client.post('/dashboard/?section=test-drives', {'id': self.booking.pk, 'status': 'cancelled'})
        Booking.objects.create(slot=self.slot, name='Other', phone='9876543210', email='other@example.com')
        response = self.client.post('/dashboard/?section=test-drives', {'id': self.booking.pk, 'status': 'confirmed'}, follow=True)
        self.assertContains(response, 'already has a booking')
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'cancelled')
        self.slot.blocked = True
        self.slot.save()
        response = self.client.post('/dashboard/?section=test-drives', {'id': self.booking.pk, 'status': 'confirmed'}, follow=True)
        self.assertContains(response, 'cannot be activated')

    def test_csrf_and_view_only(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.staff)
        self.assertEqual(client.post('/dashboard/?section=inventory', {'id': self.car.pk, 'status': 'sold'}).status_code, 403)
        self.restricted.user_permissions.add(Permission.objects.get(codename='view_enquiry'))
        self.client.force_login(self.restricted)
        self.assertContains(self.client.get('/dashboard/?section=enquiries'), 'Customer')
        self.assertNotContains(self.client.get('/dashboard/?section=enquiries'), 'Save changes')
        self.assertEqual(self.client.post('/dashboard/?section=enquiries', {'id': self.enquiry.pk, 'status': 'closed'}).status_code, 403)

    def test_public_enquiry_validation_and_private_fields(self):
        payload = {'name': 'New customer', 'phone': '9876543210', 'email': 'new@example.com', 'interest': 'Selling my car', 'message': 'Please call me', 'status': 'closed', 'notes': 'injected'}
        response = self.client.post('/api/enquiries/', payload)
        self.assertEqual(response.status_code, 201)
        enquiry = Enquiry.objects.get(pk=response.json()['reference'])
        self.assertEqual((enquiry.status, enquiry.notes), ('new', ''))
        self.assertEqual(self.client.get('/api/enquiries/').status_code, 405)
        self.assertEqual(self.client.post('/api/enquiries/', {**payload, 'phone': 'abc'}).status_code, 400)
        self.assertEqual(self.client.post('/api/enquiries/', {**payload, 'date': '2000-01-01'}).status_code, 400)

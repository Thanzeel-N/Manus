from datetime import timedelta
from io import BytesIO
from tempfile import TemporaryDirectory
from django.contrib.auth.models import User, Group, Permission
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, Client, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from PIL import Image
from .models import Car, CarImage, Booking, Enquiry, TestDriveSlot


class WorkspaceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('setup_staff', verbosity=0)
        cls.owner = User.objects.create_superuser('api-owner', 'owner@example.com', 'Original-password-246!')
        cls.staff = User.objects.create_user('api-staff', password='Original-password-246!', is_staff=True)
        cls.staff.groups.add(Group.objects.get(name='Showroom staff'))
        cls.restricted = User.objects.create_user('api-restricted', is_staff=True)
        cls.car = Car.objects.create(slug='api-car', name='API car', brand='BMW', year=2022, price=20, fuel='Petrol', body='SUV', status='available')
        cls.enquiry = Enquiry.objects.create(name='Customer', phone='9876543210', interest='BMW')
        cls.slot = TestDriveSlot.objects.create(car=cls.car, starts_at=(timezone.now() + timedelta(days=1)).replace(hour=5, minute=30, second=0, microsecond=0))
        cls.booking = Booking.objects.create(slot=cls.slot, name='Driver', phone='9876543210', email='driver@example.com')

    def setUp(self):
        cache.clear()
        self.api = APIClient()

    def test_session_login_csrf_rotation_and_logout(self):
        client = Client(enforce_csrf_checks=True)
        session = client.get('/api/workspace/session/').json()
        self.assertIsNone(session['user'])
        data = {'action': 'login', 'username': 'api-owner', 'password': 'Original-password-246!'}
        self.assertEqual(client.post('/api/workspace/session/', data, content_type='application/json').status_code, 403)
        result = client.post('/api/workspace/session/', data, content_type='application/json', HTTP_X_CSRFTOKEN=session['csrf'])
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()['user']['is_admin'])
        self.assertNotEqual(result.json()['csrf'], session['csrf'])
        self.assertEqual(client.get('/api/workspace/overview/').status_code, 200)
        result = client.post('/api/workspace/session/', {'action': 'logout'}, content_type='application/json', HTTP_X_CSRFTOKEN=result.json()['csrf'])
        self.assertIsNone(result.json()['user'])
        self.assertEqual(client.get('/api/workspace/overview/').status_code, 403)

    def test_login_throttle_and_inactive_accounts(self):
        data = {'action': 'login', 'username': 'api-staff', 'password': 'wrong'}
        for _ in range(10):
            self.assertEqual(self.client.post('/api/workspace/session/', data, content_type='application/json').status_code, 400)
        self.assertEqual(self.client.post('/api/workspace/session/', data, content_type='application/json').status_code, 429)
        cache.clear()
        self.staff.is_active = False
        self.staff.save()
        data['password'] = 'Original-password-246!'
        self.assertEqual(self.client.post('/api/workspace/session/', data, content_type='application/json').status_code, 400)

    def test_private_endpoints_and_model_permissions(self):
        for path in ['overview', 'inventory', 'enquiries', 'test-drives', 'slots', 'staff']:
            self.assertEqual(self.api.get(f'/api/workspace/{path}/').status_code, 403)
        self.api.force_login(self.restricted)
        self.assertEqual(self.api.get('/api/workspace/overview/').json(), {})
        for path in ['inventory', 'enquiries', 'test-drives', 'slots', 'staff']:
            self.assertEqual(self.api.get(f'/api/workspace/{path}/').status_code, 403)
        self.assertEqual(self.api.patch(f'/api/workspace/inventory/{self.car.pk}/', {'status': 'sold'}).status_code, 403)

    def test_inventory_create_edit_and_validation(self):
        self.api.force_login(self.staff)
        payload = {'slug': 'new-api-car', 'name': 'New API car', 'brand': 'Audi', 'year': 2021, 'price': '29.50', 'fuel': 'Petrol', 'body': 'SUV', 'status': 'draft'}
        result = self.api.post('/api/workspace/inventory/', payload, format='json')
        self.assertEqual(result.status_code, 201, result.data)
        pk = result.data['id']
        self.assertEqual(self.api.patch(f'/api/workspace/inventory/{pk}/', {'price': '-1'}, format='json').status_code, 400)
        self.assertEqual(self.api.patch(f'/api/workspace/inventory/{pk}/', {'status': 'available'}, format='json').status_code, 200)
        self.assertEqual(self.api.get('/api/workspace/inventory/?q=Audi&status=available').data['count'], 1)
        self.assertEqual(self.api.post('/api/workspace/inventory/', payload, format='json').status_code, 400)
        self.assertEqual(self.api.delete(f'/api/workspace/inventory/{pk}/').status_code, 405)

    def test_enquiry_updates_cannot_rewrite_customer_data(self):
        self.api.force_login(self.staff)
        response = self.api.patch(f'/api/workspace/enquiries/{self.enquiry.pk}/', {'status': 'contacted', 'notes': 'Call tomorrow', 'email': 'injected@example.com'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.enquiry.refresh_from_db()
        self.assertEqual((self.enquiry.status, self.enquiry.notes, self.enquiry.email), ('contacted', 'Call tomorrow', ''))

    def test_booking_conflict_blocked_past_and_cancel(self):
        self.api.force_login(self.staff)
        path = f'/api/workspace/test-drives/{self.booking.pk}/'
        self.assertEqual(self.api.patch(path, {'status': 'confirmed'}, format='json').status_code, 200)
        self.assertEqual(self.api.patch(path, {'status': 'cancelled'}, format='json').status_code, 200)
        Booking.objects.create(slot=self.slot, name='Other', phone='9876543210', email='other@example.com')
        self.assertEqual(self.api.patch(path, {'status': 'confirmed'}, format='json').status_code, 409)
        self.slot.blocked = True
        self.slot.save()
        self.assertEqual(self.api.patch(path, {'status': 'confirmed'}, format='json').status_code, 409)
        self.slot.blocked = False
        self.slot.starts_at = timezone.now() - timedelta(days=1)
        self.slot.save()
        self.assertEqual(self.api.patch(path, {'status': 'pending'}, format='json').status_code, 409)

    def test_slot_creation_uniqueness_and_history(self):
        self.api.force_login(self.staff)
        future = timezone.localtime(self.slot.starts_at) + timedelta(days=1)
        payload = {'car': self.car.pk, 'starts_at': future.isoformat()}
        result = self.api.post('/api/workspace/slots/', payload, format='json')
        self.assertEqual(result.status_code, 201, result.data)
        self.assertEqual(self.api.post('/api/workspace/slots/', payload, format='json').status_code, 400)
        self.assertEqual(self.api.post('/api/workspace/slots/', {**payload, 'starts_at': (future + timedelta(minutes=15)).isoformat()}, format='json').status_code, 400)
        self.assertEqual(self.api.patch(f'/api/workspace/slots/{self.slot.pk}/', {'starts_at': future.isoformat()}, format='json').status_code, 400)
        self.assertEqual(self.api.patch(f'/api/workspace/slots/{self.slot.pk}/', {'blocked': True}, format='json').status_code, 200)

    def test_staff_creation_permissions_and_superuser_protection(self):
        payload = {'username': 'new-staff', 'password': 'New-staff-password-987!', 'email': 'new@example.com', 'is_superuser': True}
        self.api.force_login(self.staff)
        self.assertEqual(self.api.post('/api/workspace/staff/', payload, format='json').status_code, 403)
        self.api.force_login(self.owner)
        self.assertEqual(self.api.post('/api/workspace/staff/', {**payload, 'password': '123'}, format='json').status_code, 400)
        result = self.api.post('/api/workspace/staff/', payload, format='json')
        self.assertEqual(result.status_code, 201, result.data)
        self.assertNotIn('password', result.data)
        user = User.objects.get(username='new-staff')
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.has_perm('showroom.change_car'))
        self.assertTrue(user.check_password(payload['password']))
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{self.owner.pk}/', {'is_active': False}, format='json').status_code, 403)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{user.pk}/', {'is_active': False}, format='json').status_code, 200)

    def test_password_change_preserves_session(self):
        self.client.force_login(self.owner)
        data = {'action': 'password', 'current_password': 'wrong', 'new_password': 'Changed-secret-1976!'}
        self.assertEqual(self.client.post('/api/workspace/session/', data, content_type='application/json').status_code, 400)
        data['current_password'] = 'Original-password-246!'
        result = self.client.post('/api/workspace/session/', data, content_type='application/json')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(self.client.get('/api/workspace/overview/').status_code, 200)
        self.owner.refresh_from_db()
        self.assertTrue(self.owner.check_password(data['new_password']))

    def test_photo_validation_and_staff_delete_permission(self):
        self.api.force_login(self.staff)
        path = f'/api/workspace/inventory/{self.car.pk}/photos/'
        invalid = SimpleUploadedFile('bad.jpg', b'not an image', content_type='image/jpeg')
        self.assertEqual(self.api.post(path, {'photos': invalid}, format='multipart').status_code, 400)
        buffer = BytesIO()
        Image.new('RGB', (10, 10)).save(buffer, format='JPEG')
        with TemporaryDirectory() as media, override_settings(MEDIA_ROOT=media):
            photo = SimpleUploadedFile('photo.jpg', buffer.getvalue(), content_type='image/jpeg')
            response = self.api.post(path, {'photos': photo}, format='multipart')
            self.assertEqual(response.status_code, 201, response.data)
            photo_id = response.data[0]['id']
            self.assertEqual(self.api.delete(f'{path}{photo_id}/').status_code, 403)
            self.api.force_login(self.owner)
            self.assertEqual(self.api.delete(f'{path}{photo_id}/').status_code, 204)

    def test_authenticated_writes_still_require_csrf(self):
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(self.staff)
        self.assertEqual(client.patch(f'/api/workspace/inventory/{self.car.pk}/', {'status': 'sold'}, format='json').status_code, 403)
        self.assertIn('no-store', client.get('/api/workspace/overview/').headers['Cache-Control'])

    def test_admin_can_restrict_existing_staff_and_restore_selected_access(self):
        self.api.force_login(self.owner)
        path = f'/api/workspace/staff/{self.staff.pk}/'
        response = self.api.patch(path, {'access': ['inventory.view']}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['access'], ['inventory.view'])
        self.api.force_login(self.staff)
        self.assertEqual(self.api.get('/api/workspace/inventory/').status_code, 200)
        self.assertEqual(self.api.get('/api/workspace/enquiries/').status_code, 403)
        self.assertEqual(self.api.patch(f'/api/workspace/inventory/{self.car.pk}/', {'price': '10'}, format='json').status_code, 403)
        self.assertEqual(self.api.patch(path, {'access': ['inventory.edit']}, format='json').status_code, 403)
        self.api.force_login(self.owner)
        response = self.api.patch(path, {'access': ['inventory.edit', 'slots.add']}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('inventory.view', response.data['access'])
        self.assertIn('slots.view', response.data['access'])
        self.api.force_login(self.staff)
        self.assertEqual(self.api.patch(f'/api/workspace/inventory/{self.car.pk}/', {'price': '10'}, format='json').status_code, 200)
        self.assertEqual(self.api.get('/api/workspace/enquiries/').status_code, 403)

    def test_staff_access_validation_empty_and_inactive_round_trip(self):
        self.api.force_login(self.owner)
        path = f'/api/workspace/staff/{self.staff.pk}/'
        self.assertEqual(self.api.patch(path, {'access': ['auth.change_user']}, format='json').status_code, 400)
        self.assertEqual(self.api.patch(path, {'access': ['inventory.edit'], 'is_active': False}, format='json').status_code, 200)
        listing = self.api.get('/api/workspace/staff/').data
        inactive = next(item for item in listing if item['id'] == self.staff.pk)
        self.assertIn('inventory.edit', inactive['access'])
        self.assertEqual(self.api.patch(path, {'access': [], 'is_active': True}, format='json').status_code, 200)
        self.api.force_login(self.staff)
        self.assertEqual(self.api.get('/api/workspace/overview/').data, {})
        self.assertEqual(self.api.get('/api/workspace/inventory/').status_code, 403)

    def test_custom_groups_cannot_silently_override_permission_restrictions(self):
        group = Group.objects.create(name='Custom vehicle editors')
        group.permissions.add(Permission.objects.get(content_type__app_label='showroom', codename='change_car'))
        self.staff.groups.add(group)
        self.api.force_login(self.owner)
        response = self.api.patch(f'/api/workspace/staff/{self.staff.pk}/', {'access': ['inventory.view'], 'first_name': 'Should not save'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.staff.refresh_from_db()
        self.assertNotEqual(self.staff.first_name, 'Should not save')

    def test_new_staff_permissions_are_explicit_and_do_not_grant_admin_access(self):
        self.api.force_login(self.owner)
        response = self.api.post('/api/workspace/staff/', {'username': 'limited-staff', 'password': 'Strong-initial-password-1987!', 'access': ['enquiries.edit']}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='limited-staff')
        self.assertTrue(user.has_perm('showroom.view_enquiry'))
        self.assertTrue(user.has_perm('showroom.change_enquiry'))
        self.assertFalse(user.has_perm('showroom.view_car'))
        self.assertFalse(user.has_perm('auth.change_user'))

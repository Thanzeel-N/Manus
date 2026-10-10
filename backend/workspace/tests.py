from datetime import timedelta
from io import StringIO
from unittest.mock import Mock, patch
import requests
from django.contrib.auth.models import User, Group
from django.core.management import call_command
from django.db import transaction
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from inventory.models import Car, CarImage
from bookings.models import Booking, TestDriveSlot
from enquiries.models import Enquiry
from .alerts import actor
from .models import Alert, StaffProfile


class OperationsTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command('setup_staff', stdout=StringIO())
        cls.owner = User.objects.create_superuser('owner', 'owner@example.com', 'Password-1234!')
        cls.admin = User.objects.create_user('manager', is_staff=True)
        cls.staff = User.objects.create_user('employee', is_staff=True)
        cls.staff.groups.add(Group.objects.get(name='Showroom staff'))
        StaffProfile.objects.create(user=cls.owner, phone='+919876543210')
        StaffProfile.objects.create(user=cls.admin, is_admin=True, phone='+919876543211')
        cls.car = Car.objects.create(slug='test-car', name='Test car', brand='BMW', year=2023, price=20, fuel='Petrol', body='SUV', status='available')
        cls.enquiry = Enquiry.objects.create(name='Customer', phone='9876543212', interest='BMW')
        slot = TestDriveSlot.objects.create(car=cls.car, starts_at=timezone.now() + timedelta(days=2))
        cls.booking = Booking.objects.create(slot=slot, name='Customer', phone='9876543212', email='customer@example.com')

    def setUp(self):
        self.api = APIClient()

    def test_status_and_car_edits_notify_both_admins_only_once(self):
        self.api.force_login(self.staff)
        for section, item, change in [('enquiries', self.enquiry, {'status': 'contacted'}),
                                     ('test-drives', self.booking, {'status': 'confirmed'}),
                                     ('inventory', self.car, {'price': '21.00'})]:
            path = f'/api/workspace/{section}/{item.pk}/'
            before = Alert.objects.count()
            result = self.api.patch(path, change, format='json')
            self.assertEqual(result.status_code, 200, result.data)
            self.assertEqual(Alert.objects.count(), before + 2)
            self.assertEqual(self.api.patch(path, change, format='json').status_code, 200)
            self.assertEqual(Alert.objects.count(), before + 2)
        self.assertEqual(set(Alert.objects.values_list('recipient_id', flat=True)), {self.owner.pk, self.admin.pk})
        self.assertTrue(all('employee' in text for text in Alert.objects.values_list('message', flat=True)))

    def test_admin_manages_staff_but_cannot_promote_or_edit_peers(self):
        self.api.force_login(self.admin)
        self.assertEqual(self.api.get('/api/workspace/staff/').status_code, 200)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{self.staff.pk}/', {'first_name': 'Updated'}, format='json').status_code, 200)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{self.staff.pk}/', {'is_admin': True}, format='json').status_code, 403)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{self.owner.pk}/', {'is_active': False}, format='json').status_code, 403)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{self.admin.pk}/', {'is_active': False}, format='json').status_code, 403)
        peer = User.objects.create_user('inactive-admin', is_staff=True, is_active=False)
        StaffProfile.objects.create(user=peer, is_admin=True)
        self.assertEqual(self.api.patch(f'/api/workspace/staff/{peer.pk}/', {'is_active': True, 'password': 'Compromised-password-123!'}, format='json').status_code, 403)
        self.assertEqual(self.api.post('/api/workspace/staff/', {'username': 'new-employee', 'password': 'Strong-pass-19245!', 'access': ['inventory.view']}, format='json').status_code, 201)

    def test_owner_can_assign_and_revoke_admin_without_superuser(self):
        self.api.force_login(self.owner)
        path = f'/api/workspace/staff/{self.staff.pk}/'
        self.assertEqual(self.api.patch(path, {'is_admin': True}, format='json').status_code, 200)
        self.staff.refresh_from_db()
        self.assertFalse(self.staff.is_superuser)
        self.api.force_login(self.staff)
        self.assertTrue(self.api.get('/api/workspace/session/').json()['user']['is_admin'])
        self.assertEqual(self.api.get('/api/workspace/staff/').status_code, 200)
        self.api.force_login(self.owner)
        self.assertEqual(self.api.patch(path, {'is_admin': False}, format='json').status_code, 200)
        self.api.force_login(self.staff)
        self.assertEqual(self.api.get('/api/workspace/staff/').status_code, 403)
        self.assertEqual(self.api.get('/api/workspace/notifications/').status_code, 403)

    def test_alert_privacy_and_phone_validation(self):
        alert = Alert.objects.create(recipient=self.owner, message='Owner alert')
        self.api.force_login(self.admin)
        self.assertEqual(self.api.get('/api/workspace/notifications/').data['results'], [])
        self.assertEqual(self.api.patch(f'/api/workspace/notifications/{alert.pk}/', {}, format='json').status_code, 404)
        self.assertEqual(self.api.patch('/api/workspace/profile/', {'phone': 'invalid'}, format='json').status_code, 400)
        self.assertEqual(self.api.patch('/api/workspace/profile/', {'phone': '+919876543219', 'is_admin': False}, format='json').status_code, 200)
        self.assertTrue(StaffProfile.objects.get(user=self.admin).is_admin)

    def test_rollback_photos_and_inactive_recipient(self):
        self.admin.is_active = False
        self.admin.save()
        token = actor.set(self.staff)
        try:
            with self.assertRaises(ValueError), transaction.atomic():
                self.car.name = 'Rolled back'
                self.car.save()
                raise ValueError()
            self.assertFalse(Alert.objects.exists())
            photo = CarImage.objects.create(car=self.car, image='cars/photos/test.jpg')
            photo.delete()
            self.assertEqual(Alert.objects.count(), 2)
            self.assertEqual(set(Alert.objects.values_list('recipient_id', flat=True)), {self.owner.pk})
        finally:
            actor.reset(token)

    @override_settings(SMS_ENABLED=True, TWILIO_ACCOUNT_SID='ACtest', TWILIO_AUTH_TOKEN='test', TWILIO_FROM_NUMBER='+12025550123')
    @patch('workspace.management.commands.deliver_alerts.requests.post')
    def test_delivery_disabled_success_timeout_and_retries(self, post):
        alert = Alert.objects.create(recipient=self.owner, message='Car changed', phone='+919876543210')
        with override_settings(SMS_ENABLED=False):
            call_command('deliver_alerts', stdout=StringIO())
        post.assert_not_called()
        post.return_value = Mock(status_code=429)
        call_command('deliver_alerts', stdout=StringIO())
        alert.refresh_from_db()
        self.assertEqual(alert.sms_status, 'pending')
        post.return_value = Mock(status_code=201, json=Mock(return_value={'sid': 'SMtest'}))
        call_command('deliver_alerts', stdout=StringIO())
        alert.refresh_from_db()
        self.assertEqual(alert.sms_status, 'submitted')
        self.assertEqual(alert.provider_id, 'SMtest')
        post.reset_mock()
        call_command('deliver_alerts', stdout=StringIO())
        post.assert_not_called()
        unknown = Alert.objects.create(recipient=self.owner, message='Status changed', phone='+919876543210')
        post.side_effect = requests.Timeout()
        call_command('deliver_alerts', stdout=StringIO())
        unknown.refresh_from_db()
        self.assertEqual(unknown.sms_status, 'unknown')
        post.reset_mock()
        call_command('deliver_alerts', stdout=StringIO())
        post.assert_not_called()

    @override_settings(SMS_ENABLED=True, TWILIO_ACCOUNT_SID='ACtest', TWILIO_AUTH_TOKEN='test', TWILIO_FROM_NUMBER='+12025550123')
    @patch('workspace.management.commands.deliver_alerts.requests.post')
    def test_demoted_admin_queued_sms_cancelled(self, post):
        alert = Alert.objects.create(recipient=self.admin, message='Private', phone='+919876543211')
        StaffProfile.objects.filter(user=self.admin).update(is_admin=False)
        call_command('deliver_alerts', stdout=StringIO())
        post.assert_not_called()
        alert.refresh_from_db()
        self.assertEqual(alert.sms_status, 'cancelled')

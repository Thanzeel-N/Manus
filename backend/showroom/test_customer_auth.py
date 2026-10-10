import hashlib
import time
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from .models import Car, TestDriveSlot, Booking
from django.utils import timezone
from datetime import timedelta


@override_settings(GOOGLE_CLIENT_ID='test-client.apps.googleusercontent.com')
class CustomerAuthTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)
        self.session = self.client.get('/api/customer/session/').data
        self.claims = {'sub': 'google-subject', 'email': 'customer@example.com', 'email_verified': True, 'name': 'Customer', 'nonce': self.session['nonce']}

    def login(self, claims=None):
        with patch('showroom.customer_auth.verify_oauth2_token', return_value=claims or self.claims) as verify:
            response = self.client.post('/api/customer/google/', {'credential': 'signed-token'}, format='json', HTTP_X_CSRFTOKEN=self.session['csrf'])
            self.assertEqual(verify.call_args.args[2], 'test-client.apps.googleusercontent.com')
            return response

    def test_login_rotates_session_and_cannot_access_staff(self):
        old_key = self.client.cookies['sessionid'].value
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(old_key, self.client.cookies['sessionid'].value)
        user = get_user_model().objects.get()
        self.assertFalse(user.has_usable_password())
        self.assertFalse(user.is_staff)
        self.assertEqual(self.client.get('/api/customer/session/').data['user']['email'], user.email)
        self.assertIn(self.client.get('/api/workspace/overview/').status_code, [401, 403])

    def test_invalid_google_token(self):
        with patch('showroom.customer_auth.verify_oauth2_token', side_effect=ValueError('invalid signature or audience')):
            response = self.client.post('/api/customer/google/', {'credential': 'bad'}, HTTP_X_CSRFTOKEN=self.session['csrf'])
        self.assertEqual(response.status_code, 401)
        self.assertFalse(get_user_model().objects.exists())

    def test_nonce_and_verified_email_required(self):
        self.assertEqual(self.login({**self.claims, 'nonce': 'wrong'}).status_code, 401)
        self.assertEqual(self.login({**self.claims, 'email_verified': False}).status_code, 401)

    def test_csrf_required_for_login_and_logout(self):
        self.assertEqual(self.client.post('/api/customer/google/', {'credential': 'bad'}).status_code, 403)
        self.assertEqual(self.client.post('/api/customer/logout/').status_code, 403)

    def test_same_email_does_not_link_staff_account(self):
        staff = get_user_model().objects.create_superuser('owner', self.claims['email'], 'test-only-password')
        self.client.force_login(staff)
        self.session = self.client.get('/api/customer/session/').data
        self.claims['nonce'] = self.session['nonce']
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(self.client.session['customer_id'], staff.pk)
        self.assertEqual(int(self.client.session['_auth_user_id']), staff.pk)
        self.assertEqual(self.client.post('/api/customer/logout/', HTTP_X_CSRFTOKEN=response.data['csrf']).status_code, 200)
        self.assertEqual(int(self.client.session['_auth_user_id']), staff.pk)
        self.assertIsNone(self.client.get('/api/customer/session/').data['user'])

    def test_inactive_customer_rejected(self):
        get_user_model().objects.create(username='google_' + hashlib.sha256(b'google-subject').hexdigest(), is_active=False)
        self.assertEqual(self.login().status_code, 403)

    @override_settings(GOOGLE_CLIENT_ID='')
    def test_unconfigured_login_fails_closed(self):
        response = self.client.post('/api/customer/google/', {'credential': 'bad'}, HTTP_X_CSRFTOKEN=self.session['csrf'])
        self.assertEqual(response.status_code, 503)

    def test_booking_identity_csrf_expiry_and_logout(self):
        car = Car.objects.create(slug='car', name='Car', brand='Test', year=2022, price=20, fuel='Petrol', body='SUV', status='available')
        slot = TestDriveSlot.objects.create(car=car, starts_at=timezone.now() + timedelta(days=1))
        payload = {'slot': slot.pk, 'name': 'Driver', 'phone': '9876543210', 'email': 'forged@example.com'}
        self.assertEqual(self.client.post('/api/bookings/', payload).status_code, 401)
        response = self.login()
        csrf = response.data['csrf']
        self.assertEqual(self.client.post('/api/bookings/', payload).status_code, 403)
        self.assertEqual(self.client.post('/api/bookings/', payload, HTTP_X_CSRFTOKEN=csrf).status_code, 201)
        self.assertEqual(Booking.objects.get().email, self.claims['email'])
        self.assertEqual(Booking.objects.get().customer_id, self.client.session['customer_id'])
        self.assertEqual(self.client.post('/api/bookings/', payload, HTTP_X_CSRFTOKEN=csrf).status_code, 409)
        session = self.client.session
        session['customer_login_at'] = time.time() - 8 * 86400
        session.save()
        self.assertEqual(self.client.post('/api/bookings/', payload, HTTP_X_CSRFTOKEN=csrf).status_code, 401)


class SharedPasswordLoginTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        users = get_user_model().objects
        cls.admin = users.create_superuser('admin-login', 'admin@example.com', 'Test-passphrase-2026!')
        cls.staff = users.create_user('staff-login', 'staff@example.com', 'Test-passphrase-2026!', is_staff=True)
        cls.customer = users.create_user('customer-login', 'customer@example.com', 'Test-passphrase-2026!')

    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)
        self.csrf = self.client.get('/api/customer/session/').data['csrf']

    def sign_in(self, username, **extra):
        return self.client.post('/api/customer/password/', {'username': username, 'password': 'Test-passphrase-2026!', **extra}, format='json', HTTP_X_CSRFTOKEN=self.csrf)

    def test_roles_come_from_database_and_preserve_permissions(self):
        for user, role in [(self.admin, 'admin'), (self.staff, 'staff'), (self.customer, 'customer')]:
            self.client = APIClient(enforce_csrf_checks=True)
            self.csrf = self.client.get('/api/customer/session/').data['csrf']
            response = self.sign_in(user.username, role='admin', is_superuser=True)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data['account']['role'], role)
            self.assertEqual(response.data['account']['destination'], '/cars' if role == 'customer' else '/dashboard')
            staff_session = self.client.get('/api/workspace/session/').json()['user']
            self.assertEqual(staff_session['is_admin'] if staff_session else None, None if role == 'customer' else role == 'admin')
            if role == 'customer':
                self.assertIn(self.client.get('/api/workspace/overview/').status_code, [401, 403])
            if role == 'staff':
                self.assertEqual(self.client.get('/api/workspace/staff/').status_code, 403)

    def test_wrong_password_inactive_and_csrf(self):
        self.assertEqual(self.client.post('/api/customer/password/', {'username': self.admin.username, 'password': 'Test-passphrase-2026!'}).status_code, 403)
        self.assertEqual(self.sign_in(self.admin.username, password='wrong').status_code, 400)
        self.customer.is_active = False
        self.customer.save(update_fields=['is_active'])
        self.assertEqual(self.sign_in(self.customer.username).status_code, 400)

    def test_customer_can_book_and_email_is_not_falsely_marked_verified(self):
        response = self.sign_in(self.customer.username)
        self.assertEqual(response.status_code, 200)
        car = Car.objects.create(slug='password-car', name='Car', brand='Test', year=2022, price=20, fuel='Petrol', body='SUV', status='available')
        slot = TestDriveSlot.objects.create(car=car, starts_at=timezone.now() + timedelta(days=1))
        payload = {'slot': slot.pk, 'name': 'Customer', 'phone': '9876543210', 'email': 'forged@example.com'}
        response = self.client.post('/api/bookings/', payload, HTTP_X_CSRFTOKEN=response.data['csrf'])
        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get()
        self.assertEqual(booking.email, self.customer.email)
        self.assertEqual(booking.customer, self.customer)
        self.assertIsNone(booking.email_verified_at)

    def test_shared_logout_and_password_change_revoke_password_session(self):
        response = self.sign_in(self.customer.username)
        self.assertEqual(self.client.post('/api/customer/account-logout/').status_code, 403)
        self.assertEqual(self.client.post('/api/customer/account-logout/', HTTP_X_CSRFTOKEN=response.data['csrf']).status_code, 200)
        self.assertIsNone(self.client.get('/api/customer/session/').data['account'])
        self.csrf = self.client.get('/api/customer/session/').data['csrf']
        self.sign_in(self.customer.username)
        self.customer.set_password('Another-test-passphrase!')
        self.customer.save()
        self.assertIsNone(self.client.get('/api/customer/session/').data['account'])


class CustomerRegistrationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient(enforce_csrf_checks=True)
        self.csrf = self.client.get('/api/customer/session/').data['csrf']
        self.payload = {'name': 'New Customer', 'email': 'New.Customer@example.com',
                        'password': 'A-road-trip-2026!9', 'confirm_password': 'A-road-trip-2026!9'}

    def register(self, **changes):
        from verification.models import EmailVerification
        from django.contrib.auth.hashers import make_password
        data = {**self.payload, **changes}
        if 'verification_id' not in data and 'verification_code' not in data:
            code = '123456'
            email = data.get('email', self.payload['email']).strip().lower()
            challenge = EmailVerification.objects.create(
                email=email,
                code_hash=make_password(code),
                expires_at=timezone.now() + timedelta(minutes=10),
                purpose='signup',
            )
            session = self.client.session
            session['signup_verification_id'] = str(challenge.pk)
            session.save()
            data['verification_id'] = str(challenge.pk)
            data['verification_code'] = code
        return self.client.post('/api/customer/register/', data,
                                format='json', HTTP_X_CSRFTOKEN=self.csrf)

    def test_signup_signs_in_customer_and_does_not_grant_staff_access(self):
        old_session = self.client.cookies['sessionid'].value
        response = self.register(is_staff=True, is_superuser=True, role='admin')
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get()
        self.assertEqual(user.email, 'new.customer@example.com')
        self.assertEqual(user.first_name, 'New Customer')
        self.assertTrue(user.check_password(self.payload['password']))
        self.assertNotEqual(user.password, self.payload['password'])
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.groups.exists())
        self.assertNotEqual(old_session, self.client.cookies['sessionid'].value)
        self.assertNotIn('customer_id', self.client.session)
        self.assertEqual(response.data['account']['role'], 'customer')
        self.assertIn(self.client.get('/api/workspace/overview/').status_code, [401, 403])
        self.assertEqual(self.client.get('/api/customer/session/').data['account']['email'], user.email)

    def test_customer_can_return_with_case_insensitive_email(self):
        response = self.register()
        self.client.post('/api/customer/account-logout/', HTTP_X_CSRFTOKEN=response.data['csrf'])
        self.csrf = self.client.get('/api/customer/session/').data['csrf']
        response = self.client.post('/api/customer/password/',
            {'username': ' NEW.CUSTOMER@EXAMPLE.COM ', 'password': self.payload['password']},
            format='json', HTTP_X_CSRFTOKEN=self.csrf)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['account']['role'], 'customer')

    def test_signup_validation_and_csrf_do_not_create_users(self):
        self.assertEqual(self.client.post('/api/customer/register/', self.payload, format='json').status_code, 403)
        for changes in [{'email': 'invalid'}, {'name': ' '}, {'confirm_password': 'wrong'},
                        {'password': 'password', 'confirm_password': 'password'},
                        {'password': 'tiny', 'confirm_password': 'tiny'}, {'name': 'x' * 151}]:
            self.assertEqual(self.register(**changes).status_code, 400)
        self.assertFalse(get_user_model().objects.exists())

    def test_duplicate_email_never_changes_existing_account(self):
        existing = get_user_model().objects.create_superuser('owner', self.payload['email'].lower(), 'Existing-owner-pass!')
        response = self.register()
        self.assertEqual(response.status_code, 400)
        existing.refresh_from_db()
        self.assertTrue(existing.check_password('Existing-owner-pass!'))
        self.assertTrue(existing.is_superuser)
        self.assertEqual(get_user_model().objects.count(), 1)
        self.assertIsNone(self.client.get('/api/customer/session/').data['account'])

    def test_existing_session_cannot_register_and_signup_is_throttled(self):
        self.assertEqual(self.register().status_code, 201)
        self.csrf = self.client.get('/api/customer/session/').data['csrf']
        self.assertEqual(self.register(email='another@example.com').status_code, 409)
        self.client.post('/api/customer/account-logout/', HTTP_X_CSRFTOKEN=self.csrf)
        self.csrf = self.client.get('/api/customer/session/').data['csrf']
        with patch('showroom.customer_auth.LoginThrottle.get_rate', return_value='1/hour'):
            cache.clear()
            self.assertEqual(self.register(email='invalid').status_code, 400)
            self.assertEqual(self.register(email='invalid').status_code, 429)

    def test_ambiguous_or_inactive_customer_email_cannot_sign_in(self):
        users = get_user_model().objects
        customer = users.create_user('customer-a', 'duplicate@example.com', self.payload['password'], is_active=False)
        response = self.client.post('/api/customer/password/', {'username': customer.email, 'password': self.payload['password']}, format='json', HTTP_X_CSRFTOKEN=self.csrf)
        self.assertEqual(response.status_code, 400)
        customer.is_active = True
        customer.save()
        users.create_user('customer-b', customer.email, self.payload['password'])
        response = self.client.post('/api/customer/password/', {'username': customer.email, 'password': self.payload['password']}, format='json', HTTP_X_CSRFTOKEN=self.csrf)
        self.assertEqual(response.status_code, 400)

"""Customer sessions are separate from staff authentication."""
import hashlib
import secrets
import time
from functools import partial

from django.conf import settings
from django.contrib.auth import get_user_model, get_user, authenticate, login as django_login, logout as django_logout
from django.middleware.csrf import get_token, rotate_token
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from verification.models import EmailVerification
from verification.views import send_verification, VerificationThrottle
try:
    from google.auth.transport.requests import Request
    from google.oauth2.id_token import verify_oauth2_token
    from google.auth.exceptions import TransportError
except ImportError:
    class Request:
        def __init__(self, *args, **kwargs):
            pass
        def __call__(self, *args, **kwargs):
            pass

    def verify_oauth2_token(*args, **kwargs):
        raise RuntimeError("google-auth is not installed.")

    class TransportError(Exception):
        pass
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework import serializers


def customer_for(request):
    native_user = get_user(request)
    if native_user.is_authenticated and native_user.is_active and not native_user.is_staff and not native_user.is_superuser:
        return native_user
    customer_id = request.session.get('customer_id')
    if not customer_id or time.time() - request.session.get('customer_login_at', 0) > 7 * 86400:
        return None
    return get_user_model().objects.filter(pk=customer_id, is_active=True, username__startswith='google_', is_staff=False, is_superuser=False).first()


def customer_data(customer, request=None):
    if not customer:
        return None
    data = {'name': customer.first_name, 'email': customer.email}
    if request:
        data['picture'] = request.session.get('customer_picture')
    return data


def account_data(request):
    user = get_user(request)
    if user.is_authenticated and user.is_active and (user.is_staff or user.is_superuser):
        return {'name': user.get_full_name() or user.username, 'role': 'admin' if user.is_superuser else 'staff', 'destination': '/dashboard'}
    customer = customer_for(request)
    return {**customer_data(customer, request), 'role': 'customer', 'destination': '/cars'} if customer else None


def establish_session(request, user):
    request.session.cycle_key()
    request.session['customer_id'] = user.pk
    request.session['customer_login_at'] = time.time()
    request.session.pop('google_nonce', None)
    rotate_token(request)
    response = Response({'user': customer_data(user, request), 'csrf': get_token(request)})
    response['Cache-Control'] = 'no-store'
    return response


class LoginThrottle(AnonRateThrottle):
    scope = 'customer_login'


class CustomerRegistration(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(max_length=1024, trim_whitespace=False, write_only=True)
    confirm_password = serializers.CharField(max_length=1024, trim_whitespace=False, write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'The passwords do not match.'})
        data['email'] = data['email'].strip().lower()
        user = get_user_model()(email=data['email'], first_name=data['name'])
        try:
            validate_password(data['password'], user=user)
        except ValidationError as error:
            raise serializers.ValidationError({'password': error.messages})
        return data


class VerifiedRegistration(CustomerRegistration):
    verification_id = serializers.UUIDField()
    verification_code = serializers.RegexField(r'^\d{6}$', max_length=6, min_length=6)


@api_view(['POST'])
@authentication_classes([])
@throttle_classes([VerificationThrottle])
def registration_code(request):
    SessionAuthentication().enforce_csrf(request)
    if account_data(request):
        return Response({'detail': 'Sign out before creating another account.'}, status=409)
    payload = CustomerRegistration(data=request.data)
    payload.is_valid(raise_exception=True)
    email = payload.validated_data['email']
    if get_user_model().objects.filter(email__iexact=email).exists():
        return Response({'detail': 'An account already uses this email. Please sign in or contact the showroom.'}, status=400)
    response = send_verification(email, purpose='signup')
    if response.status_code == 201:
        request.session['signup_verification_id'] = response.data['verification_id']
    response['Cache-Control'] = 'no-store'
    return response


def password_session(request, user, status=200):
    for key in ['customer_id', 'customer_login_at', 'google_nonce']:
        request.session.pop(key, None)
    django_login(request._request, user, backend='django.contrib.auth.backends.ModelBackend')
    response = Response({'account': account_data(request), 'csrf': get_token(request),
                         'user': customer_data(customer_for(request))}, status=status)
    response['Cache-Control'] = 'no-store'
    return response


@api_view(['POST'])
@authentication_classes([])
@throttle_classes([LoginThrottle])
def register(request):
    SessionAuthentication().enforce_csrf(request)
    if account_data(request):
        return Response({'detail': 'Sign out before creating another account.'}, status=409)
    payload = VerifiedRegistration(data=request.data)
    payload.is_valid(raise_exception=True)
    data = payload.validated_data
    users = get_user_model().objects
    duplicate_message = 'An account already uses this email. Sign in with your existing method or contact the showroom.'
    if users.filter(email__iexact=data['email']).exists():
        return Response({'detail': duplicate_message}, status=400)
    # A deterministic, unique username also prevents concurrent registrations
    # of the same email. Never accept staff flags or permissions from the client.
    username = 'customer_' + hashlib.sha256(data['email'].encode()).hexdigest()
    try:
        with transaction.atomic():
            challenge = EmailVerification.objects.select_for_update().filter(
                pk=data['verification_id'], email=data['email'], purpose='signup',
            ).first()
            now = timezone.now()
            if (not challenge or request.session.get('signup_verification_id') != str(challenge.pk)
                    or challenge.used_at or challenge.expires_at <= now or challenge.attempts >= 5):
                return Response({'detail': 'This code is invalid or expired. Request a new code.'}, status=400)
            challenge.attempts += 1
            challenge.save(update_fields=['attempts'])
            if not check_password(data['verification_code'], challenge.code_hash):
                return Response({'detail': 'Incorrect code. Please try again.' if challenge.attempts < 5 else 'Too many incorrect attempts. Request a new code.'}, status=400)
            user = users.create_user(username=username, email=data['email'],
                                     first_name=data['name'], password=data['password'],
                                     is_staff=False, is_superuser=False)
            challenge.used_at = now
            challenge.customer = user
            challenge.save(update_fields=['used_at', 'customer'])
    except IntegrityError:
        return Response({'detail': duplicate_message}, status=400)
    request.session.pop('signup_verification_id', None)
    return password_session(request, user, status=201)


@api_view(['GET'])
@authentication_classes([])
def session(request):
    # Validate password sessions first: a changed password can flush the session.
    customer = customer_for(request)
    account = account_data(request)
    if not request.session.get('google_nonce'):
        request.session['google_nonce'] = secrets.token_urlsafe(32)
    response = Response({'user': customer_data(customer, request), 'csrf': get_token(request),
                         'client_id': settings.GOOGLE_CLIENT_ID, 'nonce': request.session['google_nonce'], 'account': account})
    response['Cache-Control'] = 'no-store'
    return response


@api_view(['POST'])
@authentication_classes([])
@throttle_classes([LoginThrottle])
def google_login(request):
    SessionAuthentication().enforce_csrf(request)
    if not settings.GOOGLE_CLIENT_ID:
        return Response({'detail': 'Google sign-in is not configured yet. Please contact the showroom.'}, status=503)
    credential = request.data.get('credential')
    if not isinstance(credential, str) or not 1 <= len(credential) <= 12000:
        return Response({'detail': 'A Google sign-in credential is required.'}, status=400)
    try:
        claims = verify_oauth2_token(credential, partial(Request(), timeout=10), settings.GOOGLE_CLIENT_ID)
    except ValueError:
        return Response({'detail': 'Google sign-in could not be verified. Please try again.'}, status=401)
    except TransportError:
        return Response({'detail': 'Google sign-in is temporarily unavailable. Please try again.'}, status=503)
    nonce = request.session.get('google_nonce')
    if not nonce or not secrets.compare_digest(str(claims.get('nonce', '')), nonce):
        return Response({'detail': 'Sign-in expired. Reload this page and try again.'}, status=401)
    if not claims.get('sub') or claims.get('email_verified') is not True or not claims.get('email'):
        return Response({'detail': 'Please use a Google account with a verified email.'}, status=401)
    # Never link a Google identity to an existing staff account by email.
    username = 'google_' + hashlib.sha256(claims['sub'].encode()).hexdigest()
    user, created = get_user_model().objects.get_or_create(username=username)
    if not user.is_active:
        return Response({'detail': 'This account is inactive. Contact the showroom.'}, status=403)
    if created:
        user.set_unusable_password()
    user.email = claims['email'][:254]
    user.first_name = claims.get('name', '')[:150]
    user.save()
    if claims.get('picture'):
        request.session['customer_picture'] = claims['picture']
    return establish_session(request, user)


@api_view(['POST'])
@authentication_classes([])
def logout(request):
    SessionAuthentication().enforce_csrf(request)
    for key in ['customer_id', 'customer_login_at', 'google_nonce', 'customer_picture']:
        request.session.pop(key, None)
    request.session.cycle_key()
    return Response({'user': None})


@api_view(['POST'])
@authentication_classes([])
@throttle_classes([LoginThrottle])
def password_login(request):
    SessionAuthentication().enforce_csrf(request)
    username, password = request.data.get('username'), request.data.get('password')
    if not isinstance(username, str) or not isinstance(password, str) or not username.strip() or len(username) > 254 or len(password) > 1024:
        return Response({'detail': 'Enter your email or username and password.'}, status=400)
    identifier = username.strip()
    # Email sign-in is for customers. Staff retain their existing username login.
    if '@' in identifier:
        candidates = list(get_user_model().objects.filter(
            email__iexact=identifier, is_staff=False, is_superuser=False,
        )[:2])
        if len(candidates) == 1:
            identifier = candidates[0].username
    user = authenticate(request._request, username=identifier, password=password)
    if not user or not user.is_active:
        return Response({'detail': 'Check your email or username and password.'}, status=400)
    return password_session(request, user)


@api_view(['POST'])
@authentication_classes([])
def account_logout(request):
    SessionAuthentication().enforce_csrf(request)
    django_logout(request._request)
    return Response({'account': None, 'user': None})

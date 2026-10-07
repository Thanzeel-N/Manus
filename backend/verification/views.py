import secrets
from datetime import timedelta
from smtplib import SMTPException
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .models import EmailVerification


class VerificationInput(serializers.Serializer):
    email = serializers.EmailField(max_length=254)


class VerificationThrottle(AnonRateThrottle):
    scope = 'verification'


@api_view(['POST'])
@throttle_classes([VerificationThrottle])
def send_code(request):
    payload = VerificationInput(data=request.data)
    payload.is_valid(raise_exception=True)
    email = payload.validated_data['email'].strip().lower()
    now = timezone.now()
    recent = EmailVerification.objects.filter(email=email, created_at__gt=now - timedelta(hours=1))
    if recent.filter(created_at__gt=now - timedelta(seconds=60)).exists():
        return Response({'detail': 'Please wait 60 seconds before requesting another code.'}, status=429)
    if recent.count() >= 5:
        return Response({'detail': 'Too many codes requested. Please try again in an hour.'}, status=429)
    if settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend' and (
        not settings.EMAIL_HOST or settings.DEFAULT_FROM_EMAIL.endswith('@example.com>')
    ):
        return Response({'detail': 'Email verification is not configured yet. Please contact the showroom.'}, status=503)

    code = f'{secrets.randbelow(1000000):06d}'
    challenge = EmailVerification.objects.create(
        email=email,
        code_hash=make_password(code),
        expires_at=now + timedelta(minutes=10),
    )
    try:
        import showroom.verification as legacy_v
        _mail_sender = getattr(legacy_v, 'send_mail', send_mail)
    except Exception:
        _mail_sender = send_mail

    try:
        sent = _mail_sender(
            'Your showroom verification code',
            f'Your verification code is {code}.\n\nIt expires in 10 minutes. Enter it on the booking page to verify your email and request a test drive.\nIf you did not request this, ignore this email.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        if sent != 1:
            raise SMTPException('Delivery failed')
    except (SMTPException, OSError, ValueError):
        challenge.used_at = timezone.now()
        challenge.save(update_fields=['used_at'])
        return Response({'detail': 'The verification email could not be sent. Please try again later.'}, status=503)

    if settings.DEBUG:
        print(f'[DEV OTP] {email}: {code} (expires in 10 minutes)', flush=True)

    local = settings.EMAIL_BACKEND == 'django.core.mail.backends.filebased.EmailBackend'
    return Response(
        {
            'verification_id': str(challenge.id),
            'expires_in': 600,
            'retry_after': 60,
            'local_delivery': local,
            'detail': (
                'Development mode: email saved to the local mail folder, not sent to an inbox.'
                if local
                else 'Verification code sent. Check your inbox and spam folder.'
            ),
        },
        status=201,
    )

from django.contrib.auth.hashers import check_password
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from inventory.models import Car
from verification.models import EmailVerification
from .models import Booking, TestDriveSlot


class BookingInput(serializers.ModelSerializer):
    verification_id = serializers.UUIDField(write_only=True)
    verification_code = serializers.RegexField(r'^\d{6}$', write_only=True)

    class Meta:
        model = Booking
        fields = ['slot', 'name', 'email', 'phone', 'verification_id', 'verification_code']


class BookingThrottle(AnonRateThrottle):
    scope = 'booking'


@api_view(['GET'])
def slots(request, slug):
    car = get_object_or_404(Car, slug=slug, status='available')
    taken = Booking.objects.filter(status__in=['pending', 'confirmed']).values('slot_id')
    available = car.slots.filter(blocked=False, starts_at__gt=timezone.now()).exclude(id__in=taken)
    return Response([{'id': slot.id, 'starts_at': slot.starts_at.isoformat()} for slot in available])


@api_view(['POST'])
@throttle_classes([BookingThrottle])
def book(request):
    payload = BookingInput(data=request.data)
    payload.is_valid(raise_exception=True)
    verification_id = payload.validated_data.pop('verification_id')
    code = payload.validated_data.pop('verification_code')
    email = payload.validated_data['email'].strip().lower()
    payload.validated_data['email'] = email

    try:
        with transaction.atomic():
            verification = EmailVerification.objects.select_for_update().filter(pk=verification_id, email=email).first()
            if not verification or verification.used_at or verification.expires_at <= timezone.now() or verification.attempts >= 5:
                return Response({'detail': 'Email verification expired or is invalid. Request a new code.'}, status=400)
            verification.attempts += 1
            verification.save(update_fields=['attempts'])
            if not check_password(code, verification.code_hash):
                return Response({'detail': 'Incorrect verification code. Please check your email.'}, status=400)
            slot = TestDriveSlot.objects.select_for_update().get(pk=payload.validated_data['slot'].pk)
            car = Car.objects.select_for_update().get(pk=slot.car_id)
            if slot.blocked or slot.starts_at <= timezone.now() or car.status != 'available':
                return Response({'detail': 'This slot is no longer available. Please choose another.'}, status=409)
            booking_obj = payload.save(status='pending', email_verified_at=timezone.now())
            verification.used_at = timezone.now()
            verification.save(update_fields=['used_at'])
    except IntegrityError:
        return Response({'detail': 'This slot was just booked. Please choose another.'}, status=409)

    return Response({'reference': str(booking_obj.reference), 'status': booking_obj.status}, status=201)

from django.db import IntegrityError, OperationalError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes, authentication_classes
from rest_framework.authentication import SessionAuthentication
from showroom.customer_auth import customer_for
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from inventory.models import Car
from .models import Booking, TestDriveSlot


class BookingInput(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['slot', 'name', 'phone']


class BookingThrottle(AnonRateThrottle):
    scope = 'booking'


@api_view(['GET'])
def slots(request, slug):
    car = get_object_or_404(Car, slug=slug, status='available')
    taken = Booking.objects.filter(status__in=['pending', 'confirmed']).values('slot_id')
    available = car.slots.filter(blocked=False, starts_at__gt=timezone.now()).exclude(id__in=taken)
    return Response([{'id': slot.id, 'starts_at': slot.starts_at.isoformat()} for slot in available])


@api_view(['POST'])
@authentication_classes([])
@throttle_classes([BookingThrottle])
def book(request):
    customer = customer_for(request)
    if not customer:
        return Response({'detail': 'Please sign in before booking a test drive.'}, status=401)
    SessionAuthentication().enforce_csrf(request)
    if not customer.email:
        return Response({'detail': 'Please ask the showroom to add an email to your account before booking.'}, status=400)
    payload = BookingInput(data=request.data)
    payload.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            slot = TestDriveSlot.objects.select_for_update().get(pk=payload.validated_data['slot'].pk)
            car = Car.objects.select_for_update().get(pk=slot.car_id)
            if slot.blocked or slot.starts_at <= timezone.now() or car.status != 'available':
                return Response({'detail': 'This slot is no longer available. Please choose another.'}, status=409)
            verified = timezone.now() if request.session.get('customer_id') == customer.pk else None
            booking_obj = payload.save(status='pending', customer=customer, email=customer.email, email_verified_at=verified)
    except (IntegrityError, OperationalError):
        return Response({'detail': 'This slot was just booked. Please choose another.'}, status=409)

    return Response({'reference': str(booking_obj.reference), 'status': booking_obj.status}, status=201)

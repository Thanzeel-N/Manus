"""Session-authenticated API for the showroom's React workspace."""
import json
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.db.models import Count, Q, Sum
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Car, CarImage, Booking, Enquiry, TestDriveSlot


def identity(user):
    if not user.is_authenticated or not user.is_active or not user.is_staff:
        return None
    return {'id': user.pk, 'username': user.username, 'name': user.get_full_name() or user.username,
            'is_admin': user.is_superuser, 'permissions': sorted(user.get_all_permissions())}


@never_cache
@csrf_protect
@require_http_methods(['GET', 'POST'])
def session(request):
    if request.method == 'GET':
        return JsonResponse({'user': identity(request.user), 'csrf': get_token(request)})
    try:
        data = json.loads(request.body)
        if not isinstance(data, dict):
            raise ValueError()
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({'detail': 'Invalid request.'}, status=400)
    action = data.get('action')
    if action == 'logout':
        logout(request)
    elif action == 'login':
        # Throttle unsuccessful attempts by username and backend client address.
        username = str(data.get('username', ''))[:150]
        key = 'workspace-login:' + username.lower() + ':' + request.META.get('REMOTE_ADDR', '')
        failures = cache.get(key, 0)
        if failures >= 10:
            return JsonResponse({'detail': 'Too many attempts. Please try again in 15 minutes.'}, status=429)
        user = authenticate(request, username=username, password=data.get('password', ''))
        if user is None or not identity(user):
            cache.set(key, failures + 1, 900)
            return JsonResponse({'detail': 'Check your username and password. An active staff account is required.'}, status=400)
        cache.delete(key)
        login(request, user)
    elif action == 'password':
        if not identity(request.user):
            return JsonResponse({'detail': 'Please sign in.'}, status=401)
        if not request.user.check_password(data.get('current_password', '')):
            return JsonResponse({'detail': 'Your current password is incorrect.'}, status=400)
        try:
            validate_password(data.get('new_password', ''), request.user)
        except ValidationError as error:
            return JsonResponse({'detail': ' '.join(error.messages)}, status=400)
        request.user.set_password(data['new_password'])
        request.user.save(update_fields=['password'])
        update_session_auth_hash(request, request.user)
    else:
        return JsonResponse({'detail': 'Unknown action.'}, status=400)
    return JsonResponse({'user': identity(request.user), 'csrf': get_token(request)})


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'caption', 'position']


class CarSerializer(serializers.ModelSerializer):
    images = PhotoSerializer(many=True, read_only=True)
    class Meta:
        model = Car
        fields = ['id', 'slug', 'brand', 'name', 'variant', 'year', 'mileage', 'price', 'fuel',
                  'transmission', 'body', 'condition', 'status', 'description', 'features', 'video', 'is_sample', 'images']


class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = '__all__'
        read_only_fields = ['id', 'name', 'phone', 'email', 'interest', 'date', 'message', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source='slot.car.name', read_only=True)
    starts_at = serializers.DateTimeField(source='slot.starts_at', read_only=True)
    class Meta:
        model = Booking
        fields = ['id', 'reference', 'name', 'phone', 'email', 'status', 'starts_at', 'car_name', 'created_at', 'email_verified_at']
        read_only_fields = ['id', 'reference', 'name', 'phone', 'email', 'created_at', 'email_verified_at']


class SlotSerializer(serializers.ModelSerializer):
    car_name = serializers.CharField(source='car.name', read_only=True)
    booked = serializers.SerializerMethodField()
    class Meta:
        model = TestDriveSlot
        fields = ['id', 'car', 'car_name', 'starts_at', 'blocked', 'booked']

    def get_booked(self, obj):
        return any(x.status in ['pending', 'confirmed'] for x in obj.booking_set.all())

    def validate(self, attrs):
        instance = self.instance
        if instance and (attrs.get('car', instance.car).pk != instance.car_id or attrs.get('starts_at', instance.starts_at) != instance.starts_at):
            if instance.booking_set.exists():
                raise serializers.ValidationError('Appointments with booking history cannot be moved. Create a new slot instead.')
        starts_at = attrs.get('starts_at', instance.starts_at if instance else None)
        if starts_at:
            if (not instance or 'starts_at' in attrs) and starts_at <= timezone.now():
                raise serializers.ValidationError('Choose a future appointment time.')
            local = timezone.localtime(starts_at)
            if local.minute or local.second or not 10 <= local.hour <= 17:
                raise serializers.ValidationError('Slots start on the hour, from 10:00 to 17:00 IST.')
        return attrs


def allowed(user, action, model):
    return user.has_perm(f'showroom.{action}_{model._meta.model_name}')


@never_cache
@api_view(['GET'])
@permission_classes([IsAdminUser])
def overview(request):
    user = request.user
    data = {}
    if allowed(user, 'view', Car):
        data['inventory'] = {x['status']: x['total'] for x in Car.objects.values('status').annotate(total=Count('id'))}
        data['stock_value'] = Car.objects.filter(status='available').aggregate(total=Sum('price'))['total'] or 0
        data['cars'] = CarSerializer(Car.objects.prefetch_related('images')[:4], many=True).data
    if allowed(user, 'view', Enquiry):
        data['enquiries'] = {x['status']: x['total'] for x in Enquiry.objects.values('status').annotate(total=Count('id'))}
        data['recent_enquiries'] = EnquirySerializer(Enquiry.objects.all()[:4], many=True).data
    if allowed(user, 'view', Booking):
        data['bookings'] = {x['status']: x['total'] for x in Booking.objects.values('status').annotate(total=Count('id'))}
        data['upcoming'] = BookingSerializer(Booking.objects.filter(status__in=['pending', 'confirmed'], slot__starts_at__gte=timezone.now()).select_related('slot__car').order_by('slot__starts_at')[:5], many=True).data
    return Response(data)


COLLECTIONS = {
    'inventory': (Car, CarSerializer, ['name', 'brand', 'variant', 'slug']),
    'enquiries': (Enquiry, EnquirySerializer, ['name', 'email', 'phone', 'interest']),
    'test-drives': (Booking, BookingSerializer, ['name', 'email', 'phone', 'slot__car__name']),
    'slots': (TestDriveSlot, SlotSerializer, ['car__name']),
}


@never_cache
@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def records(request, section, pk=None):
    if section not in COLLECTIONS:
        return Response({'detail': 'Not found.'}, status=404)
    model, serializer, search = COLLECTIONS[section]
    action = {'GET': 'view', 'POST': 'add', 'PATCH': 'change'}[request.method]
    if not allowed(request.user, action, model):
        return Response({'detail': 'You do not have permission for this action.'}, status=403)
    query = model.objects.all()
    if model is Car:
        query = query.prefetch_related('images')
    if model is Booking:
        query = query.select_related('slot__car')
    if model is TestDriveSlot:
        query = query.select_related('car').prefetch_related('booking_set')
    if request.method == 'GET':
        if pk:
            return Response(serializer(get_object_or_404(query, pk=pk)).data)
        lookup = Q()
        for field in search:
            lookup |= Q(**{field + '__icontains': request.GET.get('q', '')})
        query = query.filter(lookup)
        status = request.GET.get('status')
        if status and model is not TestDriveSlot:
            query = query.filter(status=status)
        elif model is TestDriveSlot:
            if status in ['open', 'blocked']:
                query = query.filter(blocked=status == 'blocked')
            if request.GET.get('upcoming') != 'all':
                query = query.filter(starts_at__gte=timezone.now())
        page = Paginator(query, 12).get_page(request.GET.get('page'))
        return Response({'results': serializer(page, many=True).data, 'count': page.paginator.count,
                         'pages': page.paginator.num_pages, 'page': page.number})
    if request.method == 'POST' and (pk or model not in [Car, TestDriveSlot]):
        return Response({'detail': 'Creation is not available here.'}, status=405)
    if request.method == 'PATCH' and not pk:
        return Response({'detail': 'A record ID is required.'}, status=400)
    try:
        with transaction.atomic():
            item = get_object_or_404(model.objects.select_for_update(), pk=pk) if pk else None
            payload = serializer(item, data=request.data, partial=request.method == 'PATCH')
            payload.is_valid(raise_exception=True)
            if model is Booking and payload.validated_data.get('status') in ['pending', 'confirmed']:
                slot = TestDriveSlot.objects.select_for_update().get(pk=item.slot_id)
                car = Car.objects.select_for_update().get(pk=slot.car_id)
                if slot.blocked or slot.starts_at <= timezone.now() or car.status != 'available':
                    return Response({'detail': 'This appointment is past, blocked, or the car is unavailable.'}, status=409)
            saved = payload.save()
            return Response(serializer(saved).data, status=201 if not pk else 200)
    except IntegrityError:
        return Response({'detail': 'This slot is already booked or the record conflicts with an existing entry.'}, status=409)


@never_cache
@api_view(['POST', 'DELETE'])
@permission_classes([IsAdminUser])
def photos(request, pk, photo_id=None):
    action = 'add' if request.method == 'POST' else 'delete'
    if not allowed(request.user, 'change', Car) or not allowed(request.user, action, CarImage):
        return Response({'detail': 'You do not have permission to manage these photos.'}, status=403)
    car = get_object_or_404(Car, pk=pk)
    if request.method == 'DELETE':
        get_object_or_404(CarImage, pk=photo_id, car=car).delete()
        return Response(status=204)
    files = request.FILES.getlist('photos')
    if not 1 <= len(files) <= 20:
        return Response({'detail': 'Select between 1 and 20 photos.'}, status=400)
    prepared = []
    for file in files:
        photo = PhotoSerializer(data={'image': file})
        photo.is_valid(raise_exception=True)
        prepared.append(photo)
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=pk)
        last = car.images.order_by('-position').first()
        offset = last.position + 1 if last else 0
        for index, photo in enumerate(prepared):
            photo.save(car=car, position=offset + index)
    return Response(PhotoSerializer(car.images.all(), many=True).data, status=201)


class StaffSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_superuser', 'last_login', 'password']
        read_only_fields = ['id', 'is_superuser', 'last_login']

    def validate(self, attrs):
        if not self.instance and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'An initial password is required.'})
        if 'password' in attrs:
            user = User(username=attrs.get('username', self.instance.username if self.instance else ''), email=attrs.get('email', ''))
            try:
                validate_password(attrs['password'], user)
            except ValidationError as error:
                raise serializers.ValidationError({'password': error.messages})
        return attrs


@never_cache
@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAdminUser])
def staff(request, pk=None):
    if not request.user.is_superuser:
        return Response({'detail': 'Only administrators can manage staff accounts.'}, status=403)
    if request.method == 'GET':
        return Response(StaffSerializer(User.objects.filter(is_staff=True).order_by('username'), many=True).data)
    if (request.method == 'PATCH' and not pk) or (request.method == 'POST' and pk):
        return Response({'detail': 'Invalid staff action.'}, status=400)
    with transaction.atomic():
        user = get_object_or_404(User.objects.select_for_update(), pk=pk, is_staff=True) if pk else None
        if user and user.is_superuser:
            return Response({'detail': 'Administrator accounts cannot be changed here. Use My account to change your password.'}, status=403)
        serializer = StaffSerializer(user, data=request.data, partial=bool(pk))
        serializer.is_valid(raise_exception=True)
        values = dict(serializer.validated_data)
        password = values.pop('password', None)
        if not user:
            group = Group.objects.filter(name='Showroom staff').first()
            if not group:
                return Response({'detail': 'Run setup_staff before adding staff accounts.'}, status=503)
            user = User(is_staff=True)
        for key, value in values.items():
            setattr(user, key, value)
        if password:
            user.set_password(password)
        user.save()
        if not pk:
            user.groups.add(group)
    return Response(StaffSerializer(user).data, status=200 if pk else 201)

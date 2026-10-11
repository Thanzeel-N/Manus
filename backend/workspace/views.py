"""Session-authenticated API and dashboard views for the showroom's React workspace."""
import json
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.db.models import Count, Q, Sum
from django.http import HttpResponseForbidden, JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_http_methods
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from inventory.models import Car, CarImage
from bookings.models import Booking, TestDriveSlot
from enquiries.models import Enquiry
from .models import StaffProfile, Alert
from .alerts import is_admin, notify


def identity(user):
    if not user.is_authenticated or not user.is_active or not user.is_staff:
        return None
    return {
        'id': user.pk,
        'username': user.username,
        'name': user.get_full_name() or user.username,
        'is_admin': is_admin(user),
        'is_owner': user.is_superuser,
        'phone': getattr(getattr(user, 'workspace_profile', None), 'phone', ''),
        'permissions': sorted(user.get_all_permissions()),
    }


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

    def validate_year(self, value):
        if value > 2100:
            raise serializers.ValidationError('Year must be between 1900 and 2100.')
        return value

    class Meta:
        model = Car
        fields = [
            'id', 'slug', 'brand', 'name', 'variant', 'year', 'mileage', 'price', 'fuel',
            'transmission', 'body', 'condition', 'status', 'description', 'features', 'video', 'is_sample', 'is_featured', 'images',
        ]


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
    return is_admin(user) or user.has_perm(f'showroom.{action}_{model._meta.model_name}') or user.has_perm(f'{model._meta.app_label}.{action}_{model._meta.model_name}')


@never_cache
@api_view(['GET'])
@permission_classes([IsAdminUser])
def overview(request):
    user = request.user
    data = {}
    if allowed(user, 'view', Car):
        data['inventory'] = {x['status']: x['total'] for x in Car.objects.values('status').annotate(total=Count('id'))}
        data['inventory']['featured'] = Car.objects.filter(is_featured=True).count()
        if is_admin(user) or user.is_superuser:
            data['stock_value'] = Car.objects.filter(status='available').aggregate(total=Sum('price'))['total'] or 0
        data['cars'] = CarSerializer(Car.objects.prefetch_related('images')[:4], many=True).data
    if allowed(user, 'view', Enquiry):
        data['enquiries'] = {x['status']: x['total'] for x in Enquiry.objects.values('status').annotate(total=Count('id'))}
        data['recent_enquiries'] = EnquirySerializer(Enquiry.objects.all()[:4], many=True).data
    if allowed(user, 'view', Booking):
        data['bookings'] = {x['status']: x['total'] for x in Booking.objects.values('status').annotate(total=Count('id'))}
        data['upcoming'] = BookingSerializer(
            Booking.objects.filter(status__in=['pending', 'confirmed'], slot__starts_at__gte=timezone.now())
            .select_related('slot__car')
            .order_by('slot__starts_at')[:5],
            many=True,
        ).data
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
        if status == 'featured' and model is Car:
            query = query.filter(is_featured=True)
        elif status and model is not TestDriveSlot:
            query = query.filter(status=status)
        elif model is TestDriveSlot:
            if status in ['open', 'blocked']:
                query = query.filter(blocked=status == 'blocked')
            if request.GET.get('upcoming') != 'all':
                query = query.filter(starts_at__gte=timezone.now())
        page = Paginator(query, 12).get_page(request.GET.get('page'))
        return Response({
            'results': serializer(page, many=True).data,
            'count': page.paginator.count,
            'pages': page.paginator.num_pages,
            'page': page.number,
        })
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


STAFF_ACCESS = {
    'inventory.view': ['view_car', 'view_carimage'],
    'inventory.add': ['add_car'],
    'inventory.edit': ['change_car', 'add_carimage', 'change_carimage'],
    'enquiries.view': ['view_enquiry'],
    'enquiries.edit': ['change_enquiry'],
    'test-drives.view': ['view_booking'],
    'test-drives.edit': ['change_booking'],
    'slots.view': ['view_testdriveslot'],
    'slots.add': ['add_testdriveslot'],
    'slots.edit': ['change_testdriveslot'],
}


def access_permissions(access):
    codes = set()
    for key in access:
        codes.update(STAFF_ACCESS[key])
        # Editors and creators must be able to open their dashboard section.
        codes.update(STAFF_ACCESS[key.split('.')[0] + '.view'])
    if 'slots.add' in access:
        codes.update(STAFF_ACCESS['inventory.view'])
    return codes


class StaffSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, validators=StaffProfile._meta.get_field('phone').validators)
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    access = serializers.ListField(child=serializers.ChoiceField(choices=list(STAFF_ACCESS)), required=False, write_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_superuser', 'is_admin', 'phone', 'last_login', 'password', 'access']
        read_only_fields = ['id', 'is_superuser', 'last_login']

    def to_representation(self, instance):
        result = super().to_representation(instance)
        profile = getattr(instance, 'workspace_profile', None)
        result['is_admin'] = instance.is_superuser or bool(profile and profile.is_admin)
        result['phone'] = profile.phone if profile else ''
        # Query assigned permissions even for inactive accounts so reactivation
        # doesn't accidentally discard an employee's saved access settings.
        codes = set(instance.user_permissions.filter(content_type__app_label='showroom').values_list('codename', flat=True))
        codes.update(Permission.objects.filter(group__user=instance, content_type__app_label='showroom').values_list('codename', flat=True))
        result['access'] = [key for key, permissions in STAFF_ACCESS.items() if instance.is_superuser or permissions[0] in codes]
        return result

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
    if not is_admin(request.user):
        return Response({'detail': 'Only administrators can manage staff accounts.'}, status=403)
    if request.method == 'GET':
        return Response(StaffSerializer(User.objects.filter(is_staff=True).order_by('username'), many=True).data)
    if (request.method == 'PATCH' and not pk) or (request.method == 'POST' and pk):
        return Response({'detail': 'Invalid staff action.'}, status=400)
    with transaction.atomic():
        user = get_object_or_404(User.objects.select_for_update(), pk=pk, is_staff=True) if pk else None
        if user and (user.pk == request.user.pk or ((user.is_superuser or StaffProfile.objects.filter(user=user, is_admin=True).exists()) and not request.user.is_superuser)):
            return Response({'detail': 'Only the owner can change administrator accounts. Use My account for your own profile.'}, status=403)
        if user and user.is_superuser:
            return Response({'detail': 'Administrator accounts cannot be changed here. Use My account to change your password.'}, status=403)
        serializer = StaffSerializer(user, data=request.data, partial=bool(pk))
        serializer.is_valid(raise_exception=True)
        values = dict(serializer.validated_data)
        admin_role = values.pop('is_admin', None)
        phone = values.pop('phone', None)
        if admin_role is not None and not request.user.is_superuser:
            return Response({'detail': 'Only the owner can assign administrator access.'}, status=403)
        password = values.pop('password', None)
        access = values.pop('access', None)
        if access is not None and user:
            requested_codes = access_permissions(access)
            inherited = Permission.objects.filter(group__in=user.groups.exclude(name='Showroom staff'), content_type__app_label='showroom')
            if inherited.exclude(codename__in=requested_codes).exists():
                return Response({'detail': 'This employee inherits additional showroom permissions from a custom group. Remove or adjust that group in advanced administration before restricting access here.'}, status=400)
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
        profile, _ = StaffProfile.objects.get_or_create(user=user)
        if admin_role is not None:
            profile.is_admin = admin_role
        if phone is not None:
            profile.phone = phone
        profile.save()
        if access is not None:
            user.groups.remove(*user.groups.filter(name='Showroom staff'))
            # Replace showroom permissions only; never alter unrelated app access.
            user.user_permissions.remove(*user.user_permissions.filter(content_type__app_label='showroom'))
            user.user_permissions.add(*Permission.objects.filter(content_type__app_label='showroom', codename__in=access_permissions(access)))
        elif not pk:
            user.groups.add(group)
        notify(f'{request.user.username} {"updated" if pk else "created"} staff account {user.username}. Role: {"administrator" if profile.is_admin else "staff"}. Active: {user.is_active}.')
    return Response(StaffSerializer(user).data, status=200 if pk else 201)


@never_cache
@api_view(['GET', 'PATCH'])
@permission_classes([IsAdminUser])
def notifications(request, pk=None):
    if not is_admin(request.user):
        return Response({'detail': 'Only owners and administrators can read alerts.'}, status=403)
    query = Alert.objects.filter(recipient=request.user)
    if request.method == 'PATCH':
        alert = get_object_or_404(query, pk=pk)
        alert.read_at = timezone.now()
        alert.save(update_fields=['read_at'])
        return Response({'id': alert.pk, 'read_at': alert.read_at})
    page = Paginator(query, 30).get_page(request.GET.get('page'))
    from django.conf import settings
    return Response({'results': list(page.object_list.values('id', 'message', 'created_at', 'read_at', 'sms_status', 'last_error')),
                     'page': page.number, 'pages': page.paginator.num_pages,
                     'unread': query.filter(read_at__isnull=True).count(), 'sms_enabled': settings.SMS_ENABLED})


@never_cache
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def profile(request):
    payload = StaffSerializer(request.user, data={'phone': request.data.get('phone', '')}, partial=True)
    payload.is_valid(raise_exception=True)
    StaffProfile.objects.update_or_create(user=request.user, defaults={'phone': payload.validated_data['phone']})
    return Response({'phone': payload.validated_data['phone']})


@never_cache
@staff_member_required
@require_http_methods(['GET', 'POST'])
def dashboard(request):
    sections = {
        'inventory': (Car, 'car', ['name', 'brand', 'variant']),
        'enquiries': (Enquiry, 'enquiry', ['name', 'phone', 'email', 'interest', 'message']),
        'test-drives': (Booking, 'booking', ['name', 'phone', 'email', 'slot__car__name']),
    }
    section = request.GET.get('section', 'overview')
    if section not in sections:
        section = 'overview'
    if request.method == 'POST':
        if section not in sections:
            return HttpResponseForbidden('Choose a section.')
        model, codename, _ = sections[section]
        if not allowed(request.user, 'change', model):
            return HttpResponseForbidden('You do not have permission to update these records.')
        try:
            with transaction.atomic():
                item = get_object_or_404(model.objects.select_for_update(), pk=request.POST.get('id'))
                status = request.POST.get('status')
                if status not in dict(model._meta.get_field('status').choices):
                    messages.error(request, 'Choose a valid status.')
                elif model is Booking and status in ['pending', 'confirmed'] and (
                    item.slot.blocked or item.slot.starts_at <= timezone.now() or item.slot.car.status != 'available'
                ):
                    messages.error(request, 'This booking cannot be activated: the slot is past, blocked, or the car is unavailable.')
                else:
                    item.status = status
                    fields = ['status']
                    if model is Enquiry:
                        item.notes = request.POST.get('notes', '')[:5000]
                        fields.append('notes')
                    item.save(update_fields=fields)
                    messages.success(request, 'Changes saved.')
        except (ValueError, IntegrityError):
            messages.error(request, 'Unable to save. The record is invalid or this slot already has a booking.')
        return redirect(request.get_full_path())

    can = {key: allowed(request.user, 'view', model) for key, (model, code, _) in sections.items()}
    context = {'section': section, 'can': can, 'q': request.GET.get('q', ''), 'selected_status': request.GET.get('status', '')}
    if section in sections:
        model, codename, search = sections[section]
        if not can[section]:
            return HttpResponseForbidden('Ask your administrator for access to this section.')
        records_query = model.objects.all()
        if model is Booking:
            records_query = records_query.select_related('slot__car')
        if model is Car:
            records_query = records_query.prefetch_related('images')
        query = Q()
        for field in search:
            query |= Q(**{f'{field}__icontains': context['q']})
        records_query = records_query.filter(query)
        choices = model._meta.get_field('status').choices
        if context['selected_status'] in dict(choices):
            records_query = records_query.filter(status=context['selected_status'])
        context.update(
            page=Paginator(records_query, 20).get_page(request.GET.get('page')),
            choices=choices,
            can_edit=allowed(request.user, 'change', model),
        )
    context['stats'] = [
        {'label': 'Available cars', 'value': Car.objects.filter(status='available').count(), 'section': 'inventory'} if can['inventory'] else None,
        {'label': 'New enquiries', 'value': Enquiry.objects.filter(status='new').count(), 'section': 'enquiries'} if can['enquiries'] else None,
        {'label': 'Pending test drives', 'value': Booking.objects.filter(status='pending').count(), 'section': 'test-drives'} if can['test-drives'] else None,
        {'label': 'Upcoming confirmed', 'value': Booking.objects.filter(status='confirmed', slot__starts_at__gte=timezone.now()).count(), 'section': 'test-drives'} if can['test-drives'] else None,
    ]
    return render(request, 'showroom/dashboard.html', context)

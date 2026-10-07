from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from .models import Car, Booking, Enquiry
from .views import BookingThrottle


class EnquiryInput(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['name', 'phone', 'email', 'interest', 'date', 'message']

    def validate_date(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError('Please choose today or a future date.')
        return value


@api_view(['POST'])
@throttle_classes([BookingThrottle])
def enquire(request):
    data = EnquiryInput(data=request.data)
    data.is_valid(raise_exception=True)
    enquiry = data.save()
    return Response({'reference': enquiry.pk, 'status': enquiry.status}, status=201)


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
        if not request.user.has_perm(f'showroom.change_{codename}'):
            return HttpResponseForbidden('You do not have permission to update these records.')
        try:
            with transaction.atomic():
                item = get_object_or_404(model.objects.select_for_update(), pk=request.POST.get('id'))
                status = request.POST.get('status')
                if status not in dict(model._meta.get_field('status').choices):
                    messages.error(request, 'Choose a valid status.')
                elif model is Booking and status in ['pending', 'confirmed'] and (item.slot.blocked or item.slot.starts_at <= timezone.now() or item.slot.car.status != 'available'):
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

    can = {key: request.user.has_perm(f'showroom.view_{code}') for key, (_, code, _) in sections.items()}
    context = {'section': section, 'can': can, 'q': request.GET.get('q', ''), 'selected_status': request.GET.get('status', '')}
    if section in sections:
        model, codename, search = sections[section]
        if not can[section]:
            return HttpResponseForbidden('Ask your administrator for access to this section.')
        records = model.objects.all()
        if model is Booking:
            records = records.select_related('slot__car')
        if model is Car:
            records = records.prefetch_related('images')
        query = Q()
        for field in search:
            query |= Q(**{f'{field}__icontains': context['q']})
        records = records.filter(query)
        choices = model._meta.get_field('status').choices
        if context['selected_status'] in dict(choices):
            records = records.filter(status=context['selected_status'])
        context.update(page=Paginator(records, 20).get_page(request.GET.get('page')), choices=choices,
                       can_edit=request.user.has_perm(f'showroom.change_{codename}'))
    context['stats'] = [
        {'label': 'Available cars', 'value': Car.objects.filter(status='available').count(), 'section': 'inventory'} if can['inventory'] else None,
        {'label': 'New enquiries', 'value': Enquiry.objects.filter(status='new').count(), 'section': 'enquiries'} if can['enquiries'] else None,
        {'label': 'Pending test drives', 'value': Booking.objects.filter(status='pending').count(), 'section': 'test-drives'} if can['test-drives'] else None,
        {'label': 'Upcoming confirmed', 'value': Booking.objects.filter(status='confirmed', slot__starts_at__gte=timezone.now()).count(), 'section': 'test-drives'} if can['test-drives'] else None,
    ]
    context['recent_enquiries'] = Enquiry.objects.all()[:5] if can['enquiries'] else []
    context['upcoming'] = Booking.objects.filter(status__in=['pending', 'confirmed'], slot__starts_at__gte=timezone.now()).select_related('slot__car').order_by('slot__starts_at')[:5] if can['test-drives'] else []
    context['can_drives'] = can['test-drives']
    return render(request, 'showroom/dashboard.html', context)

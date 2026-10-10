"""Record alerts in the same transaction as the staff edit, including Django admin."""
from contextvars import ContextVar
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from inventory.models import Car, CarImage
from bookings.models import Booking
from enquiries.models import Enquiry
from .models import Alert, StaffProfile

actor = ContextVar('workspace_actor', default=None)


def is_admin(user):
    return user.is_authenticated and user.is_active and user.is_staff and (
        user.is_superuser or StaffProfile.objects.filter(user=user, is_admin=True).exists())


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = actor.set(request.user if request.user.is_authenticated and request.user.is_staff else None)
        try:
            tracked = request.path.startswith(('/api/workspace/', '/admin/', '/dashboard/'))
            if not actor.get() or not tracked or request.method in ('GET', 'HEAD', 'OPTIONS') or request.path == '/api/workspace/session/':
                return self.get_response(request)
            with transaction.atomic():
                response = self.get_response(request)
                if response.status_code >= 400:
                    transaction.set_rollback(True)
                return response
        finally:
            actor.reset(token)


def notify(message):
    recipients = User.objects.filter(is_active=True, is_staff=True).filter(
        Q(is_superuser=True) | Q(workspace_profile__is_admin=True)).select_related('workspace_profile').distinct()
    alerts = []
    for user in recipients:
        profile = getattr(user, 'workspace_profile', None)
        phone = profile.phone if profile else ''
        alerts.append(Alert(recipient=user, message=message, phone=phone,
                            sms_status='pending' if phone else 'no_phone'))
    Alert.objects.bulk_create(alerts)


@receiver(pre_save)
def remember_changes(sender, instance, raw=False, **kwargs):
    if raw or sender not in (Car, Booking, Enquiry) or not actor.get():
        return
    old = sender.objects.filter(pk=instance.pk).first() if instance.pk else None
    instance._alert_changes = [f.name for f in sender._meta.concrete_fields
                               if not f.primary_key and old and getattr(old, f.attname) != getattr(instance, f.attname)]
    instance._alert_old_status = old.status if old else None


@receiver(post_save)
def record_change(sender, instance, created=False, raw=False, **kwargs):
    user = actor.get()
    if raw or not user or sender not in (Car, CarImage, Booking, Enquiry):
        return
    who = user.get_full_name() or user.username
    changes = getattr(instance, '_alert_changes', [])
    if sender is Car and (created or changes):
        notify(f'{who} {"added" if created else "updated"} car #{instance.pk} {instance.name}. Fields: {", ".join(changes) if changes else "new listing"}.')
    elif sender is CarImage:
        notify(f'{who} {"added" if created else "updated"} a photo for car #{instance.car_id} {instance.car.name}.')
    elif sender in (Booking, Enquiry) and not created and 'status' in changes:
        kind = 'Test drive' if sender is Booking else 'Enquiry'
        notify(f'{who} changed {kind} #{instance.pk}: {instance._alert_old_status} → {instance.status}.')


@receiver(post_delete, sender=CarImage)
def photo_removed(sender, instance, **kwargs):
    user = actor.get()
    if user:
        notify(f'{user.get_full_name() or user.username} removed a photo from car #{instance.car_id}.')

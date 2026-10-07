import uuid

from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from inventory.models import Car


class TestDriveSlot(models.Model):
    car = models.ForeignKey(Car, related_name='slots', on_delete=models.CASCADE)
    starts_at = models.DateTimeField()
    blocked = models.BooleanField(default=False)

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_testdriveslot'
        ordering = ['starts_at']
        constraints = [models.UniqueConstraint(fields=['car', 'starts_at'], name='unique_car_slot')]

    def clean(self):
        from django.utils import timezone
        local = timezone.localtime(self.starts_at) if self.starts_at else None
        if local and (local.minute != 0 or local.second != 0 or not 10 <= local.hour <= 17):
            raise ValidationError('Choose a one-hour slot starting between 10:00 and 17:00 showroom time.')

    def __str__(self):
        from django.utils import timezone
        return f'{self.car} — {timezone.localtime(self.starts_at):%d %b %Y %H:%M}'


class Booking(models.Model):
    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    slot = models.ForeignKey(TestDriveSlot, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?[0-9 ()-]{7,20}$', 'Enter a valid phone number.')],
    )
    status = models.CharField(
        max_length=15,
        choices=[(x, x) for x in ['pending', 'confirmed', 'cancelled']],
        default='pending',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    email_verified_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_booking'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['slot'],
                condition=models.Q(status__in=['pending', 'confirmed']),
                name='one_active_booking_per_slot',
            )
        ]

    def __str__(self):
        return f'{self.name} — {self.slot}'

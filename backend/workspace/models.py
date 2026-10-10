from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class StaffProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_profile')
    is_admin = models.BooleanField(default=False)
    phone = models.CharField(max_length=16, blank=True, validators=[RegexValidator(r'^\+[1-9]\d{7,14}$', 'Use international format, for example +919876543210.')])


class Alert(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=16, blank=True)
    sms_status = models.CharField(max_length=20, default='pending', db_index=True)
    provider_id = models.CharField(max_length=64, blank=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-created_at', '-pk']

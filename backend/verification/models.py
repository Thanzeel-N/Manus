import uuid
from django.db import models
from django.conf import settings


class EmailVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)
    purpose = models.CharField(max_length=16, default='booking', choices=[('booking', 'Booking'), ('signup', 'Account registration')])
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='email_verifications')

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_emailverification'

    def __str__(self):
        return f'{self.email} ({self.created_at})'

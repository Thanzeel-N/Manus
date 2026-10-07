from django.core.validators import RegexValidator
from django.db import models


class Enquiry(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?[0-9 ()-]{7,20}$', 'Enter a valid phone number.')],
    )
    email = models.EmailField(blank=True)
    interest = models.CharField(max_length=180)
    date = models.DateField(null=True, blank=True)
    message = models.TextField(max_length=5000, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[(x, x) for x in ['new', 'contacted', 'closed']],
        default='new',
    )
    notes = models.TextField(blank=True, max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_enquiry'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.interest}'

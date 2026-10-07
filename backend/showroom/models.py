import uuid
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinValueValidator, RegexValidator
from django.db import models

def image_size(file):
    if file.size > 10 * 1024 * 1024:
        raise ValidationError('Each photo must be 10 MB or smaller.')

def video_size(file):
    if file.size > 100 * 1024 * 1024:
        raise ValidationError('Video must be 100 MB or smaller.')

class Car(models.Model):
    slug = models.SlugField(unique=True)
    brand = models.CharField(max_length=80)
    name = models.CharField(max_length=160)
    variant = models.CharField(max_length=160, blank=True)
    year = models.PositiveIntegerField(validators=[MinValueValidator(1900)])
    mileage = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)], help_text='Price in lakh INR')
    fuel = models.CharField(max_length=20, choices=[(x, x) for x in ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']])
    transmission = models.CharField(max_length=20, choices=[('Automatic', 'Automatic'), ('Manual', 'Manual')], default='Automatic')
    body = models.CharField(max_length=20, choices=[(x, x) for x in ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'MPV']])
    condition = models.CharField(max_length=10, choices=[('Used', 'Used'), ('New', 'New')], default='Used')
    status = models.CharField(max_length=20, choices=[(x, x) for x in ['available', 'reserved', 'sold', 'draft']], default='draft')
    description = models.TextField(blank=True)
    features = models.TextField(blank=True, help_text='One feature per line')
    video = models.FileField(upload_to='cars/videos/', blank=True, validators=[FileExtensionValidator(['mp4', 'webm']), video_size], help_text='Optional short walkaround: MP4 or WebM, up to 100 MB')
    is_sample = models.BooleanField(default=False)
    class Meta:
        ordering = ['-year', 'name']
    def __str__(self):
        return self.name

class CarImage(models.Model):
    car = models.ForeignKey(Car, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cars/photos/', validators=[image_size, FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])])
    caption = models.CharField(max_length=180, blank=True)
    position = models.PositiveIntegerField(default=0, help_text='Lowest position is the cover photo')
    class Meta:
        ordering = ['position', 'id']

class TestDriveSlot(models.Model):
    car = models.ForeignKey(Car, related_name='slots', on_delete=models.CASCADE)
    starts_at = models.DateTimeField()
    blocked = models.BooleanField(default=False)
    class Meta:
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
    phone = models.CharField(max_length=20, validators=[RegexValidator(r'^\+?[0-9 ()-]{7,20}$', 'Enter a valid phone number.')])
    status = models.CharField(max_length=15, choices=[(x, x) for x in ['pending', 'confirmed', 'cancelled']], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    email_verified_at = models.DateTimeField(null=True, blank=True, editable=False)
    class Meta:
        ordering = ['-created_at']
        constraints = [models.UniqueConstraint(fields=['slot'], condition=models.Q(status__in=['pending', 'confirmed']), name='one_active_booking_per_slot')]
    def __str__(self):
        return f'{self.name} — {self.slot}'

class EmailVerification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(db_index=True)
    code_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used_at = models.DateTimeField(null=True, blank=True)

class Enquiry(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, validators=[RegexValidator(r'^\+?[0-9 ()-]{7,20}$', 'Enter a valid phone number.')])
    email = models.EmailField(blank=True)
    interest = models.CharField(max_length=180)
    date = models.DateField(null=True, blank=True)
    message = models.TextField(max_length=5000, blank=True)
    status = models.CharField(max_length=20, choices=[(x, x) for x in ['new', 'contacted', 'closed']], default='new')
    notes = models.TextField(blank=True, max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.interest}'

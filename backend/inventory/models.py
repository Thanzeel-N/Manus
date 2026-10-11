from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinValueValidator
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
    is_featured = models.BooleanField(default=False, help_text='Show in featured curated selection on the home page')

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_car'
        ordering = ['-year', 'name']

    def __str__(self):
        return self.name


class CarImage(models.Model):
    car = models.ForeignKey(Car, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cars/photos/', validators=[image_size, FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])])
    caption = models.CharField(max_length=180, blank=True)
    position = models.PositiveIntegerField(default=0, help_text='Lowest position is the cover photo')

    class Meta:
        app_label = 'showroom'
        db_table = 'showroom_carimage'
        ordering = ['position', 'id']

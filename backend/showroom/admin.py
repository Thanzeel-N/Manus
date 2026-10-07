from django import forms
from django.contrib import admin
from .models import Car, CarImage, TestDriveSlot, Booking, Enquiry

class MultipleImageInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleImageField(forms.ImageField):
    def __init__(self, *args, **kwargs):
        kwargs['widget'] = MultipleImageInput(attrs={'accept': 'image/jpeg,image/png,image/webp'})
        super().__init__(*args, **kwargs)
    def clean(self, data, initial=None):
        if not data:
            return []
        files = data if isinstance(data, (list, tuple)) else [data]
        if len(files) > 20:
            raise forms.ValidationError('Upload up to 20 photos at a time.')
        return [super(MultipleImageField, self).clean(file, initial) for file in files]

class CarForm(forms.ModelForm):
    from .models import image_size
    photos = MultipleImageField(required=False, validators=[image_size], help_text='Select multiple JPG, PNG or WebP photos. Up to 20 at once, 10 MB each.')
    class Meta:
        model = Car
        fields = '__all__'

class ImageInline(admin.TabularInline):
    model = CarImage
    extra = 0

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    form = CarForm
    inlines = [ImageInline]
    list_display = ['name', 'year', 'price', 'status', 'is_sample']
    list_filter = ['status', 'brand', 'fuel', 'condition']
    search_fields = ['name', 'brand', 'variant']
    prepopulated_fields = {'slug': ['name', 'year']}
    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        offset = form.instance.images.count()
        for index, file in enumerate(form.cleaned_data.get('photos', [])):
            CarImage.objects.create(car=form.instance, image=file, position=offset + index)

@admin.register(TestDriveSlot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ['car', 'starts_at', 'blocked']
    list_filter = ['car', 'blocked', 'starts_at']
    list_editable = ['blocked']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['reference', 'name', 'slot', 'status', 'email_verified_at', 'created_at']
    list_filter = ['status', 'slot__starts_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['reference', 'created_at', 'email_verified_at']
    def has_add_permission(self, request):
        return False
    def save_model(self, request, obj, form, change):
        if change and 'email' in form.changed_data:
            obj.email_verified_at = None
        super().save_model(request, obj, form, change)

admin.site.site_header = "Manu’s Car World"
admin.site.site_title = 'Showroom management'
admin.site.site_url = '/dashboard/'

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'interest', 'phone', 'status', 'date', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'phone', 'email', 'interest']
    readonly_fields = ['created_at']

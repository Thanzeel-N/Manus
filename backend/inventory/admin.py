from django import forms
from django.contrib import admin
from .models import Car, CarImage, image_size


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
    photos = MultipleImageField(
        required=False,
        validators=[image_size],
        help_text='Select multiple JPG, PNG or WebP photos. Up to 20 at once, 10 MB each.',
    )

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

from django.contrib import admin
from inventory.admin import MultipleImageField, CarForm

admin.site.site_header = "Manu’s Car World"
admin.site.site_title = 'Showroom management'
admin.site.site_url = '/dashboard/'

__all__ = ['MultipleImageField', 'CarForm']

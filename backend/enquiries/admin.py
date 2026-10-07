from django.contrib import admin
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'interest', 'phone', 'status', 'date', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'phone', 'email', 'interest']
    readonly_fields = ['created_at']

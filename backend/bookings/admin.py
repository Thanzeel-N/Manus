from django.contrib import admin
from .models import Booking, TestDriveSlot


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

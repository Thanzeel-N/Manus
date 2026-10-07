from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from workspace.views import dashboard

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', dashboard, name='dashboard'),
    path('api/cars/', include('inventory.urls')),
    path('api/', include('bookings.urls')),
    path('api/enquiries/', include('enquiries.urls')),
    path('api/verification/', include('verification.urls')),
    path('api/workspace/', include('workspace.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

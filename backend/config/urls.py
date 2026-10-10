from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from workspace.views import dashboard
from showroom import customer_auth

urlpatterns = [
    path('api/customer/register/', customer_auth.register),
    path('api/customer/registration-code/', customer_auth.registration_code),
    path('api/customer/password/', customer_auth.password_login),
    path('api/customer/account-logout/', customer_auth.account_logout),
    path('api/customer/session/', customer_auth.session),
    path('api/customer/google/', customer_auth.google_login),
    path('api/customer/logout/', customer_auth.logout),
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

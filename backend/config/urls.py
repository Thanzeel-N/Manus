from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from showroom import views
from showroom.verification import send_code
from showroom.dashboard import dashboard, enquire
from showroom import workspace
from showroom import workspace

urlpatterns = [path('admin/', admin.site.urls), path('api/cars/', views.cars), path('api/cars/<slug:slug>/', views.car_detail), path('api/cars/<slug:slug>/slots/', views.slots), path('api/bookings/', views.book)]
urlpatterns += [path('api/verification/send/', send_code)]
urlpatterns += [path('dashboard/', dashboard, name='dashboard'), path('api/enquiries/', enquire)]
urlpatterns += [
    path('api/workspace/session/', workspace.session),
    path('api/workspace/overview/', workspace.overview),
    path('api/workspace/staff/', workspace.staff),
    path('api/workspace/staff/<int:pk>/', workspace.staff),
    path('api/workspace/inventory/<int:pk>/photos/', workspace.photos),
    path('api/workspace/inventory/<int:pk>/photos/<int:photo_id>/', workspace.photos),
    path('api/workspace/<str:section>/', workspace.records),
    path('api/workspace/<str:section>/<int:pk>/', workspace.records),
]
urlpatterns += [
    path('api/workspace/session/', workspace.session),
    path('api/workspace/overview/', workspace.overview),
    path('api/workspace/staff/', workspace.staff),
    path('api/workspace/staff/<int:pk>/', workspace.staff),
    path('api/workspace/inventory/<int:pk>/photos/', workspace.photos),
    path('api/workspace/inventory/<int:pk>/photos/<int:photo_id>/', workspace.photos),
    path('api/workspace/<str:section>/', workspace.records),
    path('api/workspace/<str:section>/<int:pk>/', workspace.records),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

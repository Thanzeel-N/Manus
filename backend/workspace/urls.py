from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.profile),
    path('notifications/', views.notifications),
    path('notifications/<int:pk>/', views.notifications),
    path('session/', views.session, name='workspace-session'),
    path('overview/', views.overview, name='workspace-overview'),
    path('staff/', views.staff, name='workspace-staff-list'),
    path('staff/<int:pk>/', views.staff, name='workspace-staff-detail'),
    path('inventory/<int:pk>/photos/', views.photos, name='workspace-photos'),
    path('inventory/<int:pk>/photos/<int:photo_id>/', views.photos, name='workspace-photo-detail'),
    path('<str:section>/', views.records, name='workspace-records'),
    path('<str:section>/<int:pk>/', views.records, name='workspace-record-detail'),
]

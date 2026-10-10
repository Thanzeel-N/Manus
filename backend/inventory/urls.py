from django.urls import path
from . import views

urlpatterns = [
    path('', views.cars, name='car-list'),
    path('<slug:slug>/', views.car_detail, name='car-detail'),
]

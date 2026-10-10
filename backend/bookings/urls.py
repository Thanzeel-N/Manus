from django.urls import path
from . import views

urlpatterns = [
    path('cars/<slug:slug>/slots/', views.slots, name='car-slots'),
    path('bookings/', views.book, name='book-test-drive'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.send_code, name='send-verification-code'),
]

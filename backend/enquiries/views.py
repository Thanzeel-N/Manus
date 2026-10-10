from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .models import Enquiry


class EnquiryThrottle(AnonRateThrottle):
    scope = 'booking'


class EnquiryInput(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['name', 'phone', 'email', 'interest', 'date', 'message']

    def validate_date(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError('Please choose today or a future date.')
        return value


@api_view(['POST'])
@throttle_classes([EnquiryThrottle])
def enquire(request):
    data = EnquiryInput(data=request.data)
    data.is_valid(raise_exception=True)
    enquiry_obj = data.save()
    return Response({'reference': enquiry_obj.pk, 'status': enquiry_obj.status}, status=201)

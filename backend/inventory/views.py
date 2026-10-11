from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Car


def car_data(car):
    photos = [{'url': photo.image.url, 'caption': photo.caption} for photo in car.images.all()]
    return {
        'id': car.slug,
        'brand': car.brand,
        'name': car.name,
        'variant': car.variant,
        'year': car.year,
        'km': f'{car.mileage:,}',
        'price': float(car.price),
        'fuel': car.fuel,
        'transmission': car.transmission,
        'body': car.body,
        'condition': car.condition,
        'status': car.status,
        'description': car.description,
        'features': car.features.splitlines(),
        'images': photos,
        'image': photos[0]['url'] if photos else None,
        'video': car.video.url if car.video else None,
        'is_sample': car.is_sample,
        'is_featured': car.is_featured,
    }


@api_view(['GET'])
def cars(request):
    stock = Car.objects.exclude(status='draft').prefetch_related('images')
    if request.GET.get('q'):
        stock = stock.filter(
            Q(name__icontains=request.GET['q'])
            | Q(brand__icontains=request.GET['q'])
            | Q(variant__icontains=request.GET['q'])
        )
    return Response([car_data(car) for car in stock])


@api_view(['GET'])
def car_detail(request, slug):
    car = get_object_or_404(
        Car.objects.exclude(status='draft').prefetch_related('images'),
        slug=slug,
    )
    return Response(car_data(car))

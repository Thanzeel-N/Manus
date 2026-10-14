from django.db.models import Q
from django.core.files.storage import default_storage
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Car


@require_GET
def site_media(request, path):
    """Resolve a stable site-media URL to the private R2 object it represents."""
    parts = path.replace('\\', '/').split('/')
    if not path or any(part in ('', '.', '..') for part in parts):
        raise Http404

    key = f"site/{'/'.join(parts)}"
    response = HttpResponseRedirect(default_storage.url(key))
    response['Cache-Control'] = 'public, max-age=3600, stale-while-revalidate=86400'
    return response


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
    stock = Car.objects.exclude(status__in=['draft', 'sold']).prefetch_related('images')
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
        Car.objects.exclude(status__in=['draft', 'sold']).prefetch_related('images'),
        slug=slug,
    )
    return Response(car_data(car))

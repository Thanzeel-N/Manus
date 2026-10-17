from django.db import migrations


def keep_three_available_featured_cars(apps, schema_editor):
    Car = apps.get_model('showroom', 'Car')
    keep = list(
        Car.objects.filter(is_featured=True, status='available')
        .order_by('-year', 'name', 'pk')
        .values_list('pk', flat=True)[:3]
    )
    Car.objects.filter(is_featured=True).exclude(pk__in=keep).update(is_featured=False)


class Migration(migrations.Migration):
    dependencies = [
        ('showroom', '0008_deliveryphoto'),
    ]

    operations = [
        migrations.RunPython(keep_three_available_featured_cars, migrations.RunPython.noop),
    ]

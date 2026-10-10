from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('showroom', '0003_enquiry'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.AddField(model_name='booking', name='customer', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='customer_bookings', to=settings.AUTH_USER_MODEL))]

import logging

from django.db import transaction
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import Car, CarImage, DeliveryPhoto


logger = logging.getLogger(__name__)


def _delete_after_commit(field_file):
    """Delete a media object only after its database change commits."""
    if not field_file or not field_file.name:
        return

    name = field_file.name
    storage = field_file.storage

    def delete_file():
        # Older/sample data can intentionally share a single object key. Never
        # remove the object while another database record still references it.
        if (
            CarImage.objects.filter(image=name).exists()
            or DeliveryPhoto.objects.filter(image=name).exists()
            or Car.objects.filter(video=name).exists()
        ):
            return
        try:
            storage.delete(name)
        except Exception:
            # A failed R2 request must not roll back an otherwise valid record
            # deletion. The failure remains visible in application logs.
            logger.exception('Could not delete unused media object %s', name)

    transaction.on_commit(delete_file)


def _delete_replaced_file(sender, instance, field_name):
    if not instance.pk:
        return
    try:
        previous = sender.objects.only(field_name).get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    old_file = getattr(previous, field_name)
    new_file = getattr(instance, field_name)
    if old_file and old_file.name != getattr(new_file, 'name', ''):
        _delete_after_commit(old_file)


@receiver(pre_save, sender=Car)
def delete_replaced_car_video(sender, instance, **kwargs):
    _delete_replaced_file(sender, instance, 'video')


@receiver(post_delete, sender=Car)
def delete_car_video(sender, instance, **kwargs):
    _delete_after_commit(instance.video)


@receiver(pre_save, sender=CarImage)
def delete_replaced_car_image(sender, instance, **kwargs):
    _delete_replaced_file(sender, instance, 'image')


@receiver(post_delete, sender=CarImage)
def delete_car_image(sender, instance, **kwargs):
    _delete_after_commit(instance.image)


@receiver(pre_save, sender=DeliveryPhoto)
def delete_replaced_delivery_photo(sender, instance, **kwargs):
    _delete_replaced_file(sender, instance, 'image')


@receiver(post_delete, sender=DeliveryPhoto)
def delete_delivery_photo(sender, instance, **kwargs):
    _delete_after_commit(instance.image)

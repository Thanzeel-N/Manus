from unittest.mock import patch

from django.test import TestCase

from .models import Car, CarImage


class MediaCleanupTests(TestCase):
    def make_car(self, **overrides):
        values = {
            'slug': 'cleanup-car',
            'brand': 'Test',
            'name': 'Cleanup Car',
            'variant': 'Base',
            'year': 2024,
            'mileage': 1000,
            'price': 10,
            'fuel': 'Petrol',
            'transmission': 'Automatic',
            'body': 'Sedan',
            'condition': 'Used',
            'status': 'available',
        }
        values.update(overrides)
        return Car.objects.create(**values)

    def test_deleted_photo_is_removed_from_storage_after_commit(self):
        car = self.make_car()
        photo = CarImage.objects.create(
            car=car,
            image='cars/photos/unused.jpg',
        )

        with patch.object(photo.image.storage, 'delete') as delete:
            with self.captureOnCommitCallbacks(execute=True):
                photo.delete()

        delete.assert_called_once_with('cars/photos/unused.jpg')

    def test_replaced_video_removes_previous_object_after_commit(self):
        car = self.make_car(video='cars/videos/old.mp4')
        storage = car.video.storage
        car.video = 'cars/videos/new.mp4'

        with patch.object(storage, 'delete') as delete:
            with self.captureOnCommitCallbacks(execute=True):
                car.save(update_fields=['video'])

        delete.assert_called_once_with('cars/videos/old.mp4')

    def test_shared_photo_is_kept_until_last_reference_is_deleted(self):
        first_car = self.make_car()
        second_car = self.make_car(slug='second-car', name='Second Car')
        first = CarImage.objects.create(
            car=first_car,
            image='cars/photos/shared.jpg',
        )
        CarImage.objects.create(
            car=second_car,
            image='cars/photos/shared.jpg',
        )

        with patch.object(first.image.storage, 'delete') as delete:
            with self.captureOnCommitCallbacks(execute=True):
                first.delete()

        delete.assert_not_called()

    def test_deleting_car_removes_video_and_related_photos(self):
        car = self.make_car(video='cars/videos/car.mp4')
        photo = CarImage.objects.create(
            car=car,
            image='cars/photos/car.jpg',
        )
        storage = car.video.storage

        with patch.object(storage, 'delete') as delete:
            with self.captureOnCommitCallbacks(execute=True):
                car.delete()

        self.assertCountEqual(
            [call.args[0] for call in delete.call_args_list],
            ['cars/photos/car.jpg', 'cars/videos/car.mp4'],
        )


class SiteMediaTests(TestCase):
    @patch('inventory.views.default_storage.url', return_value='https://signed.example/site/photo.jpg')
    @patch('inventory.views.default_storage.exists', return_value=True)
    def test_site_media_redirects_to_private_storage_url(self, exists, url):
        response = self.client.get('/api/site-media/images/photo.jpg')

        self.assertRedirects(
            response,
            'https://signed.example/site/photo.jpg',
            fetch_redirect_response=False,
        )
        exists.assert_called_once_with('site/images/photo.jpg')
        url.assert_called_once_with('site/images/photo.jpg')

    def test_site_media_rejects_parent_path_segments(self):
        response = self.client.get('/api/site-media/images/../secret.jpg')

        self.assertEqual(response.status_code, 404)

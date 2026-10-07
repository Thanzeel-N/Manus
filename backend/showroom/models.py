"""Re-export models from modular apps for backwards compatibility."""
from inventory.models import Car, CarImage, image_size, video_size
from bookings.models import TestDriveSlot, Booking
from enquiries.models import Enquiry
from verification.models import EmailVerification

__all__ = [
    'Car',
    'CarImage',
    'image_size',
    'video_size',
    'TestDriveSlot',
    'Booking',
    'Enquiry',
    'EmailVerification',
]

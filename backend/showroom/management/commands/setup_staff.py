from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create the Showroom staff group with operational permissions, excluding account management and deletion.'

    def handle(self, *args, **options):
        group, _ = Group.objects.get_or_create(name='Showroom staff')
        codes = [f'{action}_{model}' for model in ['car', 'carimage', 'testdriveslot', 'booking', 'enquiry'] for action in ['view', 'change']]
        codes += ['add_car', 'add_carimage', 'add_testdriveslot']
        group.permissions.set(Permission.objects.filter(content_type__app_label='showroom', codename__in=codes))
        self.stdout.write(self.style.SUCCESS('Showroom staff permissions configured. Assign this group and Staff status to staff accounts in Admin.'))

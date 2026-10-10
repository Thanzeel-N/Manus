"""Run periodically as a single scheduled job; never send SMS in a web request."""
import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from workspace.alerts import is_admin
from workspace.models import Alert


class Command(BaseCommand):
    help = 'Submit queued owner/admin phone alerts to Twilio (up to 100 per run).'

    def handle(self, *args, **options):
        if not settings.SMS_ENABLED:
            self.stdout.write('SMS is disabled. Dashboard alerts remain available.')
            return
        if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_FROM_NUMBER]):
            raise CommandError('Configure the Twilio account, auth token and sender before enabling SMS.')
        ids = list(Alert.objects.filter(sms_status='pending', attempts__lt=5).order_by('pk').values_list('pk', flat=True)[:100])
        for pk in ids:
            with transaction.atomic():
                alert = Alert.objects.select_for_update().select_related('recipient').get(pk=pk)
                if alert.sms_status != 'pending':
                    continue
                profile = getattr(alert.recipient, 'workspace_profile', None)
                if not is_admin(alert.recipient) or not profile or profile.phone != alert.phone:
                    alert.sms_status = 'cancelled'
                    alert.save(update_fields=['sms_status'])
                    continue
                alert.sms_status = 'submitting'
                alert.attempts += 1
                alert.save(update_fields=['sms_status', 'attempts'])
            try:
                response = requests.post(
                    f'https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json',
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                    data={'From': settings.TWILIO_FROM_NUMBER, 'To': alert.phone, 'Body': alert.message}, timeout=(5, 20))
                if response.status_code == 201:
                    result = response.json()
                    if not result.get('sid'):
                        raise ValueError('Missing provider reference')
                    alert.provider_id = result['sid']
                    alert.sms_status = 'submitted'
                    alert.last_error = ''
                elif response.status_code == 429:
                    alert.sms_status = 'pending' if alert.attempts < 5 else 'failed'
                    alert.last_error = 'Provider rate limit; retry on the next scheduled run.'
                else:
                    alert.sms_status = 'unknown' if response.status_code >= 500 else 'failed'
                    alert.last_error = f'Provider HTTP {response.status_code}; review in Twilio before retrying.'
            except (requests.RequestException, ValueError):
                # A timeout may occur after acceptance. Retrying blindly duplicates SMS.
                alert.sms_status = 'unknown'
                alert.last_error = 'Submission outcome uncertain; review in Twilio before retrying.'
            alert.save(update_fields=['sms_status', 'provider_id', 'last_error'])
        self.stdout.write(f'Processed {len(ids)} queued alerts. Submitted is not confirmation of handset delivery.')

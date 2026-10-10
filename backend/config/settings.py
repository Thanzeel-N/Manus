import os
import sys
from pathlib import Path

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    _backend_env = Path(__file__).resolve().parent.parent / '.env'
    _root_env = Path(__file__).resolve().parent.parent.parent / '.env'
    if _backend_env.exists():
        load_dotenv(_backend_env)
    elif _root_env.exists():
        load_dotenv(_root_env)
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'local-development-only-change-before-launch')
if not DEBUG and (len(SECRET_KEY) < 50 or len(set(SECRET_KEY)) < 5 or SECRET_KEY.startswith('django-insecure-')):
    raise RuntimeError('Set a strong, random DJANGO_SECRET_KEY of at least 50 characters for production.')
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',')
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'storages',
    'showroom',
    'inventory',
    'bookings',
    'enquiries',
    'verification',
    'workspace',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'workspace.alerts.AuditMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [BASE_DIR / 'showroom' / 'templates'], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3', 'OPTIONS': {'timeout': 30}}}
if os.environ.get('POSTGRES_DB'):
    DATABASES['default'] = {'ENGINE': 'django.db.backends.postgresql', 'NAME': os.environ['POSTGRES_DB'], 'USER': os.environ['POSTGRES_USER'], 'PASSWORD': os.environ['POSTGRES_PASSWORD'], 'HOST': os.environ.get('POSTGRES_HOST', 'localhost'), 'PORT': os.environ.get('POSTGRES_PORT', '5432')}
AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}]
LANGUAGE_CODE = 'en-in'
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudflare R2 Object Storage (S3-compatible) Configuration
CLOUDFLARE_R2_BUCKET_NAME = os.environ.get('CLOUDFLARE_R2_BUCKET_NAME') or os.environ.get('R2_BUCKET_NAME') or os.environ.get('AWS_STORAGE_BUCKET_NAME', '')
CLOUDFLARE_R2_ACCOUNT_ID = os.environ.get('CLOUDFLARE_R2_ACCOUNT_ID') or os.environ.get('R2_ACCOUNT_ID', '')
CLOUDFLARE_R2_ACCESS_KEY_ID = os.environ.get('CLOUDFLARE_R2_ACCESS_KEY_ID') or os.environ.get('R2_ACCESS_KEY_ID') or os.environ.get('AWS_ACCESS_KEY_ID', '')
CLOUDFLARE_R2_SECRET_ACCESS_KEY = os.environ.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY') or os.environ.get('R2_SECRET_ACCESS_KEY') or os.environ.get('AWS_SECRET_ACCESS_KEY', '')

CLOUDFLARE_R2_ENDPOINT_URL = (
    os.environ.get('CLOUDFLARE_R2_ENDPOINT_URL')
    or os.environ.get('R2_ENDPOINT_URL')
    or (f'https://{CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com' if CLOUDFLARE_R2_ACCOUNT_ID else '')
    or os.environ.get('AWS_S3_ENDPOINT_URL', '')
)

_raw_domain = os.environ.get('CLOUDFLARE_R2_CUSTOM_DOMAIN') or os.environ.get('R2_CUSTOM_DOMAIN') or os.environ.get('R2_PUBLIC_URL') or os.environ.get('AWS_S3_CUSTOM_DOMAIN', '')
CLOUDFLARE_R2_CUSTOM_DOMAIN = _raw_domain.replace('https://', '').replace('http://', '').rstrip('/') if _raw_domain else ''
# If the domain is the raw S3 API endpoint, it is not a public CDN domain and requires signed auth
if CLOUDFLARE_R2_CUSTOM_DOMAIN.endswith('.r2.cloudflarestorage.com'):
    CLOUDFLARE_R2_CUSTOM_DOMAIN = ''

# Cloudflare R2 is activated when credentials exist and not running hermetic tests
IS_RUNNING_TESTS = 'test' in sys.argv
USE_CLOUDFLARE_R2 = not IS_RUNNING_TESTS and (
    os.environ.get('CLOUDFLARE_R2_ENABLED', '1' if (CLOUDFLARE_R2_BUCKET_NAME and CLOUDFLARE_R2_ACCESS_KEY_ID) else '0') == '1'
)

if USE_CLOUDFLARE_R2:
    AWS_ACCESS_KEY_ID = CLOUDFLARE_R2_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = CLOUDFLARE_R2_SECRET_ACCESS_KEY
    AWS_STORAGE_BUCKET_NAME = CLOUDFLARE_R2_BUCKET_NAME
    AWS_S3_ENDPOINT_URL = CLOUDFLARE_R2_ENDPOINT_URL
    AWS_S3_REGION_NAME = os.environ.get('CLOUDFLARE_R2_REGION', 'auto')
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_S3_FILE_OVERWRITE = False
    
    # If a real public domain/r2.dev is present, querystring auth is not required;
    # otherwise presigned URLs are used to allow web browsers to view private R2 objects.
    if 'CLOUDFLARE_R2_QUERYSTRING_AUTH' in os.environ:
        AWS_QUERYSTRING_AUTH = os.environ['CLOUDFLARE_R2_QUERYSTRING_AUTH'] in ('1', 'true', 'True')
    else:
        AWS_QUERYSTRING_AUTH = False if CLOUDFLARE_R2_CUSTOM_DOMAIN else True
    AWS_QUERYSTRING_EXPIRE = int(os.environ.get('CLOUDFLARE_R2_QUERYSTRING_EXPIRE', 604800))  # 7 days

    if CLOUDFLARE_R2_CUSTOM_DOMAIN:
        AWS_S3_CUSTOM_DOMAIN = CLOUDFLARE_R2_CUSTOM_DOMAIN
        MEDIA_URL = f'https://{CLOUDFLARE_R2_CUSTOM_DOMAIN}/'

    STORAGES = {
        'default': {
            'BACKEND': 'config.storage.CloudflareR2MediaStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
DATA_UPLOAD_MAX_MEMORY_SIZE = 110 * 1024 * 1024
REST_FRAMEWORK = {'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.AnonRateThrottle'], 'DEFAULT_THROTTLE_RATES': {'anon': '120/hour', 'booking': '10/hour'}}
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = os.environ.get('DJANGO_SSL_REDIRECT', '0' if DEBUG else '1') == '1'
SECURE_HSTS_SECONDS = int(os.environ.get('DJANGO_HSTS_SECONDS', '0' if DEBUG else '3600'))
# Enable only when a trusted reverse proxy strips/replaces the incoming header.
if os.environ.get('DJANGO_TRUST_PROXY_HTTPS', '0') == '1':
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Shared production throttling without requiring an additional cache service.
# Provision with `manage.py createcachetable` before starting production workers.
CACHES = {'default': {
    'BACKEND': 'django.core.cache.backends.locmem.LocMemCache' if DEBUG else 'django.core.cache.backends.db.DatabaseCache',
    'LOCATION': 'showroom_cache',
}}

# Local development writes emails to a private directory, never to an API response.
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.filebased.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_FILE_PATH = BASE_DIR.parent / '.runtime' / 'mail'
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', '1') == '1'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', '0') == '1'
EMAIL_TIMEOUT = 10
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Showroom <noreply@example.com>')
if not DEBUG and EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend':
    raise RuntimeError('Production verification requires SMTP email delivery.')
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['verification'] = '20/hour'
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['customer_login'] = '20/hour'

SMS_ENABLED = os.environ.get('SMS_ENABLED', '0') == '1'
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_FROM_NUMBER = os.environ.get('TWILIO_FROM_NUMBER', '')

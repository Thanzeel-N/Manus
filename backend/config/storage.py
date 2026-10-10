"""
Cloudflare R2 Storage backend for Django.

Cloudflare R2 is an S3-compatible object storage service with zero egress fees.
Key differences from AWS S3:
1. Endpoint format: https://<account_id>.r2.cloudflarestorage.com
2. ACLs are not supported: default_acl MUST be None (or R2 returns 400).
3. Region is typically 'auto'.
4. Signature version must be 's3v4'.
5. Public asset serving is configured via R2 custom domain or r2.dev public URL.
"""
from django.conf import settings
from storages.backends.s3 import S3Storage


class CloudflareR2MediaStorage(S3Storage):
    """
    Storage backend for user-uploaded media files (car photos, videos)
    hosted on Cloudflare R2.
    """
    default_acl = None
    file_overwrite = False
    signature_version = 's3v4'
    region_name = getattr(settings, 'AWS_S3_REGION_NAME', 'auto')
    addressing_style = 'path'

    def __init__(self, **settings_dict):
        # Override with R2-specific settings if available
        if hasattr(settings, 'CLOUDFLARE_R2_BUCKET_NAME'):
            settings_dict.setdefault('bucket_name', settings.CLOUDFLARE_R2_BUCKET_NAME)
        if hasattr(settings, 'CLOUDFLARE_R2_ENDPOINT_URL'):
            settings_dict.setdefault('endpoint_url', settings.CLOUDFLARE_R2_ENDPOINT_URL)
        if hasattr(settings, 'CLOUDFLARE_R2_CUSTOM_DOMAIN'):
            settings_dict.setdefault('custom_domain', settings.CLOUDFLARE_R2_CUSTOM_DOMAIN)
        if hasattr(settings, 'CLOUDFLARE_R2_QUERYSTRING_AUTH'):
            settings_dict.setdefault('querystring_auth', settings.CLOUDFLARE_R2_QUERYSTRING_AUTH)

        super().__init__(**settings_dict)


class CloudflareR2StaticStorage(S3Storage):
    """
    Optional storage backend for collected static assets hosted on Cloudflare R2.
    """
    default_acl = None
    file_overwrite = True
    signature_version = 's3v4'
    region_name = getattr(settings, 'AWS_S3_REGION_NAME', 'auto')
    addressing_style = 'path'
    location = 'static'

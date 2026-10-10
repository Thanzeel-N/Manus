from django.apps import AppConfig

class WorkspaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'workspace'
    verbose_name = 'Showroom Workspace'

    def ready(self):
        from . import alerts  # noqa: F401

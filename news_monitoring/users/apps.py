import contextlib

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UsersConfig(AppConfig):
    name = "news_monitoring.users"
    verbose_name = _("Users")

    def ready(self):
        with contextlib.suppress(ImportError):
            import news_monitoring.users.signals  # noqa: F401

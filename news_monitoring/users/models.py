from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from news_monitoring.company.models import Company  # Adjust path if needed

class User(AbstractUser):
    """
    Custom user model for News_Monitoring.
    Replaces first/last name with a single full name field.
    """

    name = models.CharField(_("Full Name"), blank=True, max_length=255)
    email = models.EmailField(_("Email address"), unique=True)
    first_name = None  # type: ignore
    last_name = None   # type: ignore

    company = models.ForeignKey(Company, null=True, blank=True, on_delete=models.SET_NULL, related_name='companyuser')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def get_absolute_url(self) -> str:
        """Returns the URL to access a user's profile."""
        return reverse("users:detail", kwargs={"username": self.username})


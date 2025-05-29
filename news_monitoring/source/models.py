from django.db import models
from news_monitoring.users.models import User
from news_monitoring.company.models import Company

class Source(models.Model):
    name = models.CharField(max_length=255)
    url = models.URLField(max_length=1000)
    tagged_companies = models.ManyToManyField(Company)
    company = models.ForeignKey(Company,on_delete=models.CASCADE,related_name="userCompany",null=True, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="%(class)s_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="%(class)s_updated")

    def __str__(self):
        return self.name

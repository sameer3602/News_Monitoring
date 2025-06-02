from django.db import models
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company
from news_monitoring.users.models import User


class Story(models.Model):
    title = models.CharField(max_length=1000)
    body_text = models.TextField()
    url = models.URLField(max_length=1000)
    published_date = models.DateField()
    source = models.ForeignKey(Source, on_delete=models.CASCADE,null=True,blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE,related_name="storyCompany",default=1)
    tagged_companies = models.ManyToManyField(Company)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="%(class)s_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="%(class)s_updated")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['company', 'url'], name='unique_story_urls')]




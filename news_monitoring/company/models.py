from django.db import models



class Company(models.Model):
    name = models.CharField(max_length=255)
    domain_name = models.URLField(max_length=100,unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name="%(class)s_created")
    updated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name="%(class)s_updated")

    def __str__(self):
        return self.name

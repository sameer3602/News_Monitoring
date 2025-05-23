from rest_framework import serializers
from news_monitoring.company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']  # Add other fields as needed

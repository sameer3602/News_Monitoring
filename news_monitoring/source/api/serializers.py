from rest_framework import serializers
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']

class SourceSerializer(serializers.ModelSerializer):
    tagged_companies = CompanySerializer(many=True, read_only=True)
    tagged_companies_ids = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), many=True, write_only=True, source='tagged_companies'
    )

    class Meta:
        model = Source
        fields = ['id', 'name', 'url', 'tagged_companies', 'tagged_companies_ids']

from rest_framework import serializers
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']

class SourceSerializer(serializers.ModelSerializer):
    # Used for POST/PUT/PATCH
    tagged_companies = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Company.objects.all(),
        write_only=True
    )
    # Used for GET
    tagged_companies_detail = CompanySerializer(source='tagged_companies', many=True, read_only=True)

    class Meta:
        model = Source
        fields = ['id', 'name', 'url', 'tagged_companies', 'tagged_companies_detail']

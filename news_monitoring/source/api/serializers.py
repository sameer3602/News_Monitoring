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

    def create(self, validated_data):
        tagged_companies = validated_data.pop('tagged_companies', [])
        source = Source.objects.create(**validated_data)
        source.tagged_companies.set(tagged_companies)
        return source

    def update(self, instance, validated_data):
        tagged_companies = validated_data.pop('tagged_companies', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if tagged_companies is not None:
            instance.tagged_companies.set(tagged_companies)
        instance.save()
        return instance

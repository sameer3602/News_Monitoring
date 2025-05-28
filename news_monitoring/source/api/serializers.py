from rest_framework import serializers
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']

class SourceSerializer(serializers.ModelSerializer):
    tagged_companies = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Company.objects.all()
    )

    class Meta:
        model = Source
        fields = ['id', 'name', 'url', 'tagged_companies']

    def to_representation(self, instance):
        # Get the default representation
        rep = super().to_representation(instance)
        # Replace tagged_companies IDs with serialized objects
        rep['tagged_companies'] = CompanySerializer(instance.tagged_companies.all(), many=True).data
        return rep

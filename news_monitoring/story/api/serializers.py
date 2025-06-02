from rest_framework import serializers
from news_monitoring.story.models import Story
from news_monitoring.source.models import Company

class CompanySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ["id", "name"]

class StorySerializer(serializers.ModelSerializer):
    # Used for writing (accepts list of IDs)
    tagged_companies = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Company.objects.all(), write_only=True
    )

    # Used for reading (returns list of objects with id and name)
    tagged_companies_details = CompanySimpleSerializer(
        many=True, source='tagged_companies', read_only=True
    )

    class Meta:
        model = Story
        fields = [
            "id",
            "title",
            "body_text",
            "url",
            "published_date",
            "created_by",
            "updated_by",
            "tagged_companies",          # for write
            "tagged_companies_details",  # for read
        ]

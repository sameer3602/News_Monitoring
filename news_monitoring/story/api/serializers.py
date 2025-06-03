from rest_framework import serializers

from news_monitoring.company.api.serializers import CompanySerializer
from news_monitoring.story.models import Story


class StorySerializer(serializers.ModelSerializer):
    tagged_companies_details = CompanySerializer(source='tagged_companies', many=True, read_only=True)

    class Meta:
        model = Story
        fields = [
            'id', 'title', 'url', 'body_text', 'published_date',
            'tagged_companies', 'tagged_companies_details',
        ]

    def create(self, validated_data):
        print("VALIDATED DATA FOR CREATE:", validated_data)
        return super().create(validated_data)





# class StorySerializer(serializers.ModelSerializer):
#     # Used for writing (accepts list of IDs)
#     tagged_companies = serializers.PrimaryKeyRelatedField(
#         many=True, queryset=Company.objects.all(), write_only=True
#     )
#
#     # Used for reading (returns list of objects with id and name)
#     tagged_companies_details = CompanySimpleSerializer(
#         many=True, source='tagged_companies', read_only=True
#     )
#
#     class Meta:
#         model = Story
#         fields = [
#             "id",
#             "title",
#             "body_text",
#             "url",
#             "published_date",
#             "created_by",
#             "updated_by",
#             "tagged_companies",          # for write
#             "tagged_companies_details",  # for read
#         ]

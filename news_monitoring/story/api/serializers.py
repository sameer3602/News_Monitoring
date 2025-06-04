from rest_framework import serializers
from news_monitoring.story.models import Story
from news_monitoring.company.models import Company

class StorySerializer(serializers.ModelSerializer):
    # Write: Accept list of company IDs
    tagged_companies_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    # Read: Precomputed annotation used for fast access (or fallback to model relation)
    tagged_companies_details = serializers.ListField(read_only=True)

    class Meta:
        model = Story
        fields = [
            'id', 'title', 'url', 'body_text', 'published_date',
            'tagged_companies_details',        # Read: [{id, name}]
            'tagged_companies_ids'     # Write: [1, 2, 3]
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

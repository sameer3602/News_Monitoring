from rest_framework import serializers
from news_monitoring.story.models import Story
from news_monitoring.source.models import Company, Source  # If needed for nested fields

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'name']
        
class StorySerializer(serializers.ModelSerializer):
    source = SourceSerializer(read_only=True)
    tagged_companies = CompanySerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = '__all__'
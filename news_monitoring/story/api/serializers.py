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
        fields = ['id', 'name', 'url']

class StorySerializer(serializers.ModelSerializer):
    tagged_companies = CompanySerializer(many=True, read_only=True)
    source = SourceSerializer(read_only=True)

    class Meta:
        model = Story
        fields = '__all__'

    # This part is necessary for POST/PUT to accept company/source IDs
    def to_internal_value(self, data):
        data = data.copy()
        if isinstance(data.get('tagged_companies'), list):
            data['tagged_companies'] = [int(pk) for pk in data['tagged_companies']]
        if data.get('source'):
            data['source'] = int(data['source'])
        return super().to_internal_value(data)

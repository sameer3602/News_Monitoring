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
    tagged_companies_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Company.objects.all()
    )
    tagged_companies = CompanySerializer(many=True, read_only=True)
    
    # for updating the story
    def update(self, instance, validated_data):
        company_ids = validated_data.pop('tagged_companies_ids', None)
        instance = super().update(instance, validated_data)
        if company_ids is not None:
            instance.tagged_companies.set(company_ids)
        return instance

    # for creating the story
    def create(self, validated_data):
        company_ids = validated_data.pop('tagged_companies_ids', [])
        story = Story.objects.create(**validated_data)
        story.tagged_companies.set(company_ids)
        return story

    # for deleting the story
    def delete(self, instance):
        user = self.request.user
        if not user.is_staff and user.company not in instance.tagged_companies.all():
            raise PermissionDenied("You don't have permission to delete this story.")
        instance.delete()

    class Meta:
        model = Story
        fields = '__all__'
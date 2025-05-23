from rest_framework import serializers
from news_monitoring.story.models import Story # or Story

class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = '__all__'

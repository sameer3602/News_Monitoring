from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from news_monitoring.story.models import Story
from news_monitoring.story.api.serializers import StorySerializer
from rest_framework.exceptions import PermissionDenied
    
class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff users can see all stories
        if user.is_staff:
            return Story.objects.all()
        # Normal users only see stories tagged to their company
        # Assuming user.company is a Company instance or ID
        return Story.objects.filter(tagged_companies__in=[user.company])
    


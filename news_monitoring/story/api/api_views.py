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
    
    # Optional: Ensure create/update/delete actions validate company ownership 
    def perform_create(self, serializer):
        # You could add logic to assign user/company here if needed
        serializer.save()

    def perform_update(self, serializer):
        story = self.get_object()
        user = self.request.user
        if not user.is_staff and user.company not in story.tagged_companies.all():
            raise PermissionDenied("You don't have permission to edit this story.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not user.is_staff and user.company not in instance.tagged_companies.all():
            raise PermissionDenied("You don't have permission to delete this story.")
        instance.delete()


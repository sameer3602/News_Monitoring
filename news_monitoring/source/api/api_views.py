from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company
from .serializers import SourceSerializer, CompanySerializer
from rest_framework.exceptions import PermissionDenied

class SourceViewSet(viewsets.ModelViewSet):
    serializer_class = SourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff users can see all sources
        if user.is_staff:
            return Source.objects.all()
        # Normal users only see sources they created
        return Source.objects.filter(created_by=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        # Ensure user can only update sources they created unless staff
        source = self.get_object()
        user = self.request.user
        if not user.is_staff and source.created_by != user:
            raise PermissionDenied("You don't have permission to update this source.")
        serializer.save(updated_by=user)

    def perform_destroy(self, instance):
        # Ensure user can only delete sources they created unless staff
        user = self.request.user
        if not user.is_staff and instance.created_by != user:
            raise PermissionDenied("You don't have permission to delete this source.")
        instance.delete()

class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

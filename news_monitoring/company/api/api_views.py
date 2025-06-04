from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from news_monitoring.company.api.serializers import CompanySerializer
from news_monitoring.company.models import Company


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.only("id","name")
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

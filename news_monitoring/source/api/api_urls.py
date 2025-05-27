from rest_framework.routers import DefaultRouter

from news_monitoring.source.api import api_views
from news_monitoring.source.api.api_views import SourceViewSet,CompanyViewSet
from django.urls import path, include

app_name="sources"

router = DefaultRouter()
router.register(r'sources', SourceViewSet, basename='source')
router.register(r'companies', CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
    
]

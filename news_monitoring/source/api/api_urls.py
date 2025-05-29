from rest_framework.routers import DefaultRouter
from news_monitoring.source.api.api_views import SourceViewSet,fetch_stories
from django.urls import path, include

app_name="sources"

router = DefaultRouter()
router.register(r'', SourceViewSet, basename='source')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:source_id>/fetch_stories/', fetch_stories, name='api_fetch_stories')
]

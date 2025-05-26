from rest_framework.routers import DefaultRouter
from news_monitoring.story.api.api_views import StoryViewSet
from django.urls import path, include

app_name = "stories"

router = DefaultRouter()
router.register(r'stories', StoryViewSet, basename='story')

urlpatterns = [
    path('', include(router.urls)),
]

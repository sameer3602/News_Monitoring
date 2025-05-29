from rest_framework.routers import DefaultRouter
from news_monitoring.company.api.api_views import CompanyViewSet
from django.urls import path, include

app_name="sources"

router = DefaultRouter()
router.register(r'', CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),

]

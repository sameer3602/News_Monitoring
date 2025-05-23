
from django.urls import path
from . import views

app_name = "company"  # This enables namespacing

urlpatterns = [
    path("add/", views.add_company, name="add_company"),
    path('search/', views.search_companies, name='search_companies'),

]

# from rest_framework.routers import DefaultRouter
# from .views import CompanyViewSet
# from django.urls import path,include
# router = DefaultRouter()
# router.register(r'companies', CompanyViewSet, basename='company')
#
# urlpatterns = [
#     path('api/', include(router.urls)),
# ]


from django.urls import path
from . import views

app_name = "company"  # This enables namespacing

urlpatterns = [
    path("add/", views.add_company, name="add_company"),
    path('search/', views.search_companies, name='search_companies'),

]

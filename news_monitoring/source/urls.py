from django.urls import path
from . import views


app_name = "source"
urlpatterns = [
    path('add/', views.add_or_update_source, name='add_source'),
    path('update/<int:pk>/', views.add_or_update_source, name='update_source'),
    path('view/', views.view_sources, name='view_sources'),
    path('delete/<int:pk>/', views.delete_source, name='delete_source'),

    path('fetch/', views.fetch_rss, name='fetch_rss'),


]

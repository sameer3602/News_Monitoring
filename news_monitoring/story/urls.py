from django.urls import path
from . import views

app_name = 'story'

urlpatterns = [
    path('view/', views.view_stories, name='view_stories'),
    path('add/', views.add_or_update_story, name='add_story'),
    path('delete/<int:pk>/', views.delete_story, name='delete_story'),
    path('update/<int:pk>/', views.add_or_update_story, name='update_story'),
]

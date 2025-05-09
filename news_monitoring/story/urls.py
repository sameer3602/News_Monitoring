from django.urls import path
from . import views

app_name = 'story'

urlpatterns = [
    path('view/', views.view_stories, name='view_stories'),
    path('add/', views.add_story, name='add_story'),
]

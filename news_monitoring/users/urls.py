
from .views import login_view,signup_view,logout_view
from django.urls import path
from . import views

app_name = "users"

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
]

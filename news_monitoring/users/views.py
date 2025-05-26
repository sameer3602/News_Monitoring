from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from news_monitoring.forms.loginForm import LoginForm
from news_monitoring.forms.signupForm import SignupForm
from news_monitoring.source.models import Source

User = get_user_model()

def login_view(request):
    error=None
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                # Check if user has any sources
                has_sources = Source.objects.filter(created_by=user).exists()
                if has_sources:
                    return redirect('source:source_angular')  # view sources page
                else:
                    return redirect('source:source_angular')  # add source page
            else:
                error = "Invalid username or password"
    else:
        form = LoginForm()
    return render(request, "users/login.html", {"form": form,"error":error})

def signup_view(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("users:login")
    else:
        form = SignupForm()
    return render(request, "users/signup.html", {"form": form})

def logout_view(request):
    logout(request)
    return redirect("home")

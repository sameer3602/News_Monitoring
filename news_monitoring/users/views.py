# from django.contrib.auth.mixins import LoginRequiredMixin
# from django.contrib.messages.views import SuccessMessageMixin
# from django.db.models import QuerySet
# from django.urls import reverse
# from django.utils.translation import gettext_lazy as _
# from django.views.generic import DetailView
# from django.views.generic import RedirectView
# from django.views.generic import UpdateView
#
# from news_monitoring.users.models import User
#
#
# class UserDetailView(LoginRequiredMixin, DetailView):
#     model = User
#     slug_field = "username"
#     slug_url_kwarg = "username"
#
#
# user_detail_view = UserDetailView.as_view()
#
#
# class UserUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
#     model = User
#     fields = ["name"]
#     success_message = _("Information successfully updated")
#
#     def get_success_url(self) -> str:
#         assert self.request.user.is_authenticated  # type guard
#         return self.request.user.get_absolute_url()
#
#     def get_object(self, queryset: QuerySet | None=None) -> User:
#         assert self.request.user.is_authenticated  # type guard
#         return self.request.user
#
#
# user_update_view = UserUpdateView.as_view()
#
#
# class UserRedirectView(LoginRequiredMixin, RedirectView):
#     permanent = False
#
#     def get_redirect_url(self) -> str:
#         return reverse("users:detail", kwargs={"username": self.request.user.username})
#
#
# user_redirect_view = UserRedirectView.as_view()


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
                    return redirect('source:view_sources')  # view sources page
                else:
                    return redirect('source:add_source')  # add source page
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

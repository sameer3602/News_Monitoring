from django.shortcuts import render
from django.http import HttpResponse

def view_stories(request):
    return HttpResponse("This is the View Stories page.")

def add_story(request):
    return HttpResponse("This is the Add Story page.")

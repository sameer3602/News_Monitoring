@login_required
def angular_view_stories(request):
    return render(request, 'base-api.html', {"view": "story"})

@login_required
def angular_add_story(request):
    return render(request, 'base-api.html', {"view": "story"})


from django.contrib import messages
from django.core.paginator import Paginator
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Story, Source, Company
from news_monitoring.forms.storyForm import StoryForm # assuming you have a StoryForm
from django.contrib.auth.models import User


@login_required
def add_or_update_story(request, pk=None):

    is_update = pk is not None
    story = get_object_or_404(Story, pk=pk) if is_update else None

    company = getattr(request.user, 'company', None)
    if not company:
        messages.error(request, "Your account is not associated with any company.")
        return redirect('home')

    company_id = str(company.id)

    if request.method == 'POST':
        title = request.POST.get('title')
        url = request.POST.get('url')
        published_date = request.POST.get('published_date')
        body_text = request.POST.get('body_text')
        tagged_company_ids = request.POST.getlist('tagged_companies')
        source_id = request.POST.get('source')  # Single source ID

        # Get related models
        all_company_ids = [company_id] + tagged_company_ids
        companies = Company.objects.in_bulk(all_company_ids)
        tagged_companies = [companies[int(cid)] for cid in tagged_company_ids if int(cid) in companies]
        source = get_object_or_404(Source, id=source_id) if source_id else None

        if is_update:
            story.title = title
            story.url = url
            story.published_date = published_date
            story.body_text = body_text
            story.source = source
            story.updated_by = request.user
            story.save()
            story.tagged_companies.set(tagged_companies)
            print(story)
        else:
            story = Story.objects.create(
                title=title,
                url=url,
                published_date=published_date,
                body_text=body_text,
                source=source,
                created_by=request.user,
            )
            story.tagged_companies.set(tagged_companies)

        return redirect('story:view_stories')

    else:
        if is_update:
            initial = {
                'title': story.title,
                'url': story.url,
                'published_date': story.published_date,
                'body_text': story.body_text,
                'source': story.source.id if story.source else None,
            }

            form = StoryForm(initial=initial,company=company)
        else:
            form = StoryForm()
            tagged_companies_data = []

        sources_data = [
            {'id': s.id, 'text': s.name}
            for s in Source.objects.filter(company=company)
        ]

    return render(request, 'story/add_or_update_story.html', {
        'form': form,
        'is_update': is_update,
        'tagged_companies_data': [],
        'sources_data': sources_data,
    })


# @login_required
# def view_stories(request):
#     user = request.user
#     company = getattr(user, 'company', None)
#     story = Story.objects.select_related('source', 'created_by', 'updated_by') \
#         .prefetch_related('tagged_companies') \
#         .all()
#     if not company:
#         messages.error(request, "Your account is not associated with any company.")
#         return redirect('home')
#
#     if user.is_staff:
#         stories = story
#     else:
#         stories = story.filter(tagged_companies=company).distinct()
#
#     return render(request, 'story/view_stories.html', {
#         'stories': stories
#     })


@login_required
def delete_story(request, pk):
    story = get_object_or_404(Story, pk=pk)

    # Optional: Check if the user has permission to delete
    if not request.user.is_staff and story.created_by != request.user:
        messages.error(request, "You do not have permission to delete this story.")
        return redirect('story:view_stories')

    story.delete()
    messages.success(request, "Story deleted successfully.")
    return redirect('story:view_stories')


@login_required
def view_stories(request):
    company = getattr(request.user, 'company', None)
    if not company:
        messages.error(request, "Your account is not associated with any company.")
        return redirect('home')

    query = request.GET.get('q', '').strip()

    if request.user.is_staff:
        stories = Story.objects.all()
    else:
        stories = Story.objects.filter(tagged_companies=company).prefetch_related()

    if query:
        stories = stories.filter(
            Q(title__icontains=query) |
            Q(body_text__icontains=query) |
            Q(url__icontains=query)
        ).distinct()
    paginator = Paginator(stories.order_by('-published_date'), 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    stories = stories.select_related('source', 'created_by').prefetch_related('tagged_companies')
    return render(request, 'story/view_stories.html', {'stories': stories, 'query': query,'page_obj':page_obj})

from django.contrib import messages
from django.contrib.postgres.aggregates import ArrayAgg
from django.db import connection
from django.db.models import Q, TextField
from django.db.models.aggregates import Aggregate
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Story, Company
from news_monitoring.forms.storyForm import StoryForm

@login_required
def add_or_update_story(request, pk=None):
    is_update = pk is not None
    story = None
    initial = {}
    tagged_companies_data = []

    if is_update and request.method != 'POST':
        story = (
            Story.objects
            .annotate(
                tagged_company_ids=ArrayAgg('tagged_companies__id', distinct=True),
                tagged_company_names=ArrayAgg('tagged_companies__name', distinct=True),
            )
            .filter(pk=pk)
            .first()
        )

        if not story:
            messages.error(request, "Story not found.")
            return redirect('story:view_stories')

        initial = {
            'title': story.title,
            'url': story.url,
            'published_date': story.published_date,
            'body_text': story.body_text,
            'tagged_companies': story.tagged_company_ids or [],
        }

        tagged_companies_data = [
            {'id': str(cid), 'name': cname}
            for cid, cname in zip(story.tagged_company_ids or [], story.tagged_company_names or [])
        ]

    if request.method == 'POST':
        form = StoryForm(request.POST)
        if form.is_valid():
            tagged_company_ids = request.POST.getlist('tagged_companies')
            company_ids = [int(cid) for cid in tagged_company_ids if cid.isdigit()]
            companies_dict = Company.objects.in_bulk(company_ids)
            tagged_companies = [companies_dict[cid] for cid in company_ids if cid in companies_dict]

            if is_update:
                if not story:
                    story = Story.objects.get(pk=pk)  # fallback in case annotation was skipped
                story.title = form.cleaned_data['title']
                story.url = form.cleaned_data['url']
                story.published_date = form.cleaned_data['published_date']
                story.body_text = form.cleaned_data['body_text']
                story.updated_by = request.user
                story.save()
            else:
                story = form.save(commit=False)
                story.created_by = request.user
                story.save()
            story.tagged_companies.set(tagged_companies)

            messages.success(request, f"Story {'updated' if is_update else 'added'} successfully.")
            return redirect('story:view_stories')
    else:
        form = StoryForm(initial=initial)

    form.fields['tagged_companies'].queryset = Company.objects.all()

    return render(request, 'story/add_or_update_story.html', {
        'form': form,
        'is_update': is_update,
        'tagged_companies_data': tagged_companies_data,
    })


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



# Custom StringAgg class
class StringAgg(Aggregate):
    function = 'STRING_AGG'
    template = "%(function)s(%(expressions)s, ', ')"
    output_field = TextField()


@login_required
def view_stories(request):
    query = request.GET.get('q', '')
    page_number = max(int(request.GET.get('page', 1)), 1)
    per_page = 8

    user = request.user
    company_id = getattr(user, 'company_id', None)

    stories = Story.objects.select_related('source').annotate(
            tagged_company_names=StringAgg('tagged_companies__name'))

    if user.is_staff:
        pass
    elif company_id:
        stories = stories.filter(tagged_companies__id=company_id)
    else:
        stories = stories.filter(created_by=user)

    if query:
        stories = stories.filter(
            Q(title__icontains=query) |
            Q(body_text__icontains=query) | Q(source__name__icontains=query)
        )

    stories = stories.order_by('-published_date')

    # Manual pagination without .count()
    start = (page_number - 1) * per_page
    end = start + per_page
    story_list = list(stories[start:end+1])

    has_next = len(story_list) > per_page
    has_prev = page_number > 1
    page_obj = story_list[:per_page]

    # print(page_number,per_page,has_prev,has_next)

    return render(request, 'story/view_stories.html', {
        'stories': page_obj,
        'page_number': page_number,
        'has_next': has_next,
        'has_prev': has_prev,
        'query': query,
    })


# @login_required
# def view_stories(request):
#     query = request.GET.get('q', '')
#     page_number = int(request.GET.get('page', 1))
#
#     user = request.user
#     company = getattr(user, 'company', None)
#
#     # Base queryset
#     stories = Story.objects.select_related('source').prefetch_related('tagged_companies')
#
#     # Access Control
#     if user.is_staff:
#         pass  # Show all stories
#     elif company:
#         stories = stories.filter(tagged_companies=company)
#     else:
#         stories = stories.filter(source__created_by=user)
#
#     # Search Filter
#     if query:
#         stories = stories.filter(
#             Q(title__icontains=query) |
#             Q(body_text__icontains=query)
#         )
#
#     stories = stories.order_by('-published_date')
#
#     # Pagination
#     paginator = Paginator(stories, 5)
#     page_obj = paginator.get_page(page_number)
#
#     return render(request, 'story/view_stories.html', {
#         'stories': page_obj,
#         'page_number': page_number,
#         'total_pages': paginator.num_pages,
#         'query': query,
#     })

from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
@login_required
def story_angular_view(request):
    return render(request, 'story/story_base.html')
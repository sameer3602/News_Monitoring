
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Story, Source, Company
from news_monitoring.forms.storyForm import StoryForm


@login_required
def add_or_update_story(request, pk=None):
    is_update = pk is not None
    story = get_object_or_404(Story, pk=pk) if is_update else None

    company = getattr(request.user, 'company', None)
    if not company:
        messages.error(request, "Your account is not associated with any company.")
        return redirect('home')

    company_id = str(company.id)

    if is_update:
        source = story.source
    else:
        source = Source.objects.filter(company=company).first()
        if not source:
            messages.error(request, "No source found for your company.")
            return redirect('source:add_source')

    if request.method == 'POST':
        title = request.POST.get('title')
        url = request.POST.get('url')
        published_date = request.POST.get('published_date')
        body_text = request.POST.get('body_text')
        tagged_company_ids = request.POST.getlist('tagged_companies')

        # Get valid company objects
        all_company_ids = [company_id] + tagged_company_ids
        companies = Company.objects.in_bulk(all_company_ids)
        tagged_companies = [companies[int(cid)] for cid in tagged_company_ids if int(cid) in companies]

        if is_update:
            story.title = title
            story.url = url
            story.published_date = published_date
            story.body_text = body_text
            story.source = source
            story.updated_by = request.user
            story.save()
            story.tagged_companies.set(tagged_companies)
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
        initial = {}
        tagged_companies_data = []
        if is_update:
            initial = {
                'title': story.title,
                'url': story.url,
                'published_date': story.published_date,
                'body_text': story.body_text,
            }

            tagged_companies = story.tagged_companies.all()
            tagged_companies_data = [
                {'id': str(company.id), 'name': company.name}
                for company in tagged_companies
            ]

        form = StoryForm(initial=initial, company=company)
        form.fields['tagged_companies'].queryset = Company.objects.all()  # Allow full search

    return render(request, 'story/add_or_update_story.html', {
        'form': form,
        'is_update': is_update,
        'source': source,
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


@login_required
def view_stories(request):
    company = getattr(request.user, '_company_cache', None)
    if not company and hasattr(request.user, 'company_id'):
        company = request.user.company  # cache it
        request.user._company_cache = company

    query = request.GET.get('q', '').strip()
    page_number = request.GET.get('page') or 1

    # Filter based on user role
    if request.user.is_staff:
        stories = Story.objects.all()
    else:
        stories = Story.objects.filter(tagged_companies=company).distinct()

    # Search filter
    if query:
        stories = stories.filter(
            Q(title__icontains=query) |
            Q(body_text__icontains=query) |
            Q(url__icontains=query)
        ).distinct()

    # Optimize DB hits
    stories = stories.select_related('source', 'created_by').prefetch_related('tagged_companies')

    # Paginate
    paginator = Paginator(stories.order_by('-published_date'), 5)
    page_obj = paginator.get_page(page_number)

    # Regular page render
    return render(request, 'story/view_stories.html', {
        'query': query,
        'stories': page_obj.object_list,
        'page_obj': page_obj,
        'page_number': page_obj.number,
        'total_pages': paginator.num_pages
    })

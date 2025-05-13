from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from news_monitoring.forms.sourceForm import SourceForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from news_monitoring.source.models import Source
from news_monitoring.story.models import Story
import feedparser
from django.core.paginator import Paginator

@login_required
def add_or_update_source(request, pk=None):
    is_update = pk is not None
    source = get_object_or_404(Source, pk=pk) if is_update else None

    # Fetch company only once
    company_id = getattr(request.user, 'company_id', None)
    if not company_id:
        messages.error(request, "Your account is not associated with any company.")
        return redirect('company:add_company')

    if request.method == 'POST':
        form = SourceForm(request.POST, instance=source)
        if form.is_valid():
            source_obj = form.save(commit=False)
            source_obj.company_id = company_id  # Avoids fetching company object
            if not is_update:
                source_obj.created_by = request.user
            source_obj.updated_by = request.user
            source_obj.save()
            form.save_m2m()
            messages.success(request, f"Source {'updated' if is_update else 'added'} successfully.")
            return redirect('source:view_sources')
    else:
        form = SourceForm(instance=source)

    return render(request, 'source/add_or_update_source.html', {
        'form': form,
        'is_update': is_update,
    })

# @login_required
# def add_or_update_source(request, pk=None):
#     is_update = pk is not None
#     source = get_object_or_404(Source, pk=pk) if is_update else None
#
#     if request.method == 'POST':
#         form = SourceForm(request.POST)
#         if form.is_valid():
#             source_data = form.cleaned_data
#             company = request.user.company
#             tagged_companies = source_data['tagged_companies']
#
#             if is_update:
#                 source.name = source_data['name']
#                 source.url = source_data['url']
#                 source.company = company
#                 source.updated_by = request.user
#                 source.save()
#                 source.tagged_companies.set(tagged_companies)
#             else:
#                 source = Source.objects.create(
#                     name=source_data['name'],
#                     url=source_data['url'],
#                     company=company,
#                     created_by=request.user
#                 )
#                 source.tagged_companies.set(tagged_companies)
#
#             return redirect('source:view_sources')
#     else:
#         if is_update:
#             tagged_ids = list(source.tagged_companies.values_list('id', flat=True))
#             form = SourceForm(initial={
#                 'name': source.name,
#                 'url': source.url,
#                 'tagged_companies': tagged_ids,
#             })
#         else:
#             form = SourceForm()
#
#         # Always allow all companies for searching
#         form.fields['tagged_companies'].queryset = Company.objects.all()
#
#     return render(request, 'source/add_or_update_source.html', {
#         'form': form,
#         'is_update': is_update,
#         'has_sources': Source.objects.filter(company=request.user.company).exists()
#     })


@login_required
def view_sources(request):
    user = request.user
    if user.is_staff:
        sources = Source.objects.select_related('company').prefetch_related('tagged_companies').all()
    else:
        company = getattr(user, 'company', None)
        sources = Source.objects.select_related('company').prefetch_related('tagged_companies').filter(
            Q(created_by=user) | Q(company=company)
        ).distinct()

    paginator = Paginator(sources, 5)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'source/view_sources.html', {
        'page_obj': page_obj,
    })


@login_required
@require_POST
def delete_source(request, pk):
    source = get_object_or_404(Source, pk=pk)

    if source.created_by == request.user or request.user.is_staff:
        source.delete()
        messages.success(request, "Source deleted successfully.")
    else:
        messages.error(request, "You are not authorized to delete this source.")

    return redirect('source:view_sources')


# @login_required
# def get_sources(request):
#     sources = Source.objects.select_related('company').prefetch_related('tagged_companies')
#
#     if not request.user.is_staff:
#         sources = sources.filter(created_by=request.user)
#
#     paginator = Paginator(sources.order_by('name'), 3)  # Paginate with 10 per page
#     page_number = request.GET.get('page') or 1
#     page_obj = paginator.get_page(page_number)
#
#     source_list = []
#     for source in page_obj.object_list:
#         source_list.append({
#             "pk": source.pk,
#             "name": source.name,
#             "url": source.url,
#             "company": {
#                 "name": source.company.name
#             },
#             "tagged_companies": [company.name for company in source.tagged_companies.all()]
#         })
#
#     return JsonResponse({
#         "sources": source_list,
#         "has_previous": page_obj.has_previous(),
#         "has_next": page_obj.has_next(),
#         "page_number": page_obj.number,
#         "total_pages": paginator.num_pages
#     })
#

from django.shortcuts import redirect
from django.contrib import messages
from django.utils import timezone

@csrf_exempt
@login_required
def fetch_rss(request):
    if request.method == 'GET':
        try:
            source_id = request.GET.get('source_id')
            if not source_id or not source_id.isdigit():
                messages.error(request, "Invalid source ID.")
                return redirect('story:view_stories')

            source = Source.objects.get(pk=source_id)

            rss_url = source.url
            feed = feedparser.parse(rss_url)

            if not feed.entries:
                messages.info(request, "No stories found in the RSS feed.")
                return redirect('story:view_stories')

            for entry in feed.entries:
                story, created = Story.objects.get_or_create(
                    title=entry.get('title', ''),
                    url=entry.get('link', ''),
                    source=source,
                    defaults={
                        'published_date': (
                            entry.get('published_parsed') and
                            timezone.datetime(*entry.published_parsed[:6]) or
                            timezone.now()
                        ),
                        'body_text': entry.get('summary', '')[:1000],
                    }
                )
                # Tag the story to the source's company if needed
                if created and source.company:
                    story.tagged_companies.add(source.company)

            messages.success(request, "Stories fetched and saved successfully.")
            return redirect('story:view_stories')

        except Source.DoesNotExist:
            messages.error(request, "Source not found.")
            return redirect('story:view_stories')

        except Exception as e:
            print("RSS Fetch Error:", e)
            messages.error(request, f"Error fetching stories: {str(e)}")
            return redirect('story:view_stories')

    messages.error(request, "Invalid request method.")
    return redirect('story:view_stories')

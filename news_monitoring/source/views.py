import feedparser
from django.contrib.postgres.aggregates import ArrayAgg
from django.contrib import messages
from django.db.models import Q, Prefetch
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST

from news_monitoring.company.models import Company
from news_monitoring.forms.sourceForm import SourceForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from news_monitoring.source.models import Source
from news_monitoring.story.models import Story


@login_required
def add_or_update_source(request, pk=None):
    is_update = pk is not None
    source = None

    # Determine if this is an update and it's a GET request
    if is_update and request.method == 'GET':
        source = Source.objects.filter(pk=pk) \
            .select_related('company') \
            .annotate(
                tagged_company_ids=ArrayAgg('tagged_companies__id', distinct=True),
                tagged_company_names=ArrayAgg('tagged_companies__name', distinct=True)
            ) \
            .only('id', 'name', 'url', 'company_id') \
            .first()

        if not source:
            messages.error(request, "Source not found.")
            return redirect('source:view_sources')

    # Ensure user has a company
    if not request.user.company_id:
        messages.error(request, "Your account is not associated with any company.")
        return redirect('company:add_company')

    if request.method == 'POST':
        # In POST we just need instance for update, no annotation
        source_instance = Source.objects.get(pk=pk) if is_update else None
        form = SourceForm(request.POST, instance=source_instance)

        if form.is_valid():
            source_obj = form.save(commit=False)
            source_obj.company_id = request.user.company_id  # Avoid refetching company
            if not is_update:
                source_obj.created_by = request.user
            source_obj.updated_by = request.user
            source_obj.save()
            form.save_m2m()
            messages.success(request, f"Source {'updated' if is_update else 'added'} successfully.")
            return redirect('source:view_sources')
    else:
        if is_update:
            form = SourceForm(initial={
                'name': source.name,
                'url': source.url,
                'tagged_companies': source.tagged_company_ids,
            })
        else:
            form = SourceForm()

    return render(request, 'source/add_or_update_source.html', {
        'form': form,
        'is_update': is_update,
    })


# @login_required      #USED JQUERY TO INSERT DATA
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


# @login_required
# def view_sources(request):
#     user = request.user
#     if user.is_staff:
#         sources = Source.objects.select_related('company').prefetch_related('tagged_companies').all()
#     else:
#         # company = getattr(user, 'company', None)
#         sources = Source.objects.select_related('company').prefetch_related('tagged_companies').filter(
#             Q(created_by=user)
#         ).distinct()
#
#     paginator = Paginator(sources, 5)
#     page_number = request.GET.get('page')
#     page_obj = paginator.get_page(page_number)
#
#     return render(request, 'source/view_sources.html', {
#         'page_obj': page_obj,
#     })

@login_required
def view_sources(request):
    user = request.user
    query = request.GET.get('q', '')
    page_number = int(request.GET.get('page', 1))
    page_size = 5
    offset = (page_number - 1) * page_size
    limit = offset + page_size + 1  # fetch 1 extra to check for next page

    # Base queryset
    sources = Source.objects.select_related('company') \
        .annotate(
            tagged_company_ids=ArrayAgg('tagged_companies__id', distinct=True),
            tagged_company_names=ArrayAgg('tagged_companies__name', distinct=True)
        )

    # Access control
    if not user.is_staff:
        sources = sources.filter(created_by=user)

    # Optional search
    if query:
        sources = sources.filter( Q(name__icontains=query) | Q(url__icontains=query) )

    sources = sources.order_by('name')[offset:limit]
    has_next = len(sources) > page_size
    page_obj = sources[:page_size]

    context = {
        'page_obj': page_obj,
        'page_number': page_number,
        'has_next': has_next,
        'has_prev': page_number > 1,
        'query': query
    }

    return render(request, 'source/view_sources.html', context)

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


@csrf_exempt
@login_required
def fetch_rss(request):
    if request.method != 'GET':
        messages.error(request, "Invalid request method.")
        return redirect('story:view_stories')

    source_id = request.GET.get('source_id')
    if not source_id or not source_id.isdigit():
        messages.error(request, "Invalid source ID.")
        return redirect('story:view_stories')

    source = get_object_or_404(Source.objects.prefetch_related('tagged_companies', 'company'), pk=int(source_id))

    feed = feedparser.parse(source.url)
    entries = feed.entries

    if not entries:
        messages.info(request, "No stories found in the RSS feed.")
        return redirect('story:view_stories')

    tagged_companies = list(source.tagged_companies.all())  # Get all tagged companies of the source
    if source.company and source.company not in tagged_companies:
        tagged_companies.append(source.company)
    new_stories = 0

    for entry in entries:
        title = entry.get('title', '').strip()
        url = entry.get('link', '').strip()

        if not title or not url:
            continue

        published_parsed = entry.get('published_parsed')
        published_date = (
            timezone.datetime(*published_parsed[:6]) if published_parsed
            else timezone.now()
        )

        body_text = entry.get('summary', '')[:1000]

        story, created = Story.objects.get_or_create(
            title=title,
            url=url,
            source=source,
            defaults={
                'published_date': published_date,
                'body_text': body_text,
            }
        )

        if created:
            story.tagged_companies.set(tagged_companies)
            new_stories += 1

    if new_stories:
        messages.success(request, f"{new_stories} new stor{'y' if new_stories == 1 else 'ies'} added.")
    else:
        messages.info(request, "No new stories were added.")

    return redirect('story:view_stories')



@ensure_csrf_cookie
@login_required
def source_angular_view(request):
    return render(request, 'source/source_base.html')

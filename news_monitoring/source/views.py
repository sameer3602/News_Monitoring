from django.db.models import Q
from django.utils import timezone
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from news_monitoring.forms.sourceForm import SourceForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from news_monitoring.company.models import Company
from news_monitoring.source.models import Source
from news_monitoring.story.models import Story
import feedparser
from django.core.paginator import Paginator


@login_required
def add_or_update_source(request, pk=None):
    is_update = pk is not None
    source = get_object_or_404(Source, pk=pk) if is_update else None

    if request.method == 'POST':
        form = SourceForm(request.POST)
        if form.is_valid():
            source_data = form.cleaned_data
            company = request.user.company
            tagged_companies = source_data['tagged_companies']

            if is_update:
                source.name = source_data['name']
                source.url = source_data['url']
                source.company = company
                source.updated_by = request.user
                source.save()
                source.tagged_companies.set(tagged_companies)
            else:
                source = Source.objects.create(
                    name=source_data['name'],
                    url=source_data['url'],
                    company=company,
                    created_by=request.user
                )
                source.tagged_companies.set(tagged_companies)

            return redirect('source:view_sources')
    else:
        if is_update:
            tagged_ids = list(source.tagged_companies.values_list('id', flat=True))
            form = SourceForm(initial={
                'name': source.name,
                'url': source.url,
                'tagged_companies': tagged_ids,
            })
        else:
            form = SourceForm()

        # Always allow all companies for searching
        form.fields['tagged_companies'].queryset = Company.objects.all()

    return render(request, 'source/add_or_update_source.html', {
        'form': form,
        'is_update': is_update,
        'has_sources': Source.objects.filter(company=request.user.company).exists()
    })



def view_sources(request):
    sources = Source.objects.select_related('company').prefetch_related('tagged_companies').all()
    paginator = Paginator(sources, 5)  # 10 sources per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, 'source/view_sources.html', {
        'page_obj': page_obj,
    })


@login_required
@csrf_exempt
def delete_source(request, pk):

    if request.method == 'DELETE':
        source = get_object_or_404(Source, pk=pk)
        # Ensure the user is allowed to delete the source
        if source.created_by == request.user or request.user.is_staff:
            source.delete()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'message': 'You are not authorized to delete this source.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method.'})


@login_required
def get_sources(request):
    sources = Source.objects.select_related('company').prefetch_related('tagged_companies')

    if not request.user.is_staff:
        sources = sources.filter(created_by=request.user)

    paginator = Paginator(sources.order_by('name'), 3)  # Paginate with 10 per page
    page_number = request.GET.get('page') or 1
    page_obj = paginator.get_page(page_number)

    source_list = []
    for source in page_obj.object_list:
        source_list.append({
            "pk": source.pk,
            "name": source.name,
            "url": source.url,
            "company": {
                "name": source.company.name
            },
            "tagged_companies": [company.name for company in source.tagged_companies.all()]
        })

    return JsonResponse({
        "sources": source_list,
        "has_previous": page_obj.has_previous(),
        "has_next": page_obj.has_next(),
        "page_number": page_obj.number,
        "total_pages": paginator.num_pages
    })


@csrf_exempt
@login_required
def fetch_rss(request):
    if request.method == 'GET':
        try:
            source_id = request.GET.get('source_id')
            print(source_id)
            if not source_id or not source_id.isdigit():
                return JsonResponse({'message': 'Invalid source ID'}, status=400)

            source = Source.objects.get(pk=source_id)
            print("Source:", source)

            rss_url = source.url
            print("RSS URL:", rss_url)

            feed = feedparser.parse(rss_url)
            print("Feed parsed")

            if not feed.entries:
                return JsonResponse({'message': 'No stories found in RSS feed.'}, status=200)

            for entry in feed.entries:
                Story.objects.get_or_create(
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
            return JsonResponse({'message': 'Stories fetched and saved successfully!'})

        except Source.DoesNotExist:
            return JsonResponse({'message': 'Source not found'}, status=404)
        except Exception as e:
            print("RSS Fetch Error:", e)
            return JsonResponse({'message': f'Error: {str(e)}'}, status=500)

    return JsonResponse({'message': 'Invalid request method.'}, status=400)


from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.csrf import csrf_exempt
from .models import Source
from news_monitoring.forms.sourceForm import SourceForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from news_monitoring.company.models import Company
from news_monitoring.source.models import Source


@login_required
def add_or_update_source(request, pk=None):   #merged the add_source and update_source views here
    is_update = pk is not None
    source = get_object_or_404(Source, pk=pk) if is_update else None

    if request.method == 'POST':
        name = request.POST.get('name')
        url = request.POST.get('url')
        company_id = request.user.company_id
        tagged_company_ids = request.POST.getlist('tagged_companies')

        if name and url and company_id:
            company = Company.objects.get(id=company_id)
            tagged_companies = Company.objects.filter(id__in=tagged_company_ids)

            if is_update:
                # Update existing source
                source.name = name
                source.url = url
                source.company = company
                source.updated_by = request.user
                source.save()
                source.tagged_companies.set(tagged_companies)
            else:
                # Create new source
                source = Source.objects.create(
                    name=name,
                    url=url,
                    company=company,
                    created_by=request.user
                )
                source.tagged_companies.set(tagged_companies)

            return redirect('source:view_sources')

    else:
        if is_update:
            initial = {
                'name': source.name,
                'url': source.url,
                'tagged_companies': source.tagged_companies.all(),
            }
            form = SourceForm(initial=initial)
            # Preload tagged companies for Select2
            tagged_companies_data = [
                {'id': c.id, 'text': c.name}
                for c in source.tagged_companies.all()
            ]
        else:
            form = SourceForm()
            tagged_companies_data = []

    return render(request, 'source/add_or_update_source.html', {
        'form': form,
        'is_update': is_update,
        'tagged_companies_data': tagged_companies_data,
    })


@login_required
def view_sources(request):
    return render(request, 'source/view_sources.html', )


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


def get_sources(request):
    sources = Source.objects.select_related('company').prefetch_related('tagged_companies')
    if not request.user.is_staff:
        sources = sources.filter(created_by=request.user)

    source_list = []
    for source in sources:
        source_list.append({
            "pk": source.pk,
            "name": source.name,
            "url": source.url,
            "company": {
                "name": source.company.name
            },
            "tagged_companies": [company.name for company in source.tagged_companies.all()]
        })

    return JsonResponse({"sources": source_list})

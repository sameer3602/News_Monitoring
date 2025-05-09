from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from news_monitoring.company.models import Company
from news_monitoring.forms.companyForm import CompanyForm

@login_required
def add_company(request):
    if request.method == "POST":
        form = CompanyForm(request.POST)
        if form.is_valid():
            company = form.save(commit=False)
            company.created_by = request.user
            company.updated_by = request.user
            company.save()
            return redirect('source:add_source')  # Go back to source after adding company
    else:
        form = CompanyForm()

    return render(request, 'company/add_company.html', {'form': form})


@login_required
def search_companies(request):
    term = request.GET.get('q', '')
    companies = Company.objects.filter(name__icontains=term)[:10]
    results = [{'id': c.id, 'text': c.name} for c in companies]
    return JsonResponse({'results': results})

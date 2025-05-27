from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from ..company.models import Company
from ..forms.companyForm import CompanyForm
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
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



@ensure_csrf_cookie
@login_required
def search_companies(request):
    term = request.GET.get('q', '')
    companies = Company.objects.filter(name__icontains=term)[:10]
    results = [{'id': c.id, 'text': c.name} for c in companies]
    return JsonResponse({'results': results})

# from rest_framework import viewsets
# from .models import Company
# from .serializers import CompanySerializer
# from rest_framework.permissions import IsAuthenticated  # optional
#
# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset = Company.objects.all()
#     serializer_class = CompanySerializer
#     permission_classes = [IsAuthenticated]  # remove this if you want open access

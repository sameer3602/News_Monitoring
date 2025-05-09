from django import forms

from news_monitoring.company.models import Company
from news_monitoring.source.models import Source

class SourceForm(forms.ModelForm):
    class Meta:
        model = Source
        fields = ['name', 'url', 'tagged_companies', 'company']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.pk:
            # Ensure that all currently selected companies are in the queryset
            self.fields['tagged_companies'].queryset = Company.objects.filter(
                id__in=self.instance.tagged_companies.values_list('id', flat=True)
            )
        else:
            self.fields['tagged_companies'].queryset = Company.objects.none()

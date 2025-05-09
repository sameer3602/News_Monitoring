from django import forms
from news_monitoring.company.models import Company

class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['name', 'domain_name']
        widgets = {
            'domain_name': forms.URLInput(attrs={'placeholder': 'https://example.com'}),
        }

    def __init__(self, *args, **kwargs):
        super(CompanyForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs.update({'placeholder': 'Enter company name'})
        self.fields['domain_name'].widget.attrs.update({'placeholder': 'Enter company domain'})

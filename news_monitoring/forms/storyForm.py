from django import forms
from news_monitoring.story.models import Story
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company

class StoryForm(forms.ModelForm):
    class Meta:
        model = Story
        fields = ['title', 'url', 'published_date', 'source', 'body_text', 'tagged_companies']

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        company = kwargs.pop('company', None)
        super().__init__(*args, **kwargs)

        if self.user:
            self.fields['tagged_companies'].queryset = Company.objects.filter(id=self.user.company.id)
        if company:
            self.fields['source'].queryset = Source.objects.filter(company=company)

from rest_framework import viewsets
from django.db.models import Q
from django.contrib.postgres.aggregates import JSONBAgg
from django.db.models.expressions import F
from django.db.models.functions import JSONObject
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from news_monitoring.story.models import Story
from news_monitoring.story.api.serializers import StorySerializer

class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    pagination_size = 8
    total_pages_fixed = 10000  # Fixed total pages

    def get_queryset(self):
        user = self.request.user
        company_id = getattr(user, 'company_id', None)

        queryset = Story.objects.select_related('source')

        if not user.is_staff:
            if company_id:
                queryset = queryset.filter(tagged_companies__id=company_id)
            else:
                queryset = queryset.filter(created_by=user)

        # Annotate tagged_companies_details (list of {id, name})
        queryset = queryset.annotate(tagged_companies_details=JSONBAgg(
            JSONObject(
                id=F("tagged_companies__id"),
                name=F("tagged_companies__name")
            ),
            distinct=True
        )).order_by("-published_date")

        return queryset

    def list(self, request, *args, **kwargs):
        query = request.GET.get('q', '').strip()
        page_number = max(int(request.GET.get('page', 1)), 1)
        per_page = self.pagination_size

        queryset = self.get_queryset()

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(body_text__icontains=query) |
                Q(source__name__icontains=query)
            )

        # Manual pagination
        start = (page_number - 1) * per_page
        end = start + per_page
        stories_slice = list(queryset[start:end + 1])  # Extra one to detect "has_next"

        has_next = len(stories_slice) > per_page
        has_prev = page_number > 1
        stories_page = stories_slice[:per_page]

        serializer = self.get_serializer(stories_page, many=True)

        return Response({
            'stories': serializer.data,
            'page_number': page_number,
            'has_next': has_next,
            'has_prev': has_prev,
            'total_pages': self.total_pages_fixed,
            'query': query,
        })


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if not user.is_staff and user.company not in instance.tagged_companies.all():
            raise PermissionDenied("You don't have permission to delete this story.")
        return super().destroy(request, *args, **kwargs)

    # def perform_create(self, serializer):
    #     company = serializer.validated_data.get('company')
    #     if not company:
    #         company = self.request.user.company
    #     serializer.save(added_by=self.request.user, company=company)

    def perform_update(self, serializer):
        story = serializer.instance
        user = self.request.user

        if not user.is_staff and story.created_by != user:
            raise PermissionDenied("You don't have permission to update this story.")

        validated_data = serializer.validated_data
        story.title = validated_data.get('title', story.title)
        story.url = validated_data.get('url', story.url)
        story.body_text = validated_data.get('body_text', story.body_text)
        story.published_date = validated_data.get('published_date', story.published_date)
        story.updated_by = user

        story.save()

        # Handle M2M for tagged_companies
        if 'tagged_companies_ids' in validated_data:
            story.tagged_companies.set(validated_data['tagged_companies_ids'])

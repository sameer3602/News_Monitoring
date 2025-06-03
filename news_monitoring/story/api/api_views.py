from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.postgres.aggregates import StringAgg
from django.db.models import Q, Prefetch
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.core.paginator import Paginator
from news_monitoring.company.models import Company
from news_monitoring.story.models import Story
from news_monitoring.story.api.serializers import StorySerializer

class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        company_id = getattr(user, 'company_id', None)

        base_qs = Story.objects.all()


        if not user.is_staff:
            if company_id:
                base_qs = base_qs.filter(tagged_companies__id=company_id)
            else:
                base_qs = base_qs.filter(created_by=user)


        base_qs = base_qs.prefetch_related(
            Prefetch('tagged_companies')
        ).annotate(
            tagged_company_names=StringAgg('tagged_companies__name', delimiter=', ', distinct=True)
        )

        return base_qs

    def list(self, request, *args, **kwargs):
        query = request.GET.get('q', '')
        page_number = max(int(request.GET.get('page', 1)), 1)
        per_page = 8

        queryset = self.get_queryset()

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(body_text__icontains=query) |
                Q(source__name__icontains=query)
            )

        queryset = queryset.order_by('-published_date')

        paginator = Paginator(queryset, per_page)
        page = paginator.get_page(page_number)

        serializer = self.get_serializer(page.object_list, many=True)

        return Response({
            'stories': serializer.data,
            'page_number': page_number,
            'has_next': page.has_next(),
            'has_prev': page.has_previous(),
            'query': query,
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if not user.is_staff and user.company not in instance.tagged_companies.all():
            raise PermissionDenied("You don't have permission to delete this story.")
        return super().destroy(request, *args, **kwargs)

    def perform_update(self, serializer):
        company = serializer.validated_data.get('company')
        if not company:
            company = self.request.user.company
        serializer.save(updated_by=self.request.user, company=company)

    # def perform_create(self, serializer):
    #     company = serializer.validated_data.get('company')
    #     if not company:
    #         company = self.request.user.company
    #     serializer.save(added_by=self.request.user, company=company)

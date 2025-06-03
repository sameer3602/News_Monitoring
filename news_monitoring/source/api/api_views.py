from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from news_monitoring.source.models import Source
from .serializers import SourceSerializer
from rest_framework.exceptions import PermissionDenied
import feedparser
from rest_framework.decorators import  permission_classes, api_view
from rest_framework.response import Response
from news_monitoring.story.models import Story


class SourceViewSet(viewsets.ModelViewSet):
    serializer_class = SourceSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        page_number = int(request.GET.get('page', 1))
        page_size = 3

        base_queryset = Source.objects.select_related('company')

        if not user.is_staff:
            base_queryset = base_queryset.filter(created_by=user)

        base_queryset = base_queryset.prefetch_related(
            Prefetch('tagged_companies')
        ).order_by('name')

        paginator = Paginator(base_queryset, page_size)
        page = paginator.get_page(page_number)

        serializer = SourceSerializer(page.object_list, many=True)

        return Response({
            'results': serializer.data,
            'page_number': page.number,
            'has_next': page.has_next(),
            'has_prev': page.has_previous(),
            'page_size': page_size,
            'total_items': paginator.count,
            'total_pages': paginator.num_pages,
        })

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)


    def perform_update(self, serializer):
        # Ensure user can only update sources they created unless staff
        source = self.get_object()
        user = self.request.user
        if not user.is_staff and source.created_by != user:
            raise PermissionDenied("You don't have permission to update this source.")
        serializer.save(updated_by=user)


    def perform_destroy(self, instance):
        user = self.request.user
        if not user.is_staff and instance.created_by != user:
            raise PermissionDenied("You don't have permission to delete this source.")
        instance.delete()


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_stories(request, source_id):
    user=request.user

    source = get_object_or_404(
        Source.objects.select_related('company').prefetch_related(
            Prefetch('tagged_companies')),pk=source_id )

    feed = feedparser.parse(source.url)
    entries = feed.entries

    if not entries:
        return Response({"message": "No stories found in the RSS feed."}, status=status.HTTP_204_NO_CONTENT)


    tagged_companies = list(source.tagged_companies.all())
    tagged_company_ids={company.id for company in tagged_companies}
    userCompany=user.company


    urls = [entry.get('link', '').strip() for entry in entries if entry.get('link')]
    existing_urls = set(
        Story.objects.filter(company=userCompany, url__in=urls).values_list('url', flat=True))

    stories_to_create = []

    for entry in entries:
        title = entry.get('title', '').strip()
        url = entry.get('link', '').strip()
        if not url or url in existing_urls:
            continue
        published_date = (
            timezone.datetime(*entry.published_parsed[:6])
            if entry.get('published_parsed')
            else timezone.now()
        )
        body_text = entry.get('summary', '')[:1000]

        stories_to_create.append(
            Story(
                title=title,
                url=url,
                source=source,
                published_date=published_date,
                body_text=body_text,
                created_by=user,
                company=userCompany
            )
        )

    if not stories_to_create:
        return Response({"message": "No new stories to add."}, status=status.HTTP_200_OK)


    with transaction.atomic():
        created_stories = Story.objects.bulk_create(stories_to_create)
        throughModel = Story.tagged_companies.through
        set_tagged_companies = []
        for story in created_stories:
            for company_id in tagged_company_ids:
                set_tagged_companies.append(throughModel(story_id=story.id, company_id=company_id))

        throughModel.objects.bulk_create(set_tagged_companies)
    story_data = [
        {"title": story.title, "published_date": story.published_date}
        for story in created_stories
    ]

    return Response({
        "stories": story_data,
        "message": f"{len(created_stories)} new stor{'y' if len(created_stories) == 1 else 'ies'} added."
    }, status=status.HTTP_201_CREATED)

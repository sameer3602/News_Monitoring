from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from news_monitoring.source.models import Source
from news_monitoring.company.models import Company
from .serializers import SourceSerializer, CompanySerializer
from rest_framework.exceptions import PermissionDenied
import feedparser
from rest_framework.decorators import action, permission_classes, api_view
from rest_framework.response import Response
from news_monitoring.story.models import Story


class SourceViewSet(viewsets.ModelViewSet):
    serializer_class = SourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Staff users can see all sources
        if user.is_staff:
            return Source.objects.all()
        # Normal users only see sources they created
        return Source.objects.filter(created_by=user)


    def perform_create(self, serializer):
        print("inside perform_create")
        print("Creating source with data:", serializer.validated_data)
        serializer.save(created_by=self.request.user, updated_by=self.request.user)


    def perform_update(self, serializer):
        # Ensure user can only update sources they created unless staff
        source = self.get_object()
        print("Source being updated:", source)
        user = self.request.user
        if not user.is_staff and source.created_by != user:
            raise PermissionDenied("You don't have permission to update this source.")
        serializer.save(updated_by=user)


    def perform_destroy(self, instance):
        # Ensure user can only delete sources they created unless staff
        user = self.request.user
        if not user.is_staff and instance.created_by != user:
            raise PermissionDenied("You don't have permission to delete this source.")
        instance.delete()


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_stories(request, source_id):
    source = get_object_or_404(Source.objects.prefetch_related('tagged_companies', 'company'), pk=source_id)

    feed = feedparser.parse(source.url)
    entries = feed.entries

    if not entries:
        return Response({"message": "No stories found in the RSS feed."}, status=200)

    tagged_companies = list(source.tagged_companies.all())
    if source.company and source.company not in tagged_companies:
        tagged_companies.append(source.company)

    new_stories = 0
    story_data = []

    for entry in entries:
        title = entry.get('title', '').strip()
        url = entry.get('link', '').strip()
        if not title or not url:
            continue

        published_parsed = entry.get('published_parsed')
        published_date = timezone.datetime(*published_parsed[:6]) if published_parsed else timezone.now()
        body_text = entry.get('summary', '')[:1000]

        story, created = Story.objects.get_or_create(
            title=title,
            url=url,
            source=source,
            defaults={
                'published_date': published_date,
                'body_text': body_text,
            }
        )

        if created:
            story.tagged_companies.set(tagged_companies)
            new_stories += 1

        story_data.append({
            "title": story.title,
            "published_date": story.published_date,
        })

    return Response({
        "message": f"{new_stories} new stor{'y' if new_stories == 1 else 'ies'} added.",
        "stories": story_data
    }, status=200)



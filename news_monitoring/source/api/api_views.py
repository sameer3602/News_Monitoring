from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from news_monitoring.source.models import Source
from .serializers import SourceSerializer
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


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_stories(request, source_id):
    source = get_object_or_404(Source.objects.prefetch_related('tagged_companies', 'company'), pk=source_id)

    feed = feedparser.parse(source.url)
    entries = feed.entries

    if not entries:
        return Response({"message": "No stories found in the RSS feed."}, status=status.HTTP_204_NO_CONTENT)

    tagged_companies = list(source.tagged_companies.all())
    if source.company and source.company not in tagged_companies:
        tagged_companies.append(source.company)

    story_data = []
    stories_to_create = []
    existing_stories = set(
        Story.objects.filter(source=source).values_list('title', 'url')
    )

    for entry in entries:
        title = entry.get('title', '').strip()
        url = entry.get('link', '').strip()
        if not title or not url or (title, url) in existing_stories:
            continue

        published_parsed = entry.get('published_parsed')
        published_date = (
            timezone.datetime(*published_parsed[:6]) if published_parsed
            else timezone.now()
        )
        body_text = entry.get('summary', '')[:1000]

        story = Story(
            title=title,
            url=url,
            source=source,
            published_date=published_date,
            body_text=body_text
        )
        stories_to_create.append(story)
    created_stories = Story.objects.bulk_create(stories_to_create)
    for story in created_stories:
        story_data.append({
            "title": story.title,
            "published_date": story.published_date,
        })
        story.tagged_companies.set(tagged_companies)

    # serialized_stories = StorySerializer(created_stories, many=True)
    # return Response(
    #     {"stories":serialized_stories.data,"message": f"{len(created_stories)} new stor{'y' if len(created_stories) == 1 else 'ies'} added."},
    #     status=status.HTTP_201_CREATED if created_stories else status.HTTP_200_OK
    # )
    print("stories are",story_data,created_stories)
    return Response({"stories": story_data,"message": f"{len(created_stories)} new stor{'y' if len(created_stories) == 1 else 'ies'} added."}, status=200)

from rest_framework import serializers
from news_monitoring.company.models import Company
from news_monitoring.source.models import Source



class SourceSerializer(serializers.ModelSerializer):
    # Write: Accept list of company IDs
    tagged_companies_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    # Read: Use the precomputed annotated field from queryset
    tagged_companies_details = serializers.ListField(read_only=True)

    class Meta:
        model = Source
        fields = ['id', 'name', 'url', 'tagged_companies_details', 'tagged_companies_ids']






    # def create(self, validated_data):
    #     tagged_company_ids = validated_data.pop('tagged_companies', [])
    #     source = Source.objects.create(**validated_data, created_by=self.context['request'].user)
    #     if tagged_company_ids:
    #         source.tagged_companies.set(tagged_company_ids)
    #     return source
    #
    # def update(self, instance, validated_data):
    #     tagged_company_ids = validated_data.pop('tagged_companies', None)
    #     for attr, value in validated_data.items():
    #         setattr(instance, attr, value)
    #     instance.updated_by = self.context['request'].user
    #     instance.save()
    #     if tagged_company_ids is not None:
    #         instance.tagged_companies.set(tagged_company_ids)
    #     return instance

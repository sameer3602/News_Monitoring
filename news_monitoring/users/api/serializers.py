from rest_framework import serializers
from news_monitoring.users.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'company', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']



from rest_framework import serializers
from news_monitoring.company.models import Company

class CompanySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'updated_by']

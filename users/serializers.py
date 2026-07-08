from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    is_active = serializers.BooleanField(source='user.is_active')
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'password']
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password', None)
        
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data.get('email', ''),
            first_name=user_data.get('first_name', ''),
            last_name=user_data.get('last_name', ''),
            password=password or 'default_password_123'
        )
        
        profile = UserProfile.objects.create(user=user, **validated_data)
        return profile

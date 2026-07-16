from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, ModulePermission
from roles.models import Role

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    is_active = serializers.BooleanField(source='user.is_active')
    role_name = serializers.CharField(source='role.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'role', 'role_name', 'role_permissions', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_role_permissions(self, obj):
        return list(obj.permissions.values_list('code', flat=True)) or (
            list(obj.role.permissions.values_list('code', flat=True)) if obj.role else []
        )

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

class UserCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    password = serializers.CharField(write_only=True, required=False)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False, allow_null=True)

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

class ModulePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModulePermission
        fields = ['id', 'role', 'module', 'permission', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class RoleSerializer(serializers.Serializer):
    role = serializers.CharField()
    count = serializers.IntegerField()

from rest_framework import serializers
from .models import Notification, NotificationPreference
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.CharField(source='recipient.username', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class NotificationPreferenceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_notifications', 'email_leads', 'email_quotations', 
            'email_projects', 'email_inventory',
            'push_notifications', 'push_leads', 'push_quotations',
            'push_projects', 'push_inventory',
            'in_app_leads', 'in_app_quotations', 'in_app_projects',
            'in_app_inventory'
        ]

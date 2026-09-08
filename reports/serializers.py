from rest_framework import serializers
from .models import SystemActivity, Alert, MetricSnapshot, SavedReport, ScheduledReport
from django.contrib.auth import get_user_model

User = get_user_model()


class SystemActivitySerializer(serializers.ModelSerializer):
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = SystemActivity
        fields = [
            'id', 'module', 'action', 'action_type', 'description', 'performed_by', 'performed_by_username',
            'performed_by_name', 'department', 'reference_id', 'reference_type',
            'old_value', 'new_value', 'ip_address', 'user_agent', 'created_at',
        ]


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = [
            'id', 'title', 'description', 'category', 'priority', 'status',
            'reference_id', 'reference_type', 'resolved_at', 'resolution_notes',
            'due_date', 'metadata', 'assigned_to', 'resolved_by',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['resolved_by', 'resolved_at', 'created_at', 'updated_at']


class MetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricSnapshot
        fields = ['id', 'metric_key', 'value', 'snapshot_date', 'metadata']


class SavedReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedReport
        fields = ['id', 'name', 'module', 'fields', 'filters', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = ['id', 'saved_report', 'frequency', 'recipients', 'last_run_at', 'is_active']

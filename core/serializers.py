from rest_framework import serializers
from core.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    module_display = serializers.CharField(source='get_module_display', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'module', 'module_display', 'record_id', 'record_name',
            'action', 'action_display', 'description', 'previous_value',
            'new_value', 'performed_by', 'performed_by_name', 'ip_address',
            'timestamp'
        ]
        read_only_fields = ['timestamp']

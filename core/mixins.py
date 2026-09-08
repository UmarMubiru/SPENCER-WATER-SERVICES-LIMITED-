from rest_framework import viewsets
from django.contrib.auth import get_user_model
from core.models import AuditLog

User = get_user_model()


class AuditLogMixin:
    """
    Mixin to automatically log changes to models in the AuditLog table.
    Add this to any ViewSet to enable automatic audit logging.
    """
    audit_log_module = None  # Should be set in the ViewSet (e.g., 'HR', 'INVENTORY')
    audit_log_record_name_field = None  # Field to use for record name (e.g., 'full_name', 'name')

    def perform_create(self, serializer):
        """Log when a record is created"""
        instance = serializer.save()
        self._create_audit_log(
            instance=instance,
            action='created',
            description=f'Created {self.audit_log_module} record'
        )
        return instance

    def perform_update(self, serializer):
        """Log when a record is updated with field-level changes"""
        instance = self.get_object()
        old_data = self._get_model_data(instance)
        updated_instance = serializer.save()
        new_data = self._get_model_data(updated_instance)

        # Detect changes
        changes = self._detect_changes(old_data, new_data)
        if changes:
            for field_name, (old_value, new_value) in changes.items():
                self._create_audit_log(
                    instance=updated_instance,
                    action='updated',
                    description=f'Updated {field_name.replace("_", " ")}',
                    previous_value=str(old_value) if old_value else None,
                    new_value=str(new_value) if new_value else None
                )
        else:
            self._create_audit_log(
                instance=updated_instance,
                action='updated',
                description=f'Updated {self.audit_log_module} record'
            )

        return updated_instance

    def perform_destroy(self, instance):
        """Log when a record is deleted"""
        record_name = self._get_record_name(instance)
        self._create_audit_log(
            instance=instance,
            action='deleted',
            description=f'Deleted {self.audit_log_module} record: {record_name}'
        )
        instance.delete()

    def _get_model_data(self, instance):
        """Get model data as dictionary, excluding relations"""
        data = {}
        for field in instance._meta.fields:
            if not field.is_relation and field.name != 'id':
                data[field.name] = getattr(instance, field.name)
        return data

    def _detect_changes(self, old_data, new_data):
        """Detect which fields changed between old and new data"""
        changes = {}
        for field_name in old_data:
            if old_data[field_name] != new_data.get(field_name):
                changes[field_name] = (old_data[field_name], new_data.get(field_name))
        return changes

    def _get_record_name(self, instance):
        """Get a human-readable name for the record"""
        if self.audit_log_record_name_field:
            return str(getattr(instance, self.audit_log_record_name_field, 'Unknown'))
        return str(instance)

    def _create_audit_log(self, instance, action, description, previous_value=None, new_value=None):
        """Create an audit log entry"""
        try:
            user = self.request.user if self.request.user.is_authenticated else None
            AuditLog.objects.create(
                module=self.audit_log_module,
                record_id=instance.id,
                record_name=self._get_record_name(instance),
                action=action,
                description=description,
                previous_value=previous_value,
                new_value=new_value,
                performed_by=user,
                ip_address=self._get_client_ip()
            )
        except Exception as e:
            # Don't break the main operation if logging fails
            print(f"Failed to create audit log: {e}")

    def _get_client_ip(self):
        """Get the client IP address from the request"""
        if self.request:
            x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = self.request.META.get('REMOTE_ADDR')
            return ip
        return None

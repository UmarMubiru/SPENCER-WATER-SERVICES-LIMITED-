from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AuditLog(models.Model):
    """Generic audit log for all modules"""
    MODULE_CHOICES = [
        ('HR', 'Human Resources'),
        ('INVENTORY', 'Inventory'),
        ('PROJECTS', 'Projects'),
        ('TENDERS', 'Tenders'),
        ('CRM', 'Customer Relationship Management'),
        ('FINANCIAL', 'Financial'),
        ('SUPPLIERS', 'Suppliers'),
    ]

    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('unassigned', 'Unassigned'),
        ('uploaded', 'Uploaded'),
        ('downloaded', 'Downloaded'),
        ('exported', 'Exported'),
        ('other', 'Other'),
    ]

    module = models.CharField(max_length=20, choices=MODULE_CHOICES)
    record_id = models.IntegerField()
    record_name = models.CharField(max_length=255)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    previous_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['module', '-timestamp']),
            models.Index(fields=['record_id']),
            models.Index(fields=['performed_by']),
        ]

    def __str__(self):
        return f"{self.get_module_display()} - {self.record_name} - {self.get_action_display()}"

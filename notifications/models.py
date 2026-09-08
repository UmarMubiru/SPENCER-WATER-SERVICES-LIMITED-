from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Notification(models.Model):
    TYPE_CHOICES = [
        ('lead_new', 'New Lead'),
        ('lead_assigned', 'Lead Assigned'),
        ('lead_status', 'Lead Status Change'),
        ('quotation_created', 'Quotation Created'),
        ('quotation_submitted', 'Quotation Submitted'),
        ('quotation_approved', 'Quotation Approved'),
        ('quotation_sent', 'Quotation Sent'),
        ('quotation_accepted', 'Quotation Accepted'),
        ('quotation_rejected', 'Quotation Rejected'),
        ('quotation_revision', 'Quotation Revision Requested'),
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('inventory_low', 'Low Inventory'),
        ('employee_change', 'Employee Change'),
        ('employee_allocation_review', 'Employee Allocation Review'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional link to related object
    lead_id = models.UUIDField(null=True, blank=True)
    quotation_id = models.UUIDField(null=True, blank=True)
    project_id = models.UUIDField(null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email notifications
    email_notifications = models.BooleanField(default=True)
    email_leads = models.BooleanField(default=True)
    email_quotations = models.BooleanField(default=True)
    email_projects = models.BooleanField(default=True)
    email_inventory = models.BooleanField(default=True)
    
    # Push notifications
    push_notifications = models.BooleanField(default=True)
    push_leads = models.BooleanField(default=True)
    push_quotations = models.BooleanField(default=True)
    push_projects = models.BooleanField(default=True)
    push_inventory = models.BooleanField(default=True)
    
    # In-app notifications
    in_app_leads = models.BooleanField(default=True)
    in_app_quotations = models.BooleanField(default=True)
    in_app_projects = models.BooleanField(default=True)
    in_app_inventory = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f"Preferences for {self.user.username}"

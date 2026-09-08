from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class SystemActivity(models.Model):
    """Append-only. No update/delete ever exposed via API — corrections are new entries, not edits."""
    ACTION_COLOR_MAP = {
        'created': 'green', 'updated': 'yellow', 'assigned': 'blue',
        'approved': 'purple', 'warning': 'orange', 'deleted': 'red', 'failed_login': 'black',
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.CharField(max_length=30, db_index=True)          # 'employment', 'projects', 'inventory', 'crm', 'users', 'content', 'tenders', 'security'
    action = models.CharField(max_length=100)                          # 'Employee Status Updated'
    action_type = models.CharField(max_length=30, default='updated', db_index=True)
    description = models.TextField(blank=True)

    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_index=True, related_name='system_activities')
    performed_by_name = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=100, blank=True)          # snapshot at time of action, not a live FK

    reference_id = models.CharField(max_length=255, blank=True)        # 'EMP-0023', 'PRJ-2026-004'
    reference_type = models.CharField(max_length=255, blank=True)      # 'Employee', 'Project', 'InventoryItem'

    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['module', 'created_at'])]
        verbose_name = 'System Activity'
        verbose_name_plural = 'System Activities'

    def __str__(self):
        return f"{self.module} - {self.action}"


class Alert(models.Model):
    """Live/stateful — dismissible, unlike the append-only SystemActivity."""
    PRIORITY_CHOICES = [('critical', 'Critical'), ('high', 'High'), ('medium', 'Medium'), ('low', 'Low')]
    STATUS_CHOICES = [('open', 'Open'), ('in_progress', 'In Progress'), ('resolved', 'Resolved'), ('closed', 'Closed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default='Untitled Alert')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    reference_id = models.CharField(max_length=255, blank=True)
    reference_type = models.CharField(max_length=255, blank=True)

    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    due_date = models.DateTimeField(null=True, blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_alerts')
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Alert'
        verbose_name_plural = 'Alerts'

    def __str__(self):
        return f"{self.title} ({self.get_priority_display()})"


class MetricSnapshot(models.Model):
    """Pre-computed daily/weekly metrics — Insights page reads these, never computes live."""
    metric_key = models.CharField(max_length=100, db_index=True)   # 'employee_availability_rate', 'quotation_success_rate'
    value = models.DecimalField(max_digits=12, decimal_places=2)
    snapshot_date = models.DateField(db_index=True)
    metadata = models.JSONField(null=True, blank=True)  # extra context, e.g. {'department': 'Technical'}

    class Meta:
        unique_together = ('metric_key', 'snapshot_date')
        ordering = ['-snapshot_date']
        verbose_name = 'Metric Snapshot'
        verbose_name_plural = 'Metric Snapshots'

    def __str__(self):
        return f"{self.metric_key} - {self.snapshot_date}"


class SavedReport(models.Model):
    name = models.CharField(max_length=150)
    module = models.CharField(max_length=30)
    fields = models.JSONField()          # list of field names selected
    filters = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Saved Report'
        verbose_name_plural = 'Saved Reports'

    def __str__(self):
        return self.name


class ScheduledReport(models.Model):
    FREQUENCY_CHOICES = [('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('quarterly', 'Quarterly')]
    saved_report = models.ForeignKey(SavedReport, on_delete=models.CASCADE, related_name='schedules')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    recipients = models.JSONField(default=list)   # list of User ids or emails
    last_run_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-saved_report__created_at']
        verbose_name = 'Scheduled Report'
        verbose_name_plural = 'Scheduled Reports'

    def __str__(self):
        return f"{self.saved_report.name} - {self.get_frequency_display()}"

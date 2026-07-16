from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Report(models.Model):
    class Status(models.TextChoices):
        QUEUED = "QUEUED", "Queued"
        PROCESSING = "PROCESSING", "Processing"
        READY = "READY", "Ready"
        FAILED = "FAILED", "Failed"

    class Category(models.TextChoices):
        EXECUTIVE = "EXECUTIVE", "Executive"
        PROJECT = "PROJECT", "Project"
        FINANCIAL = "FINANCIAL", "Financial"
        TENDER = "TENDER", "Tender"
        INVENTORY = "INVENTORY", "Inventory"
        CRM = "CRM", "CRM"

    class FileFormat(models.TextChoices):
        PDF = "PDF", "PDF"
        XLSX = "XLSX", "Excel"

    category = models.CharField(max_length=30, choices=Category.choices)
    report_type = models.CharField(max_length=100)  # "Weekly Stock Report", "Executive Summary"
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    file = models.FileField(upload_to="reports/", null=True, blank=True)
    file_format = models.CharField(max_length=10, choices=FileFormat.choices, default=FileFormat.PDF)
    date_range_start = models.DateField(null=True, blank=True)
    date_range_end = models.DateField(null=True, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='generated_reports')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-requested_at']
        verbose_name = "Report"
        verbose_name_plural = "Reports"

    def __str__(self):
        return f"{self.report_type} ({self.status})"

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ContentVersion(models.Model):
    class ContentType(models.TextChoices):
        BLOG = "BLOG", "Blog"
        TESTIMONIAL = "TESTIMONIAL", "Testimonial"
        PORTFOLIO = "PORTFOLIO", "Portfolio"
        SERVICE = "SERVICE", "Service"
        CORE_PAGE = "CORE_PAGE", "Core Page"

    class ActionType(models.TextChoices):
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"

    content_type = models.CharField(max_length=20, choices=ContentType.choices)
    content_id = models.IntegerField()  # ID of the related content item
    action = models.CharField(max_length=20, choices=ActionType.choices)
    content_snapshot = models.JSONField()  # Store the full content as JSON
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='content_versions')
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, help_text="Reason for the change")

    class Meta:
        ordering = ['-changed_at']
        verbose_name = "Content Version"
        verbose_name_plural = "Content Versions"

    def __str__(self):
        return f"{self.content_type} #{self.content_id} - {self.action} by {self.changed_by}"

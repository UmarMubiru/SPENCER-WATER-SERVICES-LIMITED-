from django.db import models
import uuid


class ProjectMilestone(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("blocked", "Blocked"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="milestones")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    blocked_reason = models.TextField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0)


class ProjectTeamAssignmentHistory(models.Model):
    ROLE_CHOICES = [
        ("lead", "Project Lead"),
        ("member", "Team Member"),
    ]
    ACTION_CHOICES = [
        ("assigned", "Assigned"),
        ("reassigned", "Reassigned"),
        ("removed", "Removed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="assignment_history")
    technician = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    changed_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, related_name="changed_assignments")


class ProjectCostLine(models.Model):
    SOURCE_CHOICES = [
        ("material_issuance", "Material Issuance"),
        ("labour", "Labour"),
        ("other", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="cost_lines")
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    stock_movement_reference = models.ForeignKey("inventory.StockMovement", on_delete=models.SET_NULL, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)


class ProjectDocument(models.Model):
    DOC_CHOICES = [
        ("site_photo", "Site Photo"),
        ("completion_report", "Completion Report"),
        ("client_signoff", "Client Sign-off"),
        ("other", "Other"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="project_documents/", null=True, blank=True)
    document_type = models.CharField(max_length=30, choices=DOC_CHOICES)
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, related_name="uploaded_documents")
    uploaded_at = models.DateTimeField(auto_now_add=True)


class ProjectHistory(models.Model):
    EVENT_CHOICES = [
        ("created", "Created"),
        ("team_changed", "Team Changed"),
        ("milestone_updated", "Milestone Updated"),
        ("status_changed", "Status Changed"),
        ("cost_recorded", "Cost Recorded"),
        ("document_added", "Document Added"),
        ("completed", "Completed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="history")
    event_type = models.CharField(max_length=30, choices=EVENT_CHOICES)
    description = models.TextField()
    actor = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

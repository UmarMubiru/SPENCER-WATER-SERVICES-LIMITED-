from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
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
    # stock_movement_reference = models.ForeignKey("inventory.StockMovement", on_delete=models.SET_NULL, null=True, blank=True)
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


class ProjectFieldHistory(models.Model):
    """Track field-level changes to projects for audit trail"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="field_history")
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, related_name="field_changes")
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']
        verbose_name = "Project Field History"
        verbose_name_plural = "Project Field Histories"

    def __str__(self):
        return f"{self.project.name} - {self.field_name} changed by {self.changed_by}"


class ProjectActivity(models.Model):
    """Track execution activities for a project"""
    STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="activities")
    activity_name = models.CharField(max_length=255, default="New Activity")
    order = models.PositiveIntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    progress = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = "Project Activity"
        verbose_name_plural = "Project Activities"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({"end_date": "End date must be after or equal to start date."})

    def __str__(self):
        return f"{self.project.name} - {self.order}. {self.activity_name}"


class ActivityUpdateHistory(models.Model):
    """Track activity lifecycle updates before/after change, date, and actor."""
    ACTION_CHOICES = [
        ("created", "Created"),
        ("updated", "Updated"),
        ("status_changed", "Status Changed"),
        ("progress_changed", "Progress Changed"),
        ("resource_changed", "Resources Changed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity = models.ForeignKey(ProjectActivity, on_delete=models.CASCADE, related_name="update_history")
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    before_value = models.TextField(blank=True, null=True)
    after_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_updates")
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']
        verbose_name = "Activity Update History"
        verbose_name_plural = "Activity Update Histories"

    def __str__(self):
        return f"{self.activity.activity_name} - {self.action}"


class ActivityResource(models.Model):
    """Track resources allocated to project activities"""
    RESOURCE_TYPE_CHOICES = [
        ("company_tool", "Company Tool"),
        ("hired_tool", "Hired Tool"),
        ("money", "Money"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity = models.ForeignKey(ProjectActivity, on_delete=models.CASCADE, related_name="resources")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    inventory_item = models.ForeignKey("inventory.InventoryItem", on_delete=models.SET_NULL, null=True, blank=True)
    project_allocation = models.ForeignKey("ProjectResourceAllocation", on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_draws")
    quantity = models.PositiveIntegerField(null=True, blank=True)
    hired_tool_name = models.CharField(max_length=255, blank=True)
    hired_from = models.CharField(max_length=255, blank=True)
    hired_tool_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    money_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    money_purpose = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Activity Resource"
        verbose_name_plural = "Activity Resources"

    def clean(self):
        from django.core.exceptions import ValidationError
        
        if self.resource_type == "company_tool":
            if not self.inventory_item:
                raise ValidationError({"inventory_item": "Inventory item is required for company_tool type."})
            if not self.quantity:
                raise ValidationError({"quantity": "Quantity is required for company_tool type."})
            if not self.project_allocation:
                raise ValidationError({"project_allocation": "Project allocation is required for company_tool type."})
            # Validate inventory_item matches project_allocation.tool_name
            if self.project_allocation and self.inventory_item:
                if self.inventory_item.name != self.project_allocation.tool_name:
                    raise ValidationError({"inventory_item": "Inventory item must match the tool name in the project allocation."})
            # Validate quantity doesn't exceed remaining
            if self.project_allocation and self.quantity:
                remaining = self.project_allocation.remaining_quantity
                if remaining is not None and self.quantity > remaining:
                    raise ValidationError({"quantity": f"Cannot draw {self.quantity}. Only {remaining} remaining in allocation."})
            if self.hired_tool_name or self.hired_from or self.hired_tool_cost or self.money_amount or self.money_purpose:
                raise ValidationError("Only inventory_item, project_allocation, and quantity should be set for company_tool type.")
        
        elif self.resource_type == "hired_tool":
            if not self.hired_tool_name:
                raise ValidationError({"hired_tool_name": "Hired tool name is required for hired_tool type."})
            if not self.quantity:
                raise ValidationError({"quantity": "Quantity is required for hired_tool type."})
            if not self.hired_from:
                raise ValidationError({"hired_from": "Hired from is required for hired_tool type."})
            if not self.hired_tool_cost:
                raise ValidationError({"hired_tool_cost": "Hired tool cost is required for hired_tool type."})
            if self.inventory_item or self.project_allocation or self.money_amount or self.money_purpose:
                raise ValidationError("Only hired_tool_name, hired_from, quantity, and hired_tool_cost should be set for hired_tool type.")
        
        elif self.resource_type == "money":
            if not self.money_amount:
                raise ValidationError({"money_amount": "Money amount is required for money type."})
            if not self.project_allocation:
                raise ValidationError({"project_allocation": "Project allocation is required for money type."})
            # Validate amount doesn't exceed remaining
            if self.project_allocation and self.money_amount:
                remaining = self.project_allocation.remaining_amount
                if remaining is not None and self.money_amount > remaining:
                    raise ValidationError({"money_amount": f"Cannot draw {self.money_amount}. Only {remaining} remaining in allocation."})
            if self.inventory_item or self.quantity or self.hired_tool_name or self.hired_from or self.hired_tool_cost:
                raise ValidationError("Only project_allocation, money_amount, and money_purpose should be set for money type.")

    def __str__(self):
        if self.resource_type == "company_tool":
            return f"{self.inventory_item.name if self.inventory_item else 'Unknown'} x{self.quantity}"
        elif self.resource_type == "hired_tool":
            return f"{self.hired_tool_name} x{self.quantity} — hired from {self.hired_from}, UGX {self.hired_tool_cost}"
        elif self.resource_type == "money":
            return f"UGX {self.money_amount} - {self.money_purpose}"
        return f"Resource ({self.resource_type})"


class ActivityImage(models.Model):
    """Gallery images for project activities"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity = models.ForeignKey(ProjectActivity, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to='activity_images/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Activity Image"
        verbose_name_plural = "Activity Images"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.activity.activity_name} - {self.caption or 'Image'}"


class ProjectResourceAllocation(models.Model):
    """Resource allocations committed to a project at creation time (snapshot model)"""
    RESOURCE_TYPE_CHOICES = [
        ("company_tool", "Company Tool"),
        ("hired_tool", "Hired Tool"),
        ("money", "Money"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey("projects.Project", on_delete=models.CASCADE, related_name="resource_allocations")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    tool_name = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=255, null=True, blank=True)
    allocated_quantity = models.PositiveIntegerField(null=True, blank=True)
    money_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    money_purpose = models.CharField(max_length=255, blank=True)
    hired_from = models.CharField(max_length=255, null=True, blank=True)
    hired_tool_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    allocated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    allocated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Project Resource Allocation"
        verbose_name_plural = "Project Resource Allocations"
        ordering = ['resource_type', 'tool_name']

    @property
    def remaining_quantity(self):
        """Calculate remaining quantity for company tools"""
        if self.resource_type != 'company_tool' or self.allocated_quantity is None:
            return None
        # Sum all drawn quantities from activity resources linked to this allocation
        drawn = ActivityResource.objects.filter(
            project_allocation=self,
            resource_type='company_tool'
        ).aggregate(total_drawn=models.Sum('quantity'))['total_drawn'] or 0
        return self.allocated_quantity - drawn

    @property
    def remaining_amount(self):
        """Calculate remaining amount for money"""
        if self.resource_type != 'money' or self.money_amount is None:
            return None
        # Sum all drawn amounts from activity resources linked to this allocation
        drawn = ActivityResource.objects.filter(
            project_allocation=self,
            resource_type='money'
        ).aggregate(total_drawn=models.Sum('money_amount'))['total_drawn'] or 0
        return self.money_amount - drawn

    def __str__(self):
        if self.resource_type == 'company_tool':
            return f"{self.project.name} - {self.tool_name} (Allocated: {self.allocated_quantity})"
        elif self.resource_type == 'money':
            return f"{self.project.name} - {self.money_purpose or 'Money'} (Allocated: {self.money_amount})"
        return f"{self.project.name} - {self.resource_type}"

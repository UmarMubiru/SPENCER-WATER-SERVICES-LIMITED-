from django.db import models
import uuid
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Project(models.Model):
    SERVICE_CHOICES = [
        ("borehole_drilling", "Borehole Drilling"),
        ("solar_pump_installation", "Solar Pump Installation"),
        ("solar_power_taps", "Solar Power Taps"),
        ("water_pipe_laying", "Water Pipe Laying"),
        ("water_treatment", "Water Treatment"),
        ("plumbing", "Plumbing"),
        ("maintenance", "Maintenance"),
    ]

    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_reference = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    customer = models.ForeignKey("leads.Customer", on_delete=models.SET_NULL, null=True, blank=True, related_name="projects")
    quotation = models.ForeignKey("quotations.Quotation", on_delete=models.SET_NULL, null=True, blank=True)
    tender = models.ForeignKey("tenders.Tender", on_delete=models.SET_NULL, null=True, blank=True)
    service_line = models.CharField(max_length=50, choices=SERVICE_CHOICES)
    scope_description = models.TextField(blank=True)
    site_location = models.CharField(max_length=255, blank=True)
    contract_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    project_lead = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, blank=True, related_name="leading_projects")
    team_members = models.ManyToManyField("users.UserProfile", related_name="projects", blank=True)
    planned_start_date = models.DateField(null=True, blank=True)
    planned_end_date = models.DateField(null=True, blank=True)
    actual_start_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
    completion_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_portfolio_candidate = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


# import additional project-related models defined in models_extras.py so Django finds them
from . import models_extras  # noqa: F401

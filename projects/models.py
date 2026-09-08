from django.db import models
import uuid
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


def project_cover_upload_to(instance, filename):
    """Upload project cover images to a folder named after the project"""
    project_name = instance.name.replace(' ', '_').lower()
    return f'project_images/{project_name}/cover_{filename}'


class ProjectRole(models.Model):
    """Roles that can be assigned to employees on projects"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


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
        ("pending_approval", "Pending Approval"),
        ("not_started", "Not Started"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_reference = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    # customer = models.ForeignKey("leads.Customer", on_delete=models.SET_NULL, null=True, blank=True, related_name="projects")
    quotation = models.ForeignKey("quotations.Quotation", on_delete=models.SET_NULL, null=True, blank=True, related_name="projects")
    # tender = models.ForeignKey("tenders.Tender", on_delete=models.SET_NULL, null=True, blank=True)
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
    is_published = models.BooleanField(default=False, help_text="Whether this project is published to the public website")
    cover_image = models.ImageField(upload_to=project_cover_upload_to, null=True, blank=True, help_text="Cover image for public portfolio")
    cover_image_url = models.URLField(blank=True, help_text="External URL for cover image as alternative")
    public_description = models.TextField(blank=True, help_text="Description shown on public website")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Structured content for project detail pages
    challenge = models.TextField(blank=True, help_text="The problem or situation that prompted the project")
    approach = models.TextField(blank=True, help_text="What SWS actually did - scope of work, phases, methods")

    # Result metrics (structured fields)
    result_coverage = models.CharField(max_length=255, blank=True, help_text="Coverage/scale (e.g., hectares, households served)")
    result_units_installed = models.CharField(max_length=255, blank=True, help_text="Units installed (pumps, boreholes, tanks, etc.)")
    result_infrastructure = models.CharField(max_length=255, blank=True, help_text="Infrastructure laid (pipeline length, etc.)")
    result_other = models.CharField(max_length=255, blank=True, help_text="Other project-specific measurable outcome")
    result_delivery_timing = models.CharField(max_length=255, blank=True, help_text="Delivery timing note (on schedule / duration)")

    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, blank=True, related_name="archived_projects")

    # Approval workflow fields
    approved_by = models.ForeignKey("users.UserProfile", on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_projects")
    approved_at = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True, help_text="Notes about project approval")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name

    @property
    def computed_progress(self):
        """Calculate progress as average of all activity progress"""
        activities = self.activities.all()
        if not activities.exists():
            return self.completion_percentage
        total_progress = sum(activity.progress for activity in activities)
        return total_progress // activities.count()

    def save(self, *args, **kwargs):
        # Track if planned_end_date is being changed
        if self.pk:
            try:
                old_instance = Project.objects.get(pk=self.pk)
                if old_instance.planned_end_date != self.planned_end_date:
                    # Create field history for the change
                    from projects.models_extras import ProjectFieldHistory
                    ProjectFieldHistory.objects.create(
                        project=self,
                        field_name='planned_end_date',
                        old_value=str(old_instance.planned_end_date) if old_instance.planned_end_date else None,
                        new_value=str(self.planned_end_date) if self.planned_end_date else None,
                        changed_by=getattr(self, '_changed_by', None),
                    )

                    # Log to project history
                    from projects.models_extras import ProjectHistory
                    ProjectHistory.objects.create(
                        project=self,
                        event_type='project_extended',
                        description=f'Project end date extended from {old_instance.planned_end_date} to {self.planned_end_date}',
                        actor=getattr(self, '_changed_by', None),
                    )

                    # Update expected return dates for outstanding tools
                    self._update_tool_return_dates(old_instance.planned_end_date, self.planned_end_date)
            except Project.DoesNotExist:
                pass  # New project, no history needed

        super().save(*args, **kwargs)

    def _update_tool_return_dates(self, old_end_date, new_end_date):
        """Update expected return dates for outstanding tools when project is extended"""
        from inventory.models import MaterialRequestItem

        if not old_end_date or not new_end_date:
            return

        # Find all material request items for company tools issued to this project
        # that have expected return dates matching the old end date
        items_to_update = MaterialRequestItem.objects.filter(
            request__project_id=self.id,
            inventory_item__inventory_type='COMPANY_TOOL',
            expected_return_date=old_end_date,
            actual_return_date__isnull=True,  # Only update tools not yet returned
        )

        updated_count = items_to_update.update(expected_return_date=new_end_date)

        if updated_count > 0:
            # Log the update
            from projects.models_extras import ProjectHistory
            ProjectHistory.objects.create(
                project=self,
                event_type='project_extended',
                description=f'Updated expected return dates for {updated_count} outstanding tools',
                actor=getattr(self, '_changed_by', None),
            )

    def get_outstanding_tools_summary(self):
        """Get summary of outstanding tools for project completion check"""
        from inventory.models import MaterialRequestItem, ToolAccountability
        from django.utils import timezone

        # Outstanding tools - issued but not returned
        outstanding_tools = MaterialRequestItem.objects.filter(
            request__project_id=self.id,
            inventory_item__inventory_type='COMPANY_TOOL',
            quantity_issued__gt=0,
            actual_return_date__isnull=True,
        )

        # Overdue tools
        overdue_tools = outstanding_tools.filter(
            expected_return_date__lt=timezone.now().date()
        )

        # Unresolved accountability records
        unresolved_accountability = ToolAccountability.objects.filter(
            project_id=self.id,
            status__in=['UNDER_REVIEW', 'RETURNED_DAMAGED', 'NOT_RETURNED', 'LOST']
        )

        return {
            'outstanding_count': outstanding_tools.count(),
            'overdue_count': overdue_tools.count(),
            'unresolved_accountability_count': unresolved_accountability.count(),
            'can_complete': (
                outstanding_tools.count() == 0 and
                unresolved_accountability.count() == 0
            ),
            'details': {
                'outstanding_tools': list(outstanding_tools.values(
                    'inventory_item__name', 'inventory_item__sku', 'quantity_issued',
                    'expected_return_date', 'responsible_person__full_name'
                )),
                'overdue_tools': list(overdue_tools.values(
                    'inventory_item__name', 'inventory_item__sku', 'quantity_issued',
                    'expected_return_date', 'responsible_person__full_name'
                )),
                'unresolved_accountability': list(unresolved_accountability.values(
                    'tool__name', 'tool__sku', 'status', 'estimated_value',
                    'responsible_person__full_name'
                )),
            }
        }


class ProjectRoleAllocation(models.Model):
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE, related_name='project_allocations')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='role_allocations')
    job_title = models.ForeignKey('employees.JobTitle', on_delete=models.SET_NULL, null=True, blank=True, related_name='project_allocations')
    project_role = models.ForeignKey('ProjectRole', on_delete=models.SET_NULL, null=True, blank=True, related_name='allocations', help_text="Project-specific role (e.g., Clerk of Works, Site Manager)")
    assigned_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(blank=True, null=True)
    assigned_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_project_allocations')

    class Meta:
        ordering = ['-assigned_date']
        unique_together = ['employee', 'project', 'is_active']

    def __str__(self):
        job_title_name = self.job_title.title if self.job_title else 'No Job Title'
        role_name = self.project_role.name if self.project_role else 'No Project Role'
        return f"{self.employee.full_name} - {job_title_name} - {role_name} - {self.project.name}"

    def save(self, *args, **kwargs):
        from employees.models import Employee
        # If this is a new active allocation, update employee status to assigned
        if self.is_active:
            self.employee.status = Employee.ASSIGNED
            self.employee.save(update_fields=['status'])
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from employees.models import Employee
        # When deleting an active allocation, check if employee has other active allocations
        if self.is_active:
            other_allocations = ProjectRoleAllocation.objects.filter(
                employee=self.employee,
                is_active=True
            ).exclude(id=self.id).count()

            if other_allocations == 0:
                self.employee.status = Employee.AVAILABLE
                self.employee.save(update_fields=['status'])
        super().delete(*args, **kwargs)


# Keep old ProjectAssignment for backward compatibility during migration
class ProjectAssignment(models.Model):
    employee = models.ForeignKey('employees.Employee', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-assigned_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.project.name}"


@receiver(post_save, sender=ProjectAssignment)
def sync_employee_status(sender, instance, created, **kwargs):
    from employees.models import Employee
    emp = instance.employee
    if instance.is_active:
        emp.status = Employee.ASSIGNED
    else:
        emp.status = Employee.AVAILABLE
    emp.save(update_fields=['status'])


class CasualWorker(models.Model):
    """Casual workers specific to a project"""
    PAYMENT_TYPE_CHOICES = [
        ("piece_rate", "Piece rate"),
        ("daily_rate", "Daily rate"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='casual_workers')
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    next_of_kin = models.CharField(max_length=200, blank=True)
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default="daily_rate",
    )
    piece_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    # Retained for existing records; new casual workers use payment_type and its rate.
    village = models.CharField(max_length=100, blank=True)
    id_type = models.CharField(max_length=50, blank=True)
    id_number = models.CharField(max_length=50, blank=True)
    id_document = models.FileField(upload_to='casual_worker_ids/', blank=True, null=True)
    lc1_letter = models.FileField(upload_to='casual_worker_lc1/', blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.project.name}"


class CasualWorkerAttendance(models.Model):
    """Attendance tracking for casual workers"""
    casual_worker = models.ForeignKey(CasualWorker, on_delete=models.CASCADE, related_name='attendance_records')
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)
    clocked_in_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='clocked_in_workers')
    clocked_out_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='clocked_out_workers')
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    pieces_completed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    daily_wage = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-clock_in']

    def save(self, *args, **kwargs):
        if self.clock_out:
            duration = self.clock_out - self.clock_in
            self.hours_worked = (
                Decimal(str(duration.total_seconds())) / Decimal("3600")
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if self.casual_worker.payment_type == "piece_rate":
                self.daily_wage = (self.pieces_completed * self.casual_worker.piece_rate).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
            else:
                self.daily_wage = self.casual_worker.daily_rate.quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.casual_worker.full_name} - {self.clock_in.strftime('%Y-%m-%d')}"


class CasualWorkTask(models.Model):
    """A flexible, measurable job agreed with one worker or a group."""
    ARRANGEMENT_CHOICES = [("individual", "Individual"), ("group", "Group")]
    PAYMENT_RULE_CHOICES = [
        ("completion", "Pay on approved completion"),
        ("progress", "Pay for approved progress"),
        ("daily", "Daily service"),
    ]
    STATUS_CHOICES = [("planned", "Planned"), ("in_progress", "In progress"), ("completed", "Completed"), ("approved", "Approved")]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="casual_work_tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    arrangement = models.CharField(max_length=20, choices=ARRANGEMENT_CHOICES, default="individual")
    payment_rule = models.CharField(max_length=20, choices=PAYMENT_RULE_CHOICES, default="progress")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    target_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1)
    unit = models.CharField(max_length=50, default="units")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planned")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def agreed_rate(self):
        return (self.total_amount / self.target_quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def approved_quantity(self):
        return min(sum((entry.quantity for entry in self.progress_entries.filter(is_approved=True)), Decimal("0")), self.target_quantity)

    @property
    def earned_amount(self):
        if self.payment_rule == "completion":
            return self.total_amount if self.status == "approved" else Decimal("0")
        return (self.approved_quantity * self.agreed_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class CasualWorkAssignment(models.Model):
    task = models.ForeignKey(CasualWorkTask, on_delete=models.CASCADE, related_name="assignments")
    casual_worker = models.ForeignKey(CasualWorker, on_delete=models.CASCADE, related_name="work_assignments")
    share_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        unique_together = ["task", "casual_worker"]

    @property
    def earned_amount(self):
        assignments = list(self.task.assignments.all())
        specified_total = sum((assignment.share_percentage or Decimal("0") for assignment in assignments), Decimal("0"))
        if self.share_percentage is not None:
            share = self.share_percentage / Decimal("100")
        else:
            unspecified = [assignment for assignment in assignments if assignment.share_percentage is None]
            share = (Decimal("1") - (specified_total / Decimal("100"))) / Decimal(len(unspecified) or 1)
        return (self.task.earned_amount * share).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class CasualWorkProgress(models.Model):
    task = models.ForeignKey(CasualWorkTask, on_delete=models.CASCADE, related_name="progress_entries")
    assignment = models.ForeignKey(CasualWorkAssignment, on_delete=models.SET_NULL, null=True, blank=True, related_name="progress_entries")
    work_date = models.DateField(default=timezone.localdate)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-work_date", "-created_at"]


# import additional project-related models defined in models_extras.py so Django finds them
from . import models_extras  # noqa: F401

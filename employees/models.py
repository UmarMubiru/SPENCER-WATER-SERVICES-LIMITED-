from django.db import models
from django.core.validators import EmailValidator, RegexValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
import secrets
import string
import uuid


class Skill(models.Model):
    """Skills that employees can possess"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)  # e.g., 'Technical', 'Soft Skills', 'Certification'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    department_head = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_department')
    default_role = models.ForeignKey('roles.Role', on_delete=models.SET_NULL, null=True, blank=True, related_name='departments')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Departments'

    def __str__(self):
        return self.name


class JobTitle(models.Model):
    title = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_titles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class EmploymentType(models.Model):
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
    ]

    name = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.get_name_display()


class Employee(models.Model):
    FULL_TIME = 'full_time'
    PART_TIME = 'part_time'
    TYPE_CHOICES = [(FULL_TIME, 'Full-time'), (PART_TIME, 'Part-time')]

    PAY_BASIS_CHOICES = [
        ('daily_fixed', 'Fixed rate per day worked'),
        ('hourly_daily', 'Hourly rate, calculated daily'),
        ('hourly_monthly', 'Hourly rate, totaled monthly'),
    ]

    ID_TYPE_CHOICES = [
        ('national_id', 'National ID'),
        ('driving_permit', 'Driving Permit'),
        ('passport', 'Passport'),
        ('refugee_card', 'Refugee Card'),
    ]

    MANAGEMENT_CATEGORY_CHOICES = [
        ('management', 'Management (Administrative)'),
        ('technical', 'Technical / Field'),
    ]

    AVAILABLE = 'available'
    ASSIGNED = 'assigned'
    SUSPENDED = 'suspended'
    ON_LEAVE = 'on_leave'
    CONTRACT_EXPIRED = 'contract_expired'
    DECEASED = 'deceased'
    STATUS_CHOICES = [
        (AVAILABLE, 'Available'),
        (ASSIGNED, 'Assigned'),
        (SUSPENDED, 'Suspended'),
        (ON_LEAVE, 'On Leave'),
        (CONTRACT_EXPIRED, 'Contract Expired'),
        (DECEASED, 'Deceased'),
    ]

    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, validators=[RegexValidator(r'^\+?[\d\s-]+$')])
    email = models.EmailField(validators=[EmailValidator()], blank=True, null=True)

    # Identity - replaces the old single national_id field
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES, blank=True, null=True)
    id_number = models.CharField(max_length=50, blank=True, null=True)
    id_document = models.FileField(
        upload_to='employee_docs/identity/',
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])],
        blank=True, null=True
    )

    # Employee photo
    photo = models.ImageField(
        upload_to='employee_photos/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])],
        blank=True, null=True
    )

    employee_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True)
    management_category = models.CharField(
        max_length=20,
        choices=MANAGEMENT_CATEGORY_CHOICES,
        blank=True, null=True
    )

    # Full-time only
    job_title = models.ForeignKey(JobTitle, null=True, blank=True, on_delete=models.SET_NULL)
    gross_monthly_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    # Part-time only
    pay_basis = models.CharField(max_length=20, choices=PAY_BASIS_CHOICES, null=True, blank=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    contract_start_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default=AVAILABLE)
    # 'not_active' covers: Suspended, On Leave, Sick Leave, Maternity, Contract Expired, Deceased —
    # tracked via EmployeeHistory / a status-reason field, set only here in Employment Management.

    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_employees')

    # Availability and workload tracking
    current_workload_percentage = models.PositiveIntegerField(default=0, help_text="Current workload percentage (0-100)")
    max_workload_percentage = models.PositiveIntegerField(default=100, help_text="Maximum workload percentage allowed")
    available_from = models.DateField(null=True, blank=True, help_text="Date when employee becomes available")
    available_until = models.DateField(null=True, blank=True, help_text="Date until employee remains available")
    preferred_work_days = models.CharField(max_length=50, blank=True, help_text="Preferred work days (e.g., Mon-Fri)")
    preferred_hours_start = models.TimeField(null=True, blank=True, help_text="Preferred start time")
    preferred_hours_end = models.TimeField(null=True, blank=True, help_text="Preferred end time")
    notes = models.TextField(blank=True, help_text="Additional availability notes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f"{self.full_name} ({self.get_employee_type_display()})"

    def clean(self):
        if self.employee_type == self.FULL_TIME:
            if not self.job_title or not self.gross_monthly_salary:
                raise ValidationError("Full-time employees require a job title and gross monthly salary.")
        else:  # part_time
            if not self.pay_basis:
                raise ValidationError("Part-time employees require a pay basis.")
            if self.pay_basis == 'daily_fixed' and not self.daily_rate:
                raise ValidationError("Daily-fixed pay basis requires a daily rate.")
            if self.pay_basis in ('hourly_daily', 'hourly_monthly') and not self.hourly_rate:
                raise ValidationError("Hourly pay basis requires an hourly rate.")

    def save(self, *args, **kwargs):
        self.clean()
        if self.employee_type == self.FULL_TIME and not self.status:
            self.status = self.ACTIVE_NOT_ASSIGNED
        elif self.employee_type == self.PART_TIME and self.pk is None:
            self.status = self.AVAILABLE
        super().save(*args, **kwargs)

    def update_workload_from_assignments(self):
        """Update current workload based on active project assignments"""
        from django.utils import timezone

        # Calculate total workload from active assignments
        active_assignments = self.project_assignments.filter(
            status__in=['assigned', 'active']
        ).aggregate(
            total_workload=models.Sum('workload_percentage')
        )

        self.current_workload_percentage = active_assignments['total_workload'] or 0
        self.save(update_fields=['current_workload_percentage'])


class EmployeeSkill(models.Model):
    """Links employees to skills with proficiency levels"""
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='employees')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='intermediate')
    years_experience = models.PositiveIntegerField(default=0)
    certified = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'skill')
        ordering = ['skill__name']

    def __str__(self):
        return f"{self.employee.full_name} - {self.skill.name} ({self.get_proficiency_display()})"


class ProjectAssignment(models.Model):
    """Links employees to projects with workload tracking"""
    ROLE_CHOICES = [
        ('project_manager', 'Project Manager'),
        ('site_supervisor', 'Site Supervisor'),
        ('engineer', 'Engineer'),
        ('technician', 'Technician'),
        ('laborer', 'Laborer'),
        ('driver', 'Driver'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('assigned', 'Assigned'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('withdrawn', 'Withdrawn'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='project_assignments')
    project_reference = models.CharField(max_length=150, help_text="Reference to the project (e.g., PRJ-2026-000001)")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    workload_percentage = models.PositiveIntegerField(default=0, help_text="Workload percentage for this assignment (0-100)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    assigned_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee']),
            models.Index(fields=['project_reference']),
            models.Index(fields=['status']),
            models.Index(fields=['assigned_at']),
        ]

    def __str__(self):
        return f"{self.employee.full_name} - {self.project_reference} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update employee's current workload
        self.update_employee_workload()

    def delete(self, *args, **kwargs):
        employee = self.employee
        super().delete(*args, **kwargs)
        # Update employee's current workload after deletion
        employee.update_workload_from_assignments()

    def update_employee_workload(self):
        """Update the employee's current workload based on active assignments"""
        self.employee.update_workload_from_assignments()


class ContractDocument(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contract_documents')
    title = models.CharField(max_length=150)
    doc_type = models.CharField(max_length=50)  # offer letter, casual agreement, NDA...
    file = models.FileField(upload_to='contracts/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name_plural = 'Contract Documents'

    def __str__(self):
        return f"{self.title} - {self.employee.full_name}"


class EmployeeDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('identity', 'Identity Document'),
        ('contact', 'Contact'),
        ('cv', 'Experience / CV'),
        ('reference', 'Reference'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='employee_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        unique_together = ('employee', 'document_type')

    def __str__(self):
        return f"{self.employee.full_name if self.employee else 'Unknown'} - {self.get_document_type_display()}"


class EmployeeHistory(models.Model):
    ACTION_CHOICES = [
        ('registered', 'Employee Registered'),
        ('contract_renewed', 'Contract Renewed'),
        ('position_changed', 'Position Changed'),
        ('department_changed', 'Department Changed'),
        ('status_changed', 'Status Changed'),
        ('salary_changed', 'Salary Changed'),
        ('assignment_added', 'Assignment Added'),
        ('assignment_ended', 'Assignment Ended'),
        ('document_uploaded', 'Document Uploaded'),
        ('field_updated', 'Field Updated'),
        ('other', 'Other'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='history', null=True, blank=True)
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField()
    previous_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    performed_by = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.employee.full_name if self.employee else 'Unknown'} - {self.action} ({self.timestamp})"


class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-clock_in']
        verbose_name_plural = 'Attendance Records'
        unique_together = ['employee', 'clock_in']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.clock_in} to {self.clock_out or 'Active'})"

    def save(self, *args, **kwargs):
        # Calculate hours worked if clock_out is provided
        if self.clock_out and self.clock_in:
            duration = self.clock_out - self.clock_in
            self.hours_worked = duration.total_seconds() / 3600  # Convert to hours
        super().save(*args, **kwargs)


class Credential(models.Model):
    """Stores generated credentials for employee accounts"""
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('disabled', 'Disabled'),
    ]

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='credential')
    username = models.CharField(max_length=50, unique=True)
    temporary_password = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey('users.UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_credentials')
    approved_at = models.DateTimeField(null=True, blank=True)
    password_changed = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} - {self.employee.full_name}"

    def generate_username(self):
        """Generate username from employee name"""
        base_name = self.employee.full_name.lower().replace(' ', '.')
        username = base_name
        counter = 1
        while Credential.objects.filter(username=username).exists():
            username = f"{base_name}.{counter}"
            counter += 1
        self.username = username

    def generate_temporary_password(self):
        """Generate a secure temporary password"""
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for i in range(12))
        self.temporary_password = password

    def save(self, *args, **kwargs):
        if not self.username:
            self.generate_username()
        if not self.temporary_password:
            self.generate_temporary_password()
        super().save(*args, **kwargs)

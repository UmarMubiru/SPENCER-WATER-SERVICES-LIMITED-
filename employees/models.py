from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from django.utils import timezone


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

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
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('suspended', 'Suspended'),
        ('exited', 'Exited'),
    ]

    employee_id = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=20, validators=[RegexValidator(r'^\+?[\d\s-]+$')])
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True, validators=[RegexValidator(r'^\+?[\d\s-]+$')])
    
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='employees')
    job_title = models.ForeignKey(JobTitle, on_delete=models.PROTECT, related_name='employees')
    employment_type = models.ForeignKey(EmploymentType, on_delete=models.PROTECT, related_name='employees')
    
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    joining_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    profile_picture = models.ImageField(upload_to='employees/profiles/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['employee_id']
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def active_contract(self):
        return self.contracts.filter(status='active').first()


class Contract(models.Model):
    CONTRACT_TYPE_CHOICES = [
        ('permanent', 'Permanent'),
        ('fixed_term', 'Fixed Term'),
        ('probation', 'Probation'),
        ('contractor', 'Contractor'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
        ('renewed', 'Renewed'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='UGX')
    
    document = models.FileField(upload_to='employees/contracts/', blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.contract_type} ({self.start_date} to {self.end_date})"

    @property
    def is_expiring_soon(self):
        if self.status != 'active':
            return False
        days_until_expiry = (self.end_date - timezone.now().date()).days
        return 0 <= days_until_expiry <= 30


class EmployeeDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('contract', 'Employment Contract'),
        ('certificate', 'Certificate'),
        ('identification', 'Identification'),
        ('other', 'Other'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='employees/documents/')
    description = models.TextField(blank=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"


class EmployeeAssignment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assignments')
    project_name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.project_name} ({self.role})"


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
        ('other', 'Other'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField()
    previous_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    performed_by = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.employee.full_name} - {self.action} ({self.timestamp})"

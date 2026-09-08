from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.ForeignKey(
        'roles.Role',
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        'employees.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profiles'
    )
    job_title = models.CharField(max_length=100, blank=True, null=True, help_text="User's job title for permission overrides")
    phone = models.CharField(max_length=20, blank=True, null=True)
    account_status = models.CharField(max_length=20, default='active')
    is_administrator = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=False)
    custom_permissions = models.JSONField(default=dict, blank=True)
    email_notifications = models.BooleanField(default=False)
    employee_changes = models.BooleanField(default=False)
    inventory_alerts = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    project_updates = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=False)
    theme = models.CharField(max_length=20, default='light')
    permissions = models.ManyToManyField('roles.Permission', blank=True, related_name='assigned_users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} ({self.role.name if self.role else 'No Role'})"


class ModulePermission(models.Model):
    MODULE_CHOICES = [
        ('dashboard', 'Dashboard'),
        ('leads', 'Leads'),
        ('crm', 'CRM'),
        ('quotations', 'Quotations'),
        ('projects', 'Projects'),
        ('tenders', 'Tenders'),
        ('inventory', 'Inventory'),
        ('employees', 'Employees'),
        ('users', 'Users'),
        ('reports', 'Reports'),
        ('content', 'Content Management'),
        ('settings', 'Settings'),
    ]

    PERMISSION_CHOICES = [
        ('view', 'View Only'),
        ('edit', 'View & Edit'),
        ('full', 'Full Access'),
        ('none', 'No Access'),
    ]

    role = models.CharField(max_length=100)
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES, default='none')
    job_title = models.CharField(max_length=100, blank=True, null=True, help_text="Optional job title override for specific roles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'module_permissions'
        verbose_name = 'Module Permission'
        verbose_name_plural = 'Module Permissions'
        unique_together = ['role', 'module', 'job_title']

    def __str__(self):
        if self.job_title:
            return f"{self.role} ({self.job_title}) - {self.module} ({self.permission})"
        return f"{self.role} - {self.module} ({self.permission})"


class Invitation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        EXPIRED = 'EXPIRED', 'Expired'
        REVOKED = 'REVOKED', 'Revoked'

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.ForeignKey('roles.Role', on_delete=models.PROTECT, related_name='invitations')
    permissions = models.ManyToManyField('roles.Permission', blank=True, related_name='invitations')
    token = models.CharField(max_length=128, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    invited_by = models.ForeignKey(UserProfile, null=True, on_delete=models.SET_NULL, related_name='invitations_sent')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f'{self.email} ({self.status})'

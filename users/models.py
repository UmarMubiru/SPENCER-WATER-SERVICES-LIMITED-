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
    phone = models.CharField(max_length=20, blank=True, null=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'module_permissions'
        verbose_name = 'Module Permission'
        verbose_name_plural = 'Module Permissions'
        unique_together = ['role', 'module']

    def __str__(self):
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

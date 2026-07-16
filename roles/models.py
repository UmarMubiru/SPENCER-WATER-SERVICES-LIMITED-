from django.db import models

class Permission(models.Model):
    """Fixed, seeded via migration — represents one real capability."""
    code = models.CharField(max_length=100, unique=True)  # "tender:create"
    module = models.CharField(max_length=50)               # "Tender Management"
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.code


class Role(models.Model):
    """Admin-managed. Fully dynamic."""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, related_name='roles')
    default_landing_path = models.CharField(
        max_length=100, default='/dashboard'
    )  # where this role lands after login
    is_system_default = models.BooleanField(default=False)  # Admin/Technician
    created_by = models.ForeignKey(
        'users.UserProfile', null=True, on_delete=models.SET_NULL, related_name='roles_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

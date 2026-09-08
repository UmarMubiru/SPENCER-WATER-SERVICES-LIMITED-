from users.models import ModulePermission


def get_visible_modules(user):
    """Reuses the SAME permission source as the sidebar — never a second, parallel list."""
    if not user.is_authenticated:
        return None  # Allow anonymous users to see everything for development
    if hasattr(user, 'is_administrator') and user.is_administrator:
        return None  # None = no filter, sees everything including 'security'
    if not hasattr(user, 'employee') or not user.employee or not hasattr(user.employee, 'job_title') or not user.employee.job_title:
        return []
    return list(
        ModulePermission.objects.filter(role__name=user.role.name if user.role else None)
        .exclude(permission='none')
        .values_list('module', flat=True)
    )

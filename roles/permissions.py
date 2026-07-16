from rest_framework.permissions import BasePermission

class HasPermission(BasePermission):
    """
    Usage: permission_classes = [HasPermission('tender:create')]
    Checks if the authenticated user has the specific permission in their role.
    """
    def __init__(self, code):
        self.code = code

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get permissions from JWT token
        if hasattr(request, 'auth') and request.auth:
            token_permissions = request.auth.get('permissions', [])
            return self.code in token_permissions
        
        # Fallback: check user profile role permissions
        if hasattr(request.user, 'profile') and request.user.profile.role:
            user_permissions = request.user.profile.role.permissions.filter(code=self.code).exists()
            return user_permissions
        
        return False

    def __call__(self):
        return self


class IsRoleAdministrator(BasePermission):
    """Allows staff users and users assigned to the Administrator role."""
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and (
                user.is_staff or (
                    hasattr(user, 'profile') and user.profile.role and
                    user.profile.role.name == 'Administrator'
                )
            )
        )

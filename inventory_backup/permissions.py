from rest_framework.permissions import BasePermission


class IsInventoryManager(BasePermission):
    """Only inventory managers can perform certain actions."""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsInventoryUser(BasePermission):
    """Only inventory users can access inventory endpoints."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

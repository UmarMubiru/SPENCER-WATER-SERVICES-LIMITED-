from rest_framework.permissions import BasePermission # type: ignore


class IsInventoryManager(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.groups.filter(
                    name="Inventory Managers"
                ).exists()
            )
        )


class IsInventoryUser(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from roles.views import PermissionViewSet, RoleViewSet

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet)
router.register(r'roles', RoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

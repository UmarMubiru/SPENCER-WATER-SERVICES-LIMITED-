from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProfileViewSet, ModulePermissionViewSet, login_view, register_view, invitations_view, revoke_invitation, accept_invitation
from .auth_serializers import RoleTokenObtainPairView

router = DefaultRouter()
router.register(r'', UserProfileViewSet, basename='userprofile')
router.register(r'permissions', ModulePermissionViewSet, basename='modulepermission')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/token/', RoleTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', register_view, name='register'),
    path('invitations/', invitations_view, name='invitations'),
    path('invitations/<int:invitation_id>/revoke/', revoke_invitation, name='revoke-invitation'),
    path('invitations/accept/', accept_invitation, name='accept-invitation'),
]

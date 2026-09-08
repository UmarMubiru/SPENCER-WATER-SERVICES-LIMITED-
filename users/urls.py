from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, ModulePermissionViewSet, login_view, register_view,
    invitations_view, revoke_invitation, accept_invitation,
    my_profile, change_my_password,
    user_management_stats, all_users_list, user_detail,
    pending_approvals, approve_account, reject_account,
    roles_management, role_detail,
    departments_management, department_detail,
    administrators_list, set_administrator, remove_administrator
)
from .auth_serializers import RoleTokenObtainPairView

router = DefaultRouter()
router.register(r'', UserProfileViewSet, basename='userprofile')
router.register(r'permissions', ModulePermissionViewSet, basename='modulepermission')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='login'),
    path('auth/token/', RoleTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', register_view, name='register'),
    path('me/', my_profile, name='my-profile'),
    path('me/change-password/', change_my_password, name='change-my-password'),
    path('invitations/', invitations_view, name='invitations'),
    path('invitations/<int:invitation_id>/revoke/', revoke_invitation, name='revoke-invitation'),
    path('invitations/accept/', accept_invitation, name='accept-invitation'),

    # User Management endpoints
    path('management/stats/', user_management_stats, name='user-management-stats'),
    path('management/all/', all_users_list, name='all-users-list'),
    path('management/<int:user_id>/', user_detail, name='user-detail'),
    path('management/pending/', pending_approvals, name='pending-approvals'),
    path('management/pending/<int:invitation_id>/approve/', approve_account, name='approve-account'),
    path('management/pending/<int:invitation_id>/reject/', reject_account, name='reject-account'),
    path('management/roles/', roles_management, name='roles-management'),
    path('management/roles/<int:role_id>/', role_detail, name='role-detail'),
    path('management/departments/', departments_management, name='departments-management'),
    path('management/departments/<int:department_id>/', department_detail, name='department-detail'),
    path('management/administrators/', administrators_list, name='administrators-list'),
    path('management/administrators/set/', set_administrator, name='set-administrator'),
    path('management/administrators/<int:user_id>/remove/', remove_administrator, name='remove-administrator'),
]

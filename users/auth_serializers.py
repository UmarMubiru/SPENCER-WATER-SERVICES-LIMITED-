from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from employees.models import Credential, Employee
from users.models import ModulePermission
import re


ALL_DEPARTMENT_MODULES = {
    'dashboard', 'projects', 'employees', 'users', 'settings', 'reports',
    'tenders', 'leads', 'crm', 'quotations', 'inventory', 'content',
}


def get_user_context(user):
    """Return the account context used by both the access token and login response.

    Employee credentials are the source of a staff member's department.  If the
    department has module permissions configured, those permissions are the
    effective navigation access; otherwise the account's role permissions are
    used for backwards compatibility with invitation-created accounts.
    """
    profile = getattr(user, 'profile', None)
    role = profile.role if profile and profile.role else None
    role_permissions = set()
    if profile:
        role_permissions.update(profile.permissions.values_list('code', flat=True))
    if role:
        role_permissions.update(role.permissions.values_list('code', flat=True))

    credential = Credential.objects.select_related('employee__department', 'employee__job_title').filter(
        username=user.username
    ).first()
    employee = credential.employee if credential else Employee.objects.select_related(
        'department', 'job_title'
    ).filter(email__iexact=user.email).first() if user.email else None
    department = employee.department if employee else None
    job_title = employee.job_title.title if employee and employee.job_title else None
    full_name = employee.full_name if employee and employee.full_name else (user.get_full_name() or user.username)

    department_modules = {}
    if department:
        # Start with the department policy, then apply a matching job-title
        # override.  Never expose another job title's override (for example,
        # Inventory Manager access) to the whole department.
        department_modules = {
            item.module: item.permission
            for item in ModulePermission.objects.filter(
                role=department.name, job_title__isnull=True
            )
            if item.permission != 'none'
        }
        if job_title:
            department_modules.update({
                item.module: item.permission
                for item in ModulePermission.objects.filter(
                    role=department.name, job_title__iexact=job_title
                )
                if item.permission != 'none'
            })

    # Administrators retain full access even where they are attached to a department.
    if role and role.name == 'Administrator':
        department_modules = {module: 'full' for module in ALL_DEPARTMENT_MODULES}

    return {
        'role': role.name if role else None,
        'role_id': role.id if role else None,
        'permissions': sorted(role_permissions),
        'landing': role.default_landing_path if role else '/admin/dashboard',
        'department': department.name if department else None,
        'department_id': department.id if department else None,
        'job_title': job_title,
        'full_name': full_name,
        # An empty object means no department policy exists, so clients should
        # use the legacy role permissions. A populated object is authoritative.
        'module_permissions': department_modules,
    }

class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        context = get_user_context(user)
        token['role'] = context['role']
        token['role_id'] = context['role_id']
        token['permissions'] = context['permissions']
        token['landing'] = context['landing']
        token['department'] = context['department']
        token['department_id'] = context['department_id']
        token['job_title'] = context['job_title']
        token['module_permissions'] = context['module_permissions']

        return token

    def run_validation(self, data):
        if hasattr(data, 'get'):
            # Handle both username and email, trimming whitespace and matching case-insensitively.
            username_or_email = (data.get('username') or data.get('email') or '').strip()

            if username_or_email:
                # Check if it's an email address
                email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
                if re.match(email_pattern, username_or_email):
                    # It's an email, find the user and get their username
                    try:
                        user = User.objects.get(email__iexact=username_or_email)
                        data = data.copy()
                        data['username'] = user.username
                    except User.DoesNotExist:
                        pass
                else:
                    # It's a username, use the canonical stored value if the casing differs.
                    user = User.objects.filter(username__iexact=username_or_email).first()
                    data = data.copy()
                    data['username'] = user.username if user else username_or_email

        return super().run_validation(data)

    def validate(self, attrs):
        data = super().validate(attrs)

        context = get_user_context(self.user)

        # Add user profile data to response (always add, regardless of profile existence)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': context['full_name'],
            **context,
        }

        return data

class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer

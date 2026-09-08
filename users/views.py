from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.utils import timezone
from datetime import timedelta
import secrets
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile, ModulePermission, Invitation
from .serializers import UserProfileSerializer, UserCreateSerializer, ModulePermissionSerializer, RoleSerializer
from roles.models import Role, Permission
from employees.models import Department, JobTitle, Employee
from .auth_serializers import get_user_context


class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and (
                request.user.is_staff or (
                    hasattr(request.user, 'profile') and
                    request.user.profile.role and
                    request.user.profile.role.name == 'Administrator'
                )
            )
        )


def _invitation_signer():
    return TimestampSigner(salt='sws-user-invitation')


def _setup_token(invitation):
    return _invitation_signer().sign(f'{invitation.id}:{invitation.token}')

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsAdministrator()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserProfileSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_users = self.queryset.count()
        active_users = self.queryset.filter(user__is_active=True).count()
        administrators = self.queryset.filter(role__name='Administrator').count()
        inactive_users = self.queryset.filter(user__is_active=False).count()
        new_this_month = self.queryset.filter(
            created_at__year=request.GET.get('year', 2024),
            created_at__month=request.GET.get('month', 1)
        ).count()

        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'administrators': administrators,
            'inactive_users': inactive_users,
            'new_this_month': new_this_month,
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        db_roles = self.queryset.values('role__name').annotate(count=Count('id'))
        roles_data = [{'role': r['role__name'] or 'No Role', 'count': r['count']} for r in db_roles]
        serializer = RoleSerializer(roles_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def administrators(self, request):
        admins = self.queryset.filter(role__name='Administrator')
        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def technicians(self, request):
        techs = self.queryset.filter(role__name='Technician')
        serializer = self.get_serializer(techs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def hr_users(self, request):
        hr = self.queryset.filter(role__name='Human Resource')
        serializer = self.get_serializer(hr, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_role(self, request):
        role = request.query_params.get('role')
        if role:
            if role.isdigit():
                users = self.queryset.filter(role_id=int(role))
            else:
                users = self.queryset.filter(role__name=role)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        return Response({'error': 'Role parameter required'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        profile = serializer.save()

        from reports.audit import log_activity
        log_activity(
            module='users',
            action='User Account Created',
            entity_type='UserProfile',
            entity_id=profile.id,
            reference_number=profile.user.username,
            action_type='created',
            description=f'User account created: {profile.user.username}',
            performed_by=self.request.user if self.request.user.is_authenticated else None,
            new_data={'username': profile.user.username, 'email': profile.user.email, 'role': profile.role.name if profile.role else ''},
            request=self.request,
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_data = {
            'role': old_instance.role.name if old_instance.role else '',
            'department': old_instance.department.name if old_instance.department else '',
        }
        super().perform_update(serializer)
        new_instance = self.get_object()
        new_data = {
            'role': new_instance.role.name if new_instance.role else '',
            'department': new_instance.department.name if new_instance.department else '',
        }

        if old_data['role'] != new_data['role']:
            from reports.audit import log_activity
            log_activity(
                module='users',
                action='User Role Changed',
                entity_type='UserProfile',
                entity_id=new_instance.id,
                reference_number=new_instance.user.username,
                action_type='updated',
                description=f'User role changed: {new_instance.user.username} from {old_data["role"]} to {new_data["role"]}',
                performed_by=self.request.user if self.request.user.is_authenticated else None,
                old_data={'role': old_data['role']},
                new_data={'role': new_data['role']},
                request=self.request,
            )


@api_view(['GET', 'POST'])
@permission_classes([IsAdministrator])
def invitations_view(request):
    if request.method == 'GET':
        invitations = Invitation.objects.select_related('role', 'invited_by__user').order_by('-created_at')
        return Response([
            {
                'id': invitation.id,
                'email': invitation.email,
                'full_name': invitation.full_name,
                'phone_number': invitation.phone_number,
                'role': invitation.role.name,
                'status': invitation.status,
                'expires_at': invitation.expires_at,
                'created_at': invitation.created_at,
            } for invitation in invitations
        ])

    email = request.data.get('email', '').strip().lower()
    full_name = request.data.get('full_name', '').strip()
    phone_number = request.data.get('phone_number', '').strip()
    role_id = request.data.get('role_id')
    permission_ids = request.data.get('permission_ids', [])
    if not email or not full_name or not role_id:
        return Response({'error': 'Full name, email address, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'A user already exists with this email address.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        role = Role.objects.get(pk=role_id)
    except Role.DoesNotExist:
        return Response({'error': 'Selected role does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

    Invitation.objects.filter(email__iexact=email, status=Invitation.Status.PENDING).update(status=Invitation.Status.REVOKED)
    selected_permissions = Permission.objects.filter(id__in=permission_ids)
    if role.name == 'Administrator':
        selected_permissions = Permission.objects.all()
    invitation = Invitation.objects.create(
        email=email,
        full_name=full_name,
        phone_number=phone_number,
        role=role,
        token=secrets.token_urlsafe(48),
        invited_by=getattr(request.user, 'profile', None),
        expires_at=timezone.now() + timedelta(hours=72),
    )
    invitation.permissions.set(selected_permissions)
    setup_url = f'{settings.FRONTEND_URL}/auth/setup-account?token={_setup_token(invitation)}'
    send_mail(
        'Set up your Spencer Water Services account',
        f'Hello {full_name},\n\nYou have been invited as {role.name}. Set up your account within 72 hours:\n{setup_url}',
        settings.DEFAULT_FROM_EMAIL,
        [email],
    )
    payload = {'id': invitation.id, 'message': 'Invitation sent successfully.'}
    if settings.DEBUG and settings.EMAIL_BACKEND.endswith('console.EmailBackend'):
        payload['setup_url'] = setup_url
    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAdministrator])
def revoke_invitation(request, invitation_id):
    updated = Invitation.objects.filter(pk=invitation_id, status=Invitation.Status.PENDING).update(status=Invitation.Status.REVOKED)
    if not updated:
        return Response({'error': 'Pending invitation not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Invitation revoked.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def accept_invitation(request):
    signed_token = request.data.get('token', '')
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')
    if not signed_token or not username or not password:
        return Response({'error': 'Token, username, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        invitation_id, raw_token = _invitation_signer().unsign(signed_token, max_age=72 * 60 * 60).split(':', 1)
        invitation = Invitation.objects.select_related('role').get(pk=invitation_id)
    except (BadSignature, SignatureExpired, Invitation.DoesNotExist):
        return Response({'error': 'This invitation link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)
    if invitation.status != Invitation.Status.PENDING or invitation.is_expired or not secrets.compare_digest(invitation.token, raw_token):
        return Response({'error': 'This invitation is no longer available.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'That username is already in use.'}, status=status.HTTP_400_BAD_REQUEST)
    first_name, _, last_name = invitation.full_name.partition(' ')
    with transaction.atomic():
        user = User.objects.create_user(username=username, email=invitation.email, first_name=first_name, last_name=last_name, password=password)
        profile = UserProfile.objects.create(user=user, phone=invitation.phone_number, role=invitation.role)
        profile.permissions.set(invitation.permissions.all())
        invitation.status = Invitation.Status.ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=['status', 'accepted_at'])
    return Response({'message': 'Account setup complete. You can now sign in.'}, status=status.HTTP_201_CREATED)


class ModulePermissionViewSet(viewsets.ModelViewSet):
    queryset = ModulePermission.objects.all()
    serializer_class = ModulePermissionSerializer

    @action(detail=False, methods=['get'])
    def by_role(self, request):
        role = request.query_params.get('role')
        if role:
            permissions = self.queryset.filter(role=role)
            serializer = self.get_serializer(permissions, many=True)
            return Response(serializer.data)
        return Response({'error': 'Role parameter required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def set_permissions(self, request):
        role = request.data.get('role')
        permissions = request.data.get('permissions', [])

        if not role:
            return Response({'error': 'Role required'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete existing permissions for this role
        ModulePermission.objects.filter(role=role).delete()

        # Create new permissions
        for perm_data in permissions:
            ModulePermission.objects.create(
                role=role,
                module=perm_data['module'],
                permission=perm_data['permission']
            )

        return Response({'message': 'Permissions updated successfully'})

    @action(detail=False, methods=['get'])
    def user_permissions(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            try:
                profile = UserProfile.objects.get(user_id=user_id)
                permissions = ModulePermission.objects.filter(role=profile.role)
                serializer = self.get_serializer(permissions, many=True)
                return Response(serializer.data)
            except UserProfile.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)


def _get_module_permissions(profile):
    """Get module permissions considering job title overrides"""
    if not profile.department:
        return {}
    
    # Get job title-specific permissions first
    job_title_perms = {}
    if profile.job_title:
        job_title_perms = {
            perm.module: perm.permission 
            for perm in ModulePermission.objects.filter(
                role=profile.department.name, 
                job_title=profile.job_title
            )
        }
    
    # Get department-level permissions
    dept_perms = {
        perm.module: perm.permission 
        for perm in ModulePermission.objects.filter(
            role=profile.department.name, 
            job_title__isnull=True
        )
    }
    
    # Job title overrides take precedence
    return {**dept_perms, **job_title_perms}


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = (request.data.get('email') or request.data.get('username') or '').strip()
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        try:
            user = User.objects.get(username__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    username = user.username

    if not user.is_active:
        return Response({'error': 'This account has been deactivated. Contact an administrator.'}, status=status.HTTP_403_FORBIDDEN)

    user = authenticate(username=username, password=password)

    if user:
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        refresh = RefreshToken.for_user(user)

        # Employee credentials are the authoritative source for staff details.
        # In particular, administrator profiles created by the setup command do
        # not duplicate an employee's department or full name in UserProfile.
        context = get_user_context(user)
        full_name = context['full_name']
        first_name, _, last_name = full_name.partition(' ')
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': first_name,
            'last_name': last_name,
            **context,
        }
        print(f"DEBUG: Login user data being returned: {user_data}")
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_data
        })

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    """Read or update the currently signed-in user without exposing user management."""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    def profile_response():
        serializer_data = UserProfileSerializer(profile, context={'request': request}).data
        context = get_user_context(request.user)
        # Keep profile refreshes consistent with login: employees are the source
        # of the displayed name, department, and job title for staff accounts.
        serializer_data.update({
            key: context[key]
            for key in ('full_name', 'department', 'department_id', 'job_title', 'module_permissions')
        })
        return Response(serializer_data)

    if request.method == 'GET':
        return profile_response()

    full_name = request.data.get('full_name')
    email = request.data.get('email')
    phone = request.data.get('phone')
    if full_name is not None:
        name_parts = full_name.strip().split(None, 1)
        if not name_parts:
            return Response({'error': 'Full name cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.first_name = name_parts[0]
        request.user.last_name = name_parts[1] if len(name_parts) > 1 else ''
    if email is not None:
        email = email.strip().lower()
        if not email:
            return Response({'error': 'Email address cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email__iexact=email).exclude(pk=request.user.pk).exists():
            return Response({'error': 'That email address is already in use.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.email = email
    request.user.save(update_fields=['first_name', 'last_name', 'email'])
    if phone is not None:
        profile.phone = phone.strip()
        profile.save(update_fields=['phone', 'updated_at'])
    return profile_response()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_my_password(request):
    current_password = request.data.get('current_password', '')
    new_password = request.data.get('new_password', '')
    if not request.user.check_password(current_password):
        return Response({'error': 'Your current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 8:
        return Response({'error': 'Your new password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(new_password)
    request.user.save(update_fields=['password'])
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.must_change_password = False
    profile.save(update_fields=['must_change_password', 'updated_at'])
    return Response({'message': 'Password changed successfully.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    return Response(
        {'error': 'Self-registration is disabled. Ask an administrator to send you an account setup invitation.'},
        status=status.HTTP_403_FORBIDDEN,
    )

    # Legacy code retained below temporarily for reference while the invitation
    # workflow replaces public account creation.
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone', '')
    profile_picture = request.FILES.get('profile_picture')

    if not all([first_name, last_name, email, password]):
        return Response({'error': 'First name, last name, email, and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )

        default_role, _ = Role.objects.get_or_create(
            name='User',
            defaults={
                'description': 'Standard User',
                'default_landing_path': '/dashboard',
                'is_system_default': True
            }
        )
        profile = UserProfile.objects.create(
            user=user,
            phone=phone,
            role=default_role
        )

        refresh = RefreshToken.for_user(user)

        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': profile.role.name if profile.role else None,
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── User Management Dashboard Stats ───────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_management_stats(request):
    """Stats for User Management Dashboard"""
    total_users = UserProfile.objects.count()
    pending_approvals = Invitation.objects.filter(status=Invitation.Status.PENDING).count()
    active_administrators = UserProfile.objects.filter(role__name='Administrator', user__is_active=True).count()
    departments_count = Department.objects.count()

    return Response({
        'total_users': total_users,
        'pending_approvals': pending_approvals,
        'active_administrators': active_administrators,
        'departments_count': departments_count,
    })


# ── All Users List with Filtering ───────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_users_list(request):
    """List all users with filtering by department and status"""
    department = request.query_params.get('department')
    status_filter = request.query_params.get('status')

    queryset = UserProfile.objects.select_related('user', 'role').all()

    if department:
        queryset = queryset.filter(role__department__name=department)

    if status_filter:
        if status_filter == 'active':
            queryset = queryset.filter(user__is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(user__is_active=False)

    users_data = []
    for profile in queryset:
        try:
            employee = Employee.objects.get(email=profile.user.email)
            employee_name = employee.full_name
            employee_department = employee.department.get_name_display() if employee.department else None
        except Employee.DoesNotExist:
            employee_name = None
            employee_department = None

        users_data.append({
            'id': profile.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'employee_name': employee_name,
            'department': employee_department,
            'role': profile.role.name if profile.role else None,
            'is_active': profile.user.is_active,
            'created_at': profile.created_at,
        })

    return Response(users_data)


@api_view(['GET', 'POST'])
@permission_classes([IsAdministrator])
def user_detail(request, user_id):
    """User detail view with password reset and activation toggle"""
    try:
        profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        try:
            employee = Employee.objects.get(email=profile.user.email)
            employee_name = employee.full_name
            employee_department = employee.department.get_name_display() if employee.department else None
        except Employee.DoesNotExist:
            employee_name = None
            employee_department = None

        return Response({
            'id': profile.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'employee_name': employee_name,
            'department': employee_department,
            'role': profile.role.name if profile.role else None,
            'is_active': profile.user.is_active,
            'created_at': profile.created_at,
        })

    elif request.method == 'POST':
        action = request.data.get('action')

        if action == 'reset_password':
            # Generate new password and send email
            new_password = User.objects.make_random_password()
            profile.user.set_password(new_password)
            profile.user.save()

            send_mail(
                'Your password has been reset',
                f'Your new password is: {new_password}\nPlease change it after logging in.',
                settings.DEFAULT_FROM_EMAIL,
                [profile.user.email],
            )

            return Response({'message': 'Password reset successfully'})

        elif action == 'toggle_active':
            if profile.user_id == request.user.id:
                return Response({'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)
            if profile.user.is_active and profile.role and profile.role.name == 'Administrator':
                active_admins = UserProfile.objects.filter(role__name='Administrator', user__is_active=True).count()
                if active_admins <= 1:
                    return Response({'error': 'At least one active administrator must remain.'}, status=status.HTTP_400_BAD_REQUEST)
            profile.user.is_active = not profile.user.is_active
            profile.user.save()
            return Response({'message': f'User {"activated" if profile.user.is_active else "deactivated"}'})

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


# ── Pending Approvals Queue ────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdministrator])
def pending_approvals(request):
    """List pending account approvals"""
    invitations = Invitation.objects.filter(status=Invitation.Status.PENDING).select_related('role').order_by('-created_at')

    data = []
    for inv in invitations:
        data.append({
            'id': inv.id,
            'username': inv.email.split('@')[0],  # Derived from email
            'full_name': inv.full_name,
            'role': inv.role.name if inv.role else None,
            'created_at': inv.created_at,
            'expires_at': inv.expires_at,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdministrator])
def approve_account(request, invitation_id):
    """Approve a pending account invitation"""
    try:
        invitation = Invitation.objects.get(id=invitation_id, status=Invitation.Status.PENDING)
    except Invitation.DoesNotExist:
        return Response({'error': 'Pending invitation not found'}, status=status.HTTP_404_NOT_FOUND)

    # Extend expiration by 7 days to give user time to accept
    invitation.expires_at = timezone.now() + timedelta(days=7)
    invitation.save()

    # Resend invitation email
    setup_url = f'{settings.FRONTEND_URL}/auth/setup-account?token={_setup_token(invitation)}'
    send_mail(
        'Your account invitation has been approved',
        f'Your account invitation has been approved. Set up your account within 7 days:\n{setup_url}',
        settings.DEFAULT_FROM_EMAIL,
        [invitation.email],
    )

    return Response({'message': 'Account approved and invitation resent'})


@api_view(['POST'])
@permission_classes([IsAdministrator])
def reject_account(request, invitation_id):
    """Reject a pending account invitation"""
    updated = Invitation.objects.filter(id=invitation_id, status=Invitation.Status.PENDING).update(status=Invitation.Status.REVOKED)
    if not updated:
        return Response({'error': 'Pending invitation not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'Account invitation rejected'})


# ── Roles (JobTitle) Management ─────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdministrator])
def roles_management(request):
    """Manage job titles (roles)"""
    if request.method == 'GET':
        job_titles = JobTitle.objects.select_related('department').annotate(
            employee_count=Count('employee')
        ).all()

        data = []
        for jt in job_titles:
            data.append({
                'id': jt.id,
                'title': jt.title,
                'description': jt.description,
                'department': jt.department.get_name_display() if jt.department else None,
                'department_id': jt.department_id,
                'employee_count': jt.employee_count,
                'created_at': jt.created_at,
            })

        return Response(data)

    elif request.method == 'POST':
        title = request.data.get('title')
        description = request.data.get('description', '')
        department_id = request.data.get('department_id')

        if not title:
            return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)

        if JobTitle.objects.filter(title=title).exists():
            return Response({'error': 'Job title already exists'}, status=status.HTTP_400_BAD_REQUEST)

        department = None
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

        job_title = JobTitle.objects.create(
            title=title,
            description=description,
            department=department
        )

        return Response({'id': job_title.id, 'message': 'Job title created'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdministrator])
def role_detail(request, role_id):
    """Detail view for job title"""
    try:
        job_title = JobTitle.objects.select_related('department').annotate(
            employee_count=Count('employee')
        ).get(id=role_id)
    except JobTitle.DoesNotExist:
        return Response({'error': 'Job title not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'id': job_title.id,
            'title': job_title.title,
            'description': job_title.description,
            'department': job_title.department.get_name_display() if job_title.department else None,
            'department_id': job_title.department_id,
            'employee_count': job_title.employee_count,
            'created_at': job_title.created_at,
        })

    elif request.method == 'PUT':
        job_title.title = request.data.get('title', job_title.title)
        job_title.description = request.data.get('description', job_title.description)

        department_id = request.data.get('department_id')
        if department_id:
            try:
                job_title.department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

        job_title.save()
        return Response({'message': 'Job title updated'})

    elif request.method == 'DELETE':
        job_title.delete()
        return Response({'message': 'Job title deleted'})


# ── Departments with Module Permissions ─────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAdministrator])
def departments_management(request):
    """Manage departments with module access"""
    if request.method == 'GET':
        departments = Department.objects.annotate(
            job_title_count=Count('job_titles'),
            employee_count=Count('employee')
        ).all()

        data = []
        for dept in departments:
            data.append({
                'id': dept.id,
                'name': dept.get_name_display(),
                'name_code': dept.name,
                'job_title_count': dept.job_title_count,
                'employee_count': dept.employee_count,
                'created_at': dept.created_at,
            })

        return Response(data)

    elif request.method == 'POST':
        name = request.data.get('name')

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)

        if Department.objects.filter(name=name).exists():
            return Response({'error': 'Department already exists'}, status=status.HTTP_400_BAD_REQUEST)

        department = Department.objects.create(name=name)

        return Response({'id': department.id, 'message': 'Department created'}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdministrator])
def department_detail(request, department_id):
    """Department detail with module permissions"""
    try:
        department = Department.objects.annotate(
            job_title_count=Count('job_titles'),
            employee_count=Count('employee')
        ).get(id=department_id)
    except Department.DoesNotExist:
        return Response({'error': 'Department not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get module permissions for this department
        module_permissions = ModulePermission.objects.filter(role=department.name)

        modules_data = {}
        for perm in module_permissions:
            modules_data[perm.module] = perm.permission

        return Response({
            'id': department.id,
            'name': department.get_name_display(),
            'name_code': department.name,
            'job_title_count': department.job_title_count,
            'employee_count': department.employee_count,
            'module_permissions': modules_data,
            'created_at': department.created_at,
        })

    elif request.method == 'PUT':
        # Update department name/description if needed
        name = request.data.get('name')
        if name and name != department.name:
            if Department.objects.filter(name=name).exclude(id=department_id).exists():
                return Response({'error': 'Department name already exists'}, status=status.HTTP_400_BAD_REQUEST)
            department.name = name
            department.save()

        # Update module permissions
        permissions = request.data.get('module_permissions', {})

        # Delete existing permissions for this department
        ModulePermission.objects.filter(role=department.name).delete()

        # Create new permissions
        for module, permission in permissions.items():
            ModulePermission.objects.create(
                role=department.name,
                module=module,
                permission=permission
            )

        return Response({'message': 'Department updated'})

    elif request.method == 'DELETE':
        department.delete()
        return Response({'message': 'Department deleted'})


# ── Administrators Management ───────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdministrator])
def administrators_list(request):
    """List all administrators"""
    admins = UserProfile.objects.filter(role__name='Administrator').select_related('user')

    data = []
    for profile in admins:
        data.append({
            'id': profile.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'first_name': profile.user.first_name,
            'last_name': profile.user.last_name,
            'is_active': profile.user.is_active,
            'created_at': profile.created_at,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdministrator])
def set_administrator(request):
    """Promote a user to administrator"""
    user_id = request.data.get('user_id')

    if not user_id:
        return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get or create Administrator role
    admin_role, _ = Role.objects.get_or_create(
        name='Administrator',
        defaults={
            'description': 'Full system administrator',
            'default_landing_path': '/admin/dashboard',
            'is_system_default': True
        }
    )

    profile.role = admin_role
    profile.save()

    return Response({'message': 'User promoted to administrator'})


@api_view(['POST'])
@permission_classes([IsAdministrator])
def remove_administrator(request, user_id):
    """Demote an administrator"""
    try:
        profile = UserProfile.objects.get(id=user_id, role__name='Administrator')
    except UserProfile.DoesNotExist:
        return Response({'error': 'Administrator not found'}, status=status.HTTP_404_NOT_FOUND)

    # Set to default user role
    default_role, _ = Role.objects.get_or_create(
        name='User',
        defaults={
            'description': 'Standard User',
            'default_landing_path': '/dashboard',
            'is_system_default': True
        }
    )

    profile.role = default_role
    profile.save()

    return Response({'message': 'User demoted from administrator'})

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count
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


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        username = user.username
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = authenticate(username=username, password=password)
    
    if user:
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
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
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


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

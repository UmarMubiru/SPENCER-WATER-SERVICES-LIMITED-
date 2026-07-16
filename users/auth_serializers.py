from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status

class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add role information
        if hasattr(user, 'profile') and user.profile.role:
            token['role'] = user.profile.role.name
            token['role_id'] = user.profile.role.id
            token['permissions'] = list(user.profile.permissions.values_list('code', flat=True)) or list(user.profile.role.permissions.values_list('code', flat=True))
            token['landing'] = user.profile.role.default_landing_path
        else:
            token['role'] = None
            token['role_id'] = None
            token['permissions'] = []
            token['landing'] = '/dashboard'
        
        return token

    def run_validation(self, data):
        if hasattr(data, 'get'):
            if 'email' in data and 'username' not in data:
                data = data.copy()
                data['username'] = data['email']
        return super().run_validation(data)

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Get role and permissions details
        if hasattr(self.user, 'profile') and self.user.profile.role:
            role = self.user.profile.role
            role_name = role.name
            role_id = role.id
            permissions = list(self.user.profile.permissions.values_list('code', flat=True)) or list(role.permissions.values_list('code', flat=True))
            landing = role.default_landing_path
        else:
            role_name = None
            role_id = None
            permissions = []
            landing = '/dashboard'
            
        # Add user profile data to response
        if hasattr(self.user, 'profile'):
            data['user'] = {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'role': role_name,
                'role_id': role_id,
                'permissions': permissions,
                'landing': landing,
            }
        
        return data

class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer

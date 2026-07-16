from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from roles.models import Permission, Role
from roles.serializers import PermissionSerializer, RoleSerializer
from roles.permissions import IsRoleAdministrator

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRoleAdministrator()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def by_module(self, request):
        module = request.query_params.get('module')
        if module:
            permissions = Permission.objects.filter(module=module)
            serializer = PermissionSerializer(permissions, many=True)
            return Response(serializer.data)
        return Response({'error': 'Module parameter required'}, status=400)

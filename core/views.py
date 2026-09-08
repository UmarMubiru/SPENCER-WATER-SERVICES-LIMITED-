from rest_framework import viewsets, permissions
from core.models import AuditLog
from core.serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        module = self.request.query_params.get('module', None)
        user = self.request.query_params.get('user', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)

        if module:
            queryset = queryset.filter(module=module)
        if user:
            queryset = queryset.filter(performed_by__username__icontains=user)
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)

        return queryset

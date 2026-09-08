from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from inventory.models import ToolAccountability
from inventory.serializers import ToolAccountabilitySerializer
from inventory.permissions import IsInventoryUser


class ToolAccountabilityListAPIView(generics.ListCreateAPIView):
    """List and create tool accountability records"""
    permission_classes = [IsAuthenticated, IsInventoryUser]
    queryset = ToolAccountability.objects.select_related(
        'tool', 'responsible_person', 'accountable_person', 'approved_by'
    )
    serializer_class = ToolAccountabilitySerializer


class ToolAccountabilityDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve and update tool accountability records"""
    permission_classes = [IsAuthenticated, IsInventoryUser]
    queryset = ToolAccountability.objects.select_related(
        'tool', 'responsible_person', 'accountable_person', 'approved_by'
    )
    serializer_class = ToolAccountabilitySerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsInventoryUser])
def resolve_accountability(request, pk):
    """Resolve a tool accountability record"""
    try:
        accountability = ToolAccountability.objects.get(pk=pk)
    except ToolAccountability.DoesNotExist:
        return Response(
            {"error": "Accountability record not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    resolution = request.data.get('resolution', '')
    approved_by = request.user
    
    accountability.resolution = resolution
    accountability.status = ToolAccountability.Status.ACCOUNTABILITY_RESOLVED
    accountability.resolved_at = timezone.now()
    accountability.approved_by = approved_by
    accountability.save(update_fields=['resolution', 'status', 'resolved_at', 'approved_by'])
    
    serializer = ToolAccountabilitySerializer(accountability)
    return Response(serializer.data)

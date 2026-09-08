from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from inventory.models import InventoryItem
from inventory.services.availability_service import AvailabilityService


class InventoryItemAvailabilityAPIView(generics.RetrieveAPIView):
    """Get availability information for a specific inventory item"""
    permission_classes = [AllowAny]
    queryset = InventoryItem.objects.all()
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        item = self.get_object()
        availability = AvailabilityService.get_tool_availability(item)
        return Response(availability)


@api_view(['GET'])
@permission_classes([AllowAny])
def available_tools_view(request):
    """Get list of available company tools with optional filters"""
    category = request.query_params.get('category')
    search = request.query_params.get('search')
    warehouse = request.query_params.get('warehouse')
    available_only = request.query_params.get('available_only', 'true').lower() == 'true'

    tools = AvailabilityService.get_available_tools(
        category=category,
        search=search,
        warehouse=warehouse,
        available_only=available_only
    )
    return Response(tools)


@api_view(['GET'])
@permission_classes([AllowAny])
def overdue_tools_view(request):
    """Get tools that are overdue for return"""
    overdue = AvailabilityService.get_overdue_tools()
    return Response(overdue)

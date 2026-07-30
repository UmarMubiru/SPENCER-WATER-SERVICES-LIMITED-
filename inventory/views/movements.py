from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from inventory.filters import MovementFilter
from inventory.models import InventoryItem, StockMovement
from inventory.pagination import InventoryPagination
from inventory.permissions import IsInventoryUser
from inventory.serializers import StockMovementSerializer
from inventory.services.movement_service import MovementService


class StockMovementListCreateAPIView(generics.ListCreateAPIView):
    queryset = StockMovement.objects.select_related("inventory_item", "performed_by")
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MovementFilter
    ordering_fields = ["created_at", "quantity"]
    ordering = ["-created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = InventoryItem.objects.get(pk=serializer.validated_data["inventory_item"].pk)
        movement = MovementService.record(
            inventory_item=item,
            movement_type=serializer.validated_data["movement_type"],
            quantity=serializer.validated_data["quantity"],
            reason=serializer.validated_data.get("reason", ""),
            reference=serializer.validated_data.get("reference", ""),
            performed_by=request.user,
        )
        out = self.get_serializer(movement)
        return Response(out.data, status=201)

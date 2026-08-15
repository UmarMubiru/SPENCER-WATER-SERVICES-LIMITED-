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
    queryset = StockMovement.objects.select_related(
        "inventory_item", "performed_by", "supplier"
    )
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]
    pagination_class = InventoryPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MovementFilter
    ordering_fields = ["created_at", "transaction_date", "quantity"]
    ordering = ["-created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        item = InventoryItem.objects.get(pk=data["inventory_item"].pk)

        try:
            movement = MovementService.record(
                inventory_item=item,
                movement_type=data["movement_type"],
                quantity=data["quantity"],
                reason=data.get("reason", StockMovement.MovementReason.OTHER),
                notes=data.get("notes", ""),
                reference=data.get("reference", ""),
                transaction_date=data.get("transaction_date"),
                supplier=data.get("supplier"),
                performed_by=request.user,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)

        out = self.get_serializer(movement)
        return Response(out.data, status=201)

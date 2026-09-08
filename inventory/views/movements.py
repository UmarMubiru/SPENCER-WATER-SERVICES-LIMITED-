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


class StockMovementDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = StockMovement.objects.select_related(
        "inventory_item", "performed_by", "supplier"
    )
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated, IsInventoryUser]

    def update(self, request, *args, **kwargs):
        movement = self.get_object()
        serializer = self.get_serializer(movement, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Get the old values before updating
        old_quantity = movement.quantity
        old_movement_type = movement.movement_type
        old_item = movement.inventory_item
        
        # Check if inventory_item is being changed
        new_item = serializer.validated_data.get("inventory_item", old_item)
        new_quantity = serializer.validated_data.get("quantity", old_quantity)
        new_movement_type = serializer.validated_data.get("movement_type", old_movement_type)
        
        # If quantity or movement_type changed, recalculate item quantity
        if old_quantity != new_quantity or old_movement_type != new_movement_type or old_item != new_item:
            # Save the movement first
            self.perform_update(serializer)
            
            # Recalculate quantity for the old item
            MovementService.recalculate_item_quantity(old_item)
            
            # Recalculate quantity for the new item if it changed
            if old_item != new_item:
                MovementService.recalculate_item_quantity(new_item)
        else:
            # Just update without recalculating
            self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()

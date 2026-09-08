from datetime import timedelta
from django.db import transaction
from django.utils import timezone

from inventory.models import InventoryItem, StockMovement


class MovementService:
    @staticmethod
    @transaction.atomic
    def record(
        inventory_item: InventoryItem,
        movement_type: str,
        quantity: int,
        reason: str = StockMovement.MovementReason.OTHER,
        notes: str = "",
        reference: str = "",
        transaction_date=None,
        supplier=None,
        performed_by=None,
    ):
        """
        Creates a StockMovement and atomically adjusts the InventoryItem's
        quantity, capturing a before/after snapshot on the movement record
        itself. This is the ONLY sanctioned way quantity should change —
        never edit InventoryItem.quantity directly elsewhere, including at
        item-creation time.
        """
        item = InventoryItem.objects.select_for_update().get(pk=inventory_item.pk)
        quantity_before = item.quantity

        if movement_type == StockMovement.MovementType.OUT and item.quantity < quantity:
            raise ValueError(
                f"Cannot move out {quantity} units — only {item.quantity} in stock."
            )

        delta = quantity if movement_type == StockMovement.MovementType.IN else -quantity
        item.quantity = item.quantity + delta
        item.save(update_fields=["quantity", "updated_at"])

        return StockMovement.objects.create(
            inventory_item=item,
            movement_type=movement_type,
            reason=reason,
            notes=notes,
            reference=reference,
            quantity=quantity,
            quantity_before=quantity_before,
            quantity_after=item.quantity,
            transaction_date=transaction_date or timezone.now(),
            supplier=supplier,
            performed_by=performed_by,
        )

    @staticmethod
    def get_recent_movements(days=None):
        """
        Get recent stock movements with optional timeline filtering.
        days: None for all time, 2 for last 2 days, 14 for last 2 weeks
        """
        queryset = StockMovement.objects.select_related('inventory_item', 'performed_by')
        
        if days:
            cutoff_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=cutoff_date)
        
        return queryset.order_by('-created_at')

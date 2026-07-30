from django.db import transaction

from inventory.models import InventoryItem, StockMovement


class MovementService:
    @staticmethod
    @transaction.atomic
    def record(inventory_item: InventoryItem, movement_type: str, quantity: int,
               reason: str = "", reference: str = "", performed_by=None):
        """
        Creates a StockMovement and atomically adjusts the InventoryItem's
        quantity. This is the ONLY sanctioned way quantity should change —
        never edit InventoryItem.quantity directly elsewhere.
        """
        item = InventoryItem.objects.select_for_update().get(pk=inventory_item.pk)

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
            quantity=quantity,
            reason=reason,
            reference=reference,
            performed_by=performed_by,
        )


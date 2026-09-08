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
        material_request=None,
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

        movement = StockMovement.objects.create(
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
            material_request=material_request,
        )
        # Run only after the stock transaction commits, so users never see an
        # alert for a movement that later rolls back.
        transaction.on_commit(MovementService._sync_stock_alerts)
        return movement

    @staticmethod
    def _sync_stock_alerts():
        from reports.tasks import generate_alerts
        generate_alerts()

    @staticmethod
    @transaction.atomic
    def recalculate_item_quantity(inventory_item: InventoryItem):
        """
        Recalculates the inventory item's quantity based on all its stock movements.
        This is used when a movement is updated or deleted to ensure data integrity.
        """
        item = InventoryItem.objects.select_for_update().get(pk=inventory_item.pk)
        
        # Get all movements for this item
        movements = StockMovement.objects.filter(inventory_item=item).order_by('created_at')
        
        # Calculate quantity based on all movements (simple sum)
        quantity = 0
        for movement in movements:
            if movement.movement_type == StockMovement.MovementType.IN:
                quantity += movement.quantity
            else:
                quantity -= movement.quantity
        
        # Update the item's quantity
        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
        
        # Update all movements with correct quantity_before and quantity_after
        current_qty = 0
        for movement in movements:
            movement.quantity_before = current_qty
            if movement.movement_type == StockMovement.MovementType.IN:
                current_qty += movement.quantity
            else:
                current_qty -= movement.quantity
            movement.quantity_after = current_qty
            movement.save(update_fields=["quantity_before", "quantity_after"])

        transaction.on_commit(MovementService._sync_stock_alerts)

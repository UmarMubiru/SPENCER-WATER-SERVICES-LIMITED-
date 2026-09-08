from django.db.models import Sum

from inventory.models import InventoryItem, StockMovement


class StockService:
    @staticmethod
    def quantity(item: InventoryItem):
        stock_in = (
            item.movements.filter(
                movement_type=StockMovement.MovementType.IN
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )

        stock_out = (
            item.movements.filter(
                movement_type=StockMovement.MovementType.OUT
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )

        return stock_in - stock_out

    @staticmethod
    def is_low_stock(item: InventoryItem):
        return StockService.quantity(item) <= item.reorder_level

    @staticmethod
    def status(item: InventoryItem):
        qty = StockService.quantity(item)

        if qty <= 0:
            return "OUT_OF_STOCK"

        if qty <= item.reorder_level:
            return "LOW_STOCK"

        return "IN_STOCK"
from inventory.models import (
    InventoryItem,
    MaterialRequest,
    Product,
    SalesQuotation,
    StockMovement,
)
from inventory.serializers import (
    InventoryItemSerializer,
    StockMovementSerializer,
)


class DashboardService:
    @staticmethod
    def summary():
        all_items = list(InventoryItem.objects.select_related("supplier").all())
        low_stock_items = [i for i in all_items if i.status in ("LOW_STOCK", "OUT_OF_STOCK")]

        recent_movements = (
            StockMovement.objects
            .select_related("inventory_item", "performed_by")
            .order_by("-created_at")[:10]
        )

        return {
            "total_inventory_items": len(all_items),
            "total_products": Product.objects.count(),
            "low_stock_count": len(low_stock_items),
            "pending_requests": MaterialRequest.objects.filter(
                status=MaterialRequest.Status.PENDING
            ).count(),
            "pending_quotations": SalesQuotation.objects.filter(
                status__in=[SalesQuotation.Status.DRAFT, SalesQuotation.Status.SENT]
            ).count(),
            "low_stock_items": InventoryItemSerializer(
                low_stock_items[:10], many=True
            ).data,
            "recent_movements": StockMovementSerializer(
                recent_movements, many=True
            ).data,
        }

from datetime import timedelta
from django.db.models import Sum
from django.utils import timezone

from inventory.models import (
    Product,
    StockMovement,
    Supplier,
)


class ReportService:

    @staticmethod
    def inventory_summary(days=None):
        """
        Get inventory summary with optional timeline filtering.
        days: None for all time, 2 for last 2 days, 14 for last 2 weeks
        """
        queryset = Product.objects.all()
        
        if days:
            cutoff_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(updated_at__gte=cutoff_date)
        
        total_products = queryset.count()

        total_stock = 0

        total_value = 0

        low_stock = 0

        for product in queryset:

            qty = product.quantity

            total_stock += qty

            total_value += (
                qty * product.cost_price
            )

            if product.status != "IN_STOCK":
                low_stock += 1

        return {

            "products": total_products,

            "stock_units": total_stock,

            "inventory_value": total_value,

            "low_stock": low_stock,

            "timeline_days": days,

        }

    @staticmethod
    def supplier_summary(days=None):
        """
        Get supplier summary with optional timeline filtering.
        days: None for all time, 2 for last 2 days, 14 for last 2 weeks
        """
        queryset = Supplier.objects.all()
        
        if days:
            cutoff_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=cutoff_date)
        
        return queryset.count()

    @staticmethod
    def movement_summary(days=None):
        """
        Get movement summary with optional timeline filtering.
        days: None for all time, 2 for last 2 days, 14 for last 2 weeks
        """
        queryset = StockMovement.objects.all()
        
        if days:
            cutoff_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=cutoff_date)

        return {

            "stock_in":
            queryset.filter(
                movement_type="IN"
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0,

            "stock_out":
            queryset.filter(
                movement_type="OUT"
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0,

            "timeline_days": days,

        }

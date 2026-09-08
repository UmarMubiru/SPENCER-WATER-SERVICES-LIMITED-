from django.db.models import Sum

from inventory.models import (
    Product,
    StockMovement,
    Supplier,
)


class ReportService:

    @staticmethod
    def inventory_summary():

        total_products = Product.objects.count()

        total_stock = 0

        total_value = 0

        low_stock = 0

        for product in Product.objects.all():

            qty = product.quantity

            total_stock += qty

            total_value += (
                qty * product.unit_cost
            )

            if product.status != "IN_STOCK":
                low_stock += 1

        return {

            "products": total_products,

            "stock_units": total_stock,

            "inventory_value": total_value,

            "low_stock": low_stock,

        }

    @staticmethod
    def supplier_summary():

        return Supplier.objects.count()

    @staticmethod
    def movement_summary():

        return {

            "stock_in":
            StockMovement.objects.filter(
                movement_type="IN"
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0,

            "stock_out":
            StockMovement.objects.filter(
                movement_type="OUT"
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0,

        }
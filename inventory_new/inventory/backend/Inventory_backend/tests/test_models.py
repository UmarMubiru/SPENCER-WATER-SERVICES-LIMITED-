from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from inventory.models import (
    Supplier,
    Warehouse,
    Product,
    StockMovement,
    MovementType,
    MovementReason,
)

User = get_user_model()


class ProductStockTests(TestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="admin",
            password="password",
        )

        self.supplier = Supplier.objects.create(
            name="ABC Supplier",
            email="abc@test.com",
            phone="0700000000",
        )

        self.warehouse = Warehouse.objects.create(
            name="Main Warehouse",
            code="MAIN",
        )

        self.product = Product.objects.create(
            sku="SKU001",
            name="PVC Pipe",
            category="Pipes",
            unit="pcs",
            unit_cost=Decimal("25.00"),
            reorder_level=10,
            supplier=self.supplier,
            warehouse=self.warehouse,
        )

    def test_initial_quantity(self):

        self.assertEqual(
            self.product.quantity,
            0,
        )

    def test_stock_in(self):

        StockMovement.objects.create(
            product=self.product,
            movement_type=MovementType.IN,
            quantity=25,
            reason=MovementReason.PURCHASE,
            performed_by=self.user,
        )

        self.assertEqual(
            self.product.quantity,
            25,
        )

    def test_stock_out(self):

        StockMovement.objects.create(
            product=self.product,
            movement_type=MovementType.IN,
            quantity=50,
            reason=MovementReason.PURCHASE,
            performed_by=self.user,
        )

        StockMovement.objects.create(
            product=self.product,
            movement_type=MovementType.OUT,
            quantity=15,
            reason=MovementReason.PROJECT,
            performed_by=self.user,
        )

        self.assertEqual(
            self.product.quantity,
            35,
        )
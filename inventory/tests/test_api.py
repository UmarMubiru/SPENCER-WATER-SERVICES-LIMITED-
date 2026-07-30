from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import (
    APITestCase,
)

from rest_framework_simplejwt.tokens import (
    RefreshToken,
)

from inventory.models import (
    Supplier,
    Warehouse,
    Product,
)

User = get_user_model()


class ProductAPITest(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
            username="admin",
            password="password",
        )

        token = RefreshToken.for_user(
            self.user
        )

        self.client.credentials(

            HTTP_AUTHORIZATION=
            f"Bearer {token.access_token}"

        )

        self.supplier = Supplier.objects.create(
            name="Supplier",
            email="supplier@test.com",
            phone="123456",
        )

        self.warehouse = Warehouse.objects.create(
            name="Main",
            code="MAIN",
        )

    def test_create_product(self):

        response = self.client.post(

            "/api/inventory/products/",

            {

                "sku": "SKU100",

                "name": "Valve",

                "category": "Valves",

                "unit": "pcs",

                "unit_cost": Decimal("30.00"),

                "reorder_level": 5,

                "supplier": self.supplier.id,

                "warehouse": self.warehouse.id,

            },

            format="json",

        )

        self.assertEqual(
            response.status_code,
            201,
        )

    def test_dashboard(self):

        Product.objects.create(

            sku="SKU200",

            name="Pipe",

            category="Pipes",

            unit="pcs",

            unit_cost=10,

            reorder_level=3,

            supplier=self.supplier,

            warehouse=self.warehouse,

        )

        response = self.client.get(
            "/api/inventory/dashboard/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "total_products",
            response.data,
        )
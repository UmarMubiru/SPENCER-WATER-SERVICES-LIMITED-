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
    InventoryRequest,
)

User = get_user_model()


class InventoryRequestTests(
    APITestCase
):

    def setUp(self):

        self.user = User.objects.create_user(
            username="manager",
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
            phone="123",
        )

        self.warehouse = Warehouse.objects.create(
            name="Main",
            code="MAIN",
        )

        self.product = Product.objects.create(
            sku="SKU500",
            name="Pump",
            category="Pumps",
            unit="pcs",
            unit_cost=100,
            reorder_level=5,
            supplier=self.supplier,
            warehouse=self.warehouse,
        )

    def test_create_request(self):

        response = self.client.post(

            "/api/inventory/requests/",

            {

                "department": "Engineering",

                "product": self.product.id,

                "quantity": 2,

                "remarks": "Urgent",

            },

            format="json",

        )

        self.assertEqual(
            response.status_code,
            201,
        )

    def test_request_exists(self):

        InventoryRequest.objects.create(

            requester=self.user,

            department="Engineering",

            product=self.product,

            quantity=5,

        )

        self.assertEqual(

            InventoryRequest.objects.count(),

            1,

        )
from django.db.models import Q

from inventory.models import (
    Product,
)


class ProductSearchService:

    @staticmethod
    def search(query):

        return Product.objects.filter(

            Q(name__icontains=query)

            | Q(sku__icontains=query)

            | Q(category__icontains=query)

            | Q(barcode__icontains=query)

        ).select_related(
            "supplier",
            "warehouse",
        )
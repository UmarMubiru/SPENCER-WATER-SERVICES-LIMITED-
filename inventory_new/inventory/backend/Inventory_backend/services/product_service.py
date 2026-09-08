from django.db import transaction

from inventory.models import Product


class ProductService:

    @staticmethod
    @transaction.atomic
    def create(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def update(serializer):
        return serializer.save()

    @staticmethod
    @transaction.atomic
    def delete(product: Product):
        product.delete()
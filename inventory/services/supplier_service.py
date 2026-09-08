from django.db import transaction

from inventory.models import Supplier


class SupplierService:

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
    def delete(supplier: Supplier):
        supplier.delete()
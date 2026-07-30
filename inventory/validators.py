from django.core.exceptions import ValidationError

from inventory.models import Product


def validate_unique_sku(sku, instance=None):

    queryset = Product.objects.filter(
        sku__iexact=sku.strip()
    )

    if instance:
        queryset = queryset.exclude(
            pk=instance.pk
        )

    if queryset.exists():
        raise ValidationError(
            "A product with this SKU already exists."
        )

    return sku


def validate_stock(quantity):

    if quantity <= 0:
        raise ValidationError(
            "Quantity must be greater than zero."
        )

    return quantity


def validate_unit_cost(cost):

    if cost < 0:
        raise ValidationError(
            "Unit cost cannot be negative."
        )

    return cost
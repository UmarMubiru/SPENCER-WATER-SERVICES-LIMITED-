from django.db.models.signals import (
    post_delete,
    post_save,
)

from django.dispatch import receiver

from inventory.models import (
    Product,
    StockMovement,
    MaterialRequest,
    Supplier,
    SalesQuotation,
    SupplierQuotation,
)

from inventory.services.dashboard_cache import (
    DashboardCacheService,
)


@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
def product_changed(
    sender,
    **kwargs,
):
    pass


@receiver(post_save, sender=Supplier)
@receiver(post_delete, sender=Supplier)
def supplier_changed(
    sender,
    **kwargs,
):
    pass


@receiver(post_save, sender=StockMovement)
@receiver(post_delete, sender=StockMovement)
def movement_changed(
    sender,
    **kwargs,
):
    pass


@receiver(post_save, sender=MaterialRequest)
@receiver(post_delete, sender=MaterialRequest)
def request_changed(
    sender,
    **kwargs,
):
    pass


@receiver(post_save, sender=SalesQuotation)
@receiver(post_delete, sender=SalesQuotation)
def sales_quotation_changed(sender, **kwargs):
    pass


@receiver(post_save, sender=SupplierQuotation)
@receiver(post_delete, sender=SupplierQuotation)
def supplier_quotation_changed(sender, **kwargs):
    pass
    
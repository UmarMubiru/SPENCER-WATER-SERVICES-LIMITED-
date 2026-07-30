import django_filters

from inventory.models import (
    Category,
    InventoryItem,
    MaterialRequest,
    Product,
    SalesQuotation,
    StockMovement,
    Supplier,
    SupplierQuotation,
)


class CategoryFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Category
        fields = ["search"]


class InventoryItemFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    status = django_filters.CharFilter(method="filter_status")

    class Meta:
        model = InventoryItem
        fields = ["category", "supplier", "status", "search"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models_q_name_or_sku(value)
        )

    def filter_status(self, queryset, name, value):
        ids = [obj.id for obj in queryset if obj.status == value]
        return queryset.filter(id__in=ids)


class ProductFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    status = django_filters.CharFilter(method="filter_status")

    class Meta:
        model = Product
        fields = ["category", "supplier", "status", "search", "is_active"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models_q_name_or_sku(value)
        )

    def filter_status(self, queryset, name, value):
        ids = [obj.id for obj in queryset if obj.status == value]
        return queryset.filter(id__in=ids)


def models_q_name_or_sku(value):
    from django.db.models import Q
    return Q(name__icontains=value) | Q(sku__icontains=value)


class SupplierFilter(django_filters.FilterSet):
    class Meta:
        model = Supplier
        fields = ["status"]


class MovementFilter(django_filters.FilterSet):
    class Meta:
        model = StockMovement
        fields = ["movement_type", "inventory_item", "reason"]


class RequestFilter(django_filters.FilterSet):
    class Meta:
        model = MaterialRequest
        fields = ["status", "department"]


class SalesQuotationFilter(django_filters.FilterSet):
    class Meta:
        model = SalesQuotation
        fields = ["status"]


class SupplierQuotationFilter(django_filters.FilterSet):
    class Meta:
        model = SupplierQuotation
        fields = ["status", "supplier"]

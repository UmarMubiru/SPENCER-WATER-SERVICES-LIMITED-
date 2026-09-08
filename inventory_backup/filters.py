import django_filters
from datetime import timedelta
from django.utils import timezone

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
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = InventoryItem
        fields = ["category", "supplier", "status", "search", "days"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models_q_name_or_sku(value)
        )

    def filter_status(self, queryset, name, value):
        ids = [obj.id for obj in queryset if obj.status == value]
        return queryset.filter(id__in=ids)

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(updated_at__gte=cutoff_date)
        return queryset


class ProductFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    status = django_filters.CharFilter(method="filter_status")
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = Product
        fields = ["category", "supplier", "status", "search", "is_active", "days"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            models_q_name_or_sku(value)
        )

    def filter_status(self, queryset, name, value):
        ids = [obj.id for obj in queryset if obj.status == value]
        return queryset.filter(id__in=ids)

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(updated_at__gte=cutoff_date)
        return queryset


def models_q_name_or_sku(value):
    from django.db.models import Q
    return Q(name__icontains=value) | Q(sku__icontains=value)


class SupplierFilter(django_filters.FilterSet):
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = Supplier
        fields = ["status", "days"]

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=cutoff_date)
        return queryset


class MovementFilter(django_filters.FilterSet):
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = StockMovement
        fields = ["movement_type", "inventory_item", "reason", "days"]

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=cutoff_date)
        return queryset


class RequestFilter(django_filters.FilterSet):
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = MaterialRequest
        fields = ["status", "department", "days"]

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=cutoff_date)
        return queryset


class SalesQuotationFilter(django_filters.FilterSet):
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = SalesQuotation
        fields = ["status", "days"]

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=cutoff_date)
        return queryset


class SupplierQuotationFilter(django_filters.FilterSet):
    days = django_filters.NumberFilter(method="filter_days")

    class Meta:
        model = SupplierQuotation
        fields = ["status", "supplier", "days"]

    def filter_days(self, queryset, name, value):
        """Filter by timeline: 2 for last 2 days, 14 for last 2 weeks"""
        if value:
            cutoff_date = timezone.now() - timedelta(days=value)
            return queryset.filter(created_at__gte=cutoff_date)
        return queryset

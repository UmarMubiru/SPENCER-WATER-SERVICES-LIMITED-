from django.contrib import admin # type: ignore

from .models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    StockMovement,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
    )

    ordering = (
        "name",
    )


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_code",
        "name",
        "category",
        "quantity",
        "reorder_level",
        "unit",
        "unit_cost",
        "is_active",
    )

    search_fields = (
        "item_code",
        "name",
    )

    list_filter = (
        "category",
        "is_active",
    )

    ordering = (
        "name",
    )


class MaterialRequestItemInline(admin.TabularInline):
    model = MaterialRequestItem
    extra = 1


@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = (
        "request_number",
        "project_reference",
        "requested_by",
        "status",
        "requested_at",
        "approved_by",
    )

    search_fields = (
        "request_number",
        "project_reference",
    )

    list_filter = (
        "status",
    )

    ordering = (
        "-requested_at",
    )

    inlines = [MaterialRequestItemInline]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "inventory_item",
        "movement_type",
        "quantity",
        "balance_before",
        "balance_after",
        "performed_by",
        "created_at",
    )

    search_fields = (
        "inventory_item__name",
        "inventory_item__item_code",
    )

    list_filter = (
        "movement_type",
    )

    ordering = (
        "-created_at",
    )
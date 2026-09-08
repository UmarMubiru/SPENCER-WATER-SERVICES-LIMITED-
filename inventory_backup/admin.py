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
        "created_at",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "name",
        "category",
        "quantity",
        "reorder_level",
        "unit",
        "unit_cost",
    )

    search_fields = (
        "sku",
        "name",
    )

    list_filter = (
        "category",
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
        "project_name",
        "requested_by",
        "status",
        "created_at",
        "reviewed_by",
    )

    search_fields = (
        "request_number",
        "project_name",
    )

    list_filter = (
        "status",
    )

    ordering = (
        "-created_at",
    )

    inlines = [MaterialRequestItemInline]


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        "inventory_item",
        "movement_type",
        "quantity",
        "quantity_before",
        "quantity_after",
        "performed_by",
        "created_at",
    )

    search_fields = (
        "inventory_item__name",
        "inventory_item__sku",
    )

    list_filter = (
        "movement_type",
    )

    ordering = (
        "-created_at",
    )

from django.contrib import admin

from inventory.models import (
    Category,
    InventoryItem,
    MaterialRequest,
    MaterialRequestItem,
    Product,
    SalesQuotation,
    SalesQuotationItem,
    StockMovement,
    Supplier,
    SupplierQuotation,
    SupplierQuotationItem,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "status")
    search_fields = ("name", "email")


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "category", "quantity", "reorder_level", "status")
    search_fields = ("sku", "name")
    list_filter = ("category", "supplier")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "category", "selling_price", "quantity", "status", "is_active")
    search_fields = ("sku", "name")
    list_filter = ("category", "is_active")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("inventory_item", "movement_type", "quantity", "created_at")
    list_filter = ("movement_type",)


class MaterialRequestItemInline(admin.TabularInline):
    model = MaterialRequestItem
    extra = 1


@admin.register(MaterialRequest)
class MaterialRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "project_name", "department", "status", "created_at")
    list_filter = ("status",)
    inlines = [MaterialRequestItemInline]


class SalesQuotationItemInline(admin.TabularInline):
    model = SalesQuotationItem
    extra = 1


@admin.register(SalesQuotation)
class SalesQuotationAdmin(admin.ModelAdmin):
    list_display = ("id", "customer_name", "status", "valid_until", "created_at")
    list_filter = ("status",)
    inlines = [SalesQuotationItemInline]


class SupplierQuotationItemInline(admin.TabularInline):
    model = SupplierQuotationItem
    extra = 1


@admin.register(SupplierQuotation)
class SupplierQuotationAdmin(admin.ModelAdmin):
    list_display = ("id", "supplier", "status", "valid_until", "created_at")
    list_filter = ("status",)
    inlines = [SupplierQuotationItemInline]

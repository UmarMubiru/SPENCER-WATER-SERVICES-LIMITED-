from django.urls import path

from .views import (
    approve_material_request,
    accept_sales_quotation,
    accept_supplier_quotation,
    expire_sales_quotation,
    CategoryListCreateAPIView,
    CategoryDetailAPIView,
    check_item_sku,
    check_product_sku,
    fulfill_material_request,
    invalidate_material_request,
    InventoryDashboardView,
    InventoryItemListCreateAPIView,
    InventoryItemDetailAPIView,
    InventoryReportAPIView,
    MaterialRequestListCreateAPIView,
    MaterialRequestDetailAPIView,
    ProductListCreateAPIView,
    ProductDetailAPIView,
    reject_material_request,
    reject_supplier_quotation,
    SalesQuotationListCreateAPIView,
    SalesQuotationDetailAPIView,
    send_sales_quotation,
    send_supplier_quotation,
    StockMovementListCreateAPIView,
    SupplierListCreateAPIView,
    SupplierDetailAPIView,
    SupplierQuotationListCreateAPIView,
    SupplierQuotationDetailAPIView,
)

urlpatterns = [
    # Dashboard
    path("dashboard/", InventoryDashboardView.as_view(), name="inventory-dashboard"),
    path("reports/", InventoryReportAPIView.as_view(), name="inventory-reports"),

    # Categories
    path("categories/", CategoryListCreateAPIView.as_view(), name="category-list-create"),
    path("categories/<uuid:pk>/", CategoryDetailAPIView.as_view(), name="category-detail"),

    # Suppliers
    path("suppliers/", SupplierListCreateAPIView.as_view(), name="supplier-list-create"),
    path("suppliers/<uuid:pk>/", SupplierDetailAPIView.as_view(), name="supplier-detail"),

    # Inventory Items
    path("inventory-items/", InventoryItemListCreateAPIView.as_view(), name="inventory-item-list-create"),
    path("inventory-items/<uuid:pk>/", InventoryItemDetailAPIView.as_view(), name="inventory-item-detail"),
    path("inventory-items/check-sku/", check_item_sku, name="check-item-sku"),

    # Products
    path("products/", ProductListCreateAPIView.as_view(), name="product-list-create"),
    path("products/<uuid:pk>/", ProductDetailAPIView.as_view(), name="product-detail"),
    path("products/check-sku/", check_product_sku, name="check-product-sku"),

    # Stock Movements
    path("stock-movements/", StockMovementListCreateAPIView.as_view(), name="stock-movement-list-create"),

    # Material Requests
    path("material-requests/", MaterialRequestListCreateAPIView.as_view(), name="material-request-list-create"),
    path("material-requests/<uuid:pk>/", MaterialRequestDetailAPIView.as_view(), name="material-request-detail"),
    path("material-requests/<uuid:pk>/approve/", approve_material_request, name="approve-material-request"),
    path("material-requests/<uuid:pk>/reject/", reject_material_request, name="reject-material-request"),
    path("material-requests/<uuid:pk>/invalidate/", invalidate_material_request, name="invalidate-material-request"),
    path("material-requests/<uuid:pk>/fulfill/", fulfill_material_request, name="fulfill-material-request"),

    # Sales Quotations
    path("sales-quotations/", SalesQuotationListCreateAPIView.as_view(), name="sales-quotation-list-create"),
    path("sales-quotations/<uuid:pk>/", SalesQuotationDetailAPIView.as_view(), name="sales-quotation-detail"),
    path("sales-quotations/<uuid:pk>/send/", send_sales_quotation, name="send-sales-quotation"),
    path("sales-quotations/<uuid:pk>/accept/", accept_sales_quotation, name="accept-sales-quotation"),
    path("sales-quotations/<uuid:pk>/expire/", expire_sales_quotation, name="expire-sales-quotation"),

    # Supplier Quotations
    path("supplier-quotations/", SupplierQuotationListCreateAPIView.as_view(), name="supplier-quotation-list-create"),
    path("supplier-quotations/<uuid:pk>/", SupplierQuotationDetailAPIView.as_view(), name="supplier-quotation-detail"),
    path("supplier-quotations/<uuid:pk>/send/", send_supplier_quotation, name="send-supplier-quotation"),
    path("supplier-quotations/<uuid:pk>/accept/", accept_supplier_quotation, name="accept-supplier-quotation"),
    path("supplier-quotations/<uuid:pk>/reject/", reject_supplier_quotation, name="reject-supplier-quotation"),
]

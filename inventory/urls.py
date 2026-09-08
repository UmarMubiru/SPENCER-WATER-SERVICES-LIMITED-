from django.urls import path

from inventory.health import health_check
from inventory.views import *
from inventory.views.reports import InventoryReportAPIView

urlpatterns = [

    # Dashboard
    path(
        "dashboard/",
        InventoryDashboardAPIView.as_view(),
        name="inventory-dashboard",
    ),

    # Categories
    path(
        "categories/",
        CategoryListCreateAPIView.as_view(),
        name="category-list",
    ),

    path(
        "categories/<uuid:pk>/",
        CategoryDetailAPIView.as_view(),
        name="category-detail",
    ),

    # Products
    path(
        "products/",
        ProductListCreateAPIView.as_view(),
        name="product-list",
    ),

    path(
        "products/check-sku/",
        check_product_sku,
        name="check-product-sku",
    ),

    path(
        "products/<uuid:pk>/",
        ProductDetailAPIView.as_view(),
        name="product-detail",
    ),

    # Inventory Items
    path(
        "inventory-items/",
        InventoryItemListCreateAPIView.as_view(),
        name="inventoryitem-list",
    ),

    path(
        "inventory-items/<uuid:pk>/",
        InventoryItemDetailAPIView.as_view(),
        name="inventoryitem-detail",
    ),

    path(
        "inventory-items/<uuid:pk>/availability/",
        InventoryItemAvailabilityAPIView.as_view(),
        name="inventoryitem-availability",
    ),

    # Alias for inventory-items (frontend compatibility)
    path(
        "items/",
        InventoryItemListCreateAPIView.as_view(),
        name="items-list",
    ),
    path("items/allocate-purchase-number/", allocate_purchase_number, name="items-allocate-purchase-number"),

    path(
        "items/<uuid:pk>/",
        InventoryItemDetailAPIView.as_view(),
        name="items-detail",
    ),

    # Availability
    path(
        "available-tools/",
        available_tools_view,
        name="available-tools",
    ),

    path(
        "overdue-tools/",
        overdue_tools_view,
        name="overdue-tools",
    ),

    # Tool Accountability
    path(
        "tool-accountability/",
        ToolAccountabilityListAPIView.as_view(),
        name="tool-accountability-list",
    ),

    path(
        "tool-accountability/<uuid:pk>/",
        ToolAccountabilityDetailAPIView.as_view(),
        name="tool-accountability-detail",
    ),

    path(
        "tool-accountability/<uuid:pk>/resolve/",
        resolve_accountability,
        name="tool-accountability-resolve",
    ),

    # Stock Movements
    path(
        "movements/",
        StockMovementListCreateAPIView.as_view(),
        name="movement-list",
    ),

    path(
        "movements/<uuid:pk>/",
        StockMovementDetailAPIView.as_view(),
        name="movement-detail",
    ),

    # Suppliers
    path(
        "suppliers/",
        SupplierListCreateAPIView.as_view(),
        name="supplier-list",
    ),

    path(
        "suppliers/<uuid:pk>/",
        SupplierDetailAPIView.as_view(),
        name="supplier-detail",
    ),

    # Material Requests
    path(
        "material-requests/",
        MaterialRequestListCreateAPIView.as_view(),
        name="materialrequest-list",
    ),

    path(
        "material-requests/<uuid:pk>/",
        MaterialRequestDetailAPIView.as_view(),
        name="materialrequest-detail",
    ),

    path(
        "material-requests/<uuid:pk>/approve/",
        approve_material_request,
        name="materialrequest-approve",
    ),

    path(
        "material-requests/<uuid:pk>/reject/",
        reject_material_request,
        name="materialrequest-reject",
    ),

    path("material-requests/<uuid:pk>/invalidate/", invalidate_material_request, name="materialrequest-invalidate"),
    path("material-requests/<uuid:pk>/fulfill/", fulfill_material_request, name="materialrequest-fulfill"),
    path("material-request-items/<uuid:pk>/return/", return_tool, name="materialrequestitem-return-tool"),
    path("material-request-items/<uuid:pk>/extend-return/", extend_return_date, name="materialrequestitem-extend-return"),

    # Sales Quotations
    path(
        "sales-quotations/",
        SalesQuotationListCreateAPIView.as_view(),
        name="salesquotation-list",
    ),

    path(
        "sales-quotations/<uuid:pk>/",
        SalesQuotationDetailAPIView.as_view(),
        name="salesquotation-detail",
    ),

    path("sales-quotations/<uuid:pk>/send/", send_sales_quotation, name="salesquotation-send"),

    path("sales-quotations/<uuid:pk>/accept/", accept_sales_quotation, name="salesquotation-accept"),

    path("sales-quotations/<uuid:pk>/expire/", expire_sales_quotation, name="salesquotation-expire"),

    # Supplier Quotations
    path(
        "supplier-quotations/",
        SupplierQuotationListCreateAPIView.as_view(),
        name="supplierquotation-list",
    ),

    path(
        "supplier-quotations/<uuid:pk>/",
        SupplierQuotationDetailAPIView.as_view(),
        name="supplierquotation-detail",
    ),

    path("supplier-quotations/<uuid:pk>/send/", send_supplier_quotation, name="supplierquotation-send"),

    path("supplier-quotations/<uuid:pk>/accept/", accept_supplier_quotation, name="supplierquotation-accept"),

    path("supplier-quotations/<uuid:pk>/reject/", reject_supplier_quotation, name="supplierquotation-reject"),

    # Reports
    path(
        "reports/",
        InventoryReportAPIView.as_view(),
        name="inventory-reports",
    ),

    # Health
    path(
        "health/",
        health_check,
        name="inventory-health",
    ),
]

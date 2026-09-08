from django.urls import path

from inventory_lily.views import *
from inventory_lily.views.reports import InventoryReportAPIView

urlpatterns = [

    # Dashboard
    path(
        "dashboard/",
        InventoryDashboardAPIView.as_view(),
        name="inventory-dashboard",
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

    # Stock Movements
    path(
        "movements/",
        StockMovementListCreateAPIView.as_view(),
        name="movement-list",
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

    path(
        "material-requests/<uuid:pk>/invalidate/",
        invalidate_material_request,
        name="materialrequest-invalidate",
    ),

    path(
        "material-requests/<uuid:pk>/fulfill/",
        fulfill_material_request,
        name="materialrequest-fulfill",
    ),

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
]

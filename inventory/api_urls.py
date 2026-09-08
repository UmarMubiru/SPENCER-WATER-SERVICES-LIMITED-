from django.urls import path

from inventory import views

urlpatterns = [
    # Dashboard
    path("dashboard/", views.InventoryDashboardView.as_view(), name="inventory-dashboard"),

    # Inventory Items (internal, project-use stock)
    path("items/", views.InventoryItemListCreateAPIView.as_view(), name="item-list"),
    path("items/allocate-purchase-number/", views.allocate_purchase_number, name="item-allocate-purchase-number"),
    path("items/check-sku/", views.check_item_sku, name="item-check-sku"),
    path("items/<uuid:pk>/", views.InventoryItemDetailAPIView.as_view(), name="item-detail"),

    # Products (customer-facing, sellable)
    path("products/", views.ProductListCreateAPIView.as_view(), name="product-list"),
    path("products/check-sku/", views.check_product_sku, name="product-check-sku"),
    path("products/<uuid:pk>/", views.ProductDetailAPIView.as_view(), name="product-detail"),

    # Categories (shared by Inventory Items and Products)
    path("categories/", views.CategoryListCreateAPIView.as_view(), name="category-list"),
    path("categories/<uuid:pk>/", views.CategoryDetailAPIView.as_view(), name="category-detail"),

    # Suppliers
    path("suppliers/", views.SupplierListCreateAPIView.as_view(), name="supplier-list"),
    path("suppliers/<uuid:pk>/", views.SupplierDetailAPIView.as_view(), name="supplier-detail"),

    # Stock movements
    path("movements/", views.StockMovementListCreateAPIView.as_view(), name="movement-list"),

    # Material requests (project leads requesting InventoryItems)
    path("requests/", views.MaterialRequestListCreateAPIView.as_view(), name="request-list"),
    path("requests/<uuid:pk>/", views.MaterialRequestDetailAPIView.as_view(), name="request-detail"),
    path("requests/<uuid:pk>/approve/", views.approve_material_request, name="request-approve"),
    path("requests/<uuid:pk>/reject/", views.reject_material_request, name="request-reject"),
    path("requests/<uuid:pk>/invalidate/", views.invalidate_material_request, name="request-invalidate"),
    path("requests/<uuid:pk>/fulfill/", views.fulfill_material_request, name="request-fulfill"),

    # Sales Quotations (customer-facing, built from Products).
    # URL kept as /quotations/ intentionally, for continuity with earlier work.
    path("quotations/", views.SalesQuotationListCreateAPIView.as_view(), name="sales-quotation-list"),
    path("quotations/<uuid:pk>/", views.SalesQuotationDetailAPIView.as_view(), name="sales-quotation-detail"),
    path("quotations/<uuid:pk>/send/", views.send_sales_quotation, name="sales-quotation-send"),
    path("quotations/<uuid:pk>/accept/", views.accept_sales_quotation, name="sales-quotation-accept"),
    path("quotations/<uuid:pk>/expire/", views.expire_sales_quotation, name="sales-quotation-expire"),

    # Supplier Quotations (RFQs sent TO suppliers, for InventoryItems or Products)
    path("supplier-quotations/", views.SupplierQuotationListCreateAPIView.as_view(), name="supplier-quotation-list"),
    path("supplier-quotations/<uuid:pk>/", views.SupplierQuotationDetailAPIView.as_view(), name="supplier-quotation-detail"),
    path("supplier-quotations/<uuid:pk>/send/", views.send_supplier_quotation, name="supplier-quotation-send"),
    path("supplier-quotations/<uuid:pk>/accept/", views.accept_supplier_quotation, name="supplier-quotation-accept"),
    path("supplier-quotations/<uuid:pk>/reject/", views.reject_supplier_quotation, name="supplier-quotation-reject"),
]

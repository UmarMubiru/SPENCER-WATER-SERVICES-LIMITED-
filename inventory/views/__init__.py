from .categories import (
    CategoryDetailAPIView,
    CategoryListCreateAPIView,
)

from .dashboard import InventoryDashboardView

# Backwards-compatible alias
InventoryDashboardAPIView = InventoryDashboardView

from .items import (
    InventoryItemDetailAPIView,
    InventoryItemListCreateAPIView,
    # InventoryItemMovementAPIView,
    check_item_sku,
)

from .movements import (
    StockMovementListCreateAPIView,
)

from .products import (
    ProductDetailAPIView,
    ProductListCreateAPIView,
    check_product_sku,
)

from .requests import (
    MaterialRequestDetailAPIView,
    MaterialRequestListCreateAPIView,
    approve_request,
    reject_request,
    issue_request,
)

from .quotations import (
    SalesQuotationListCreateAPIView,
    SalesQuotationDetailAPIView,
    send_sales_quotation,
    accept_sales_quotation,
    expire_sales_quotation,
)

from .supplier_quotations import (
    SupplierQuotationListCreateAPIView,
    SupplierQuotationDetailAPIView,
    send_supplier_quotation,
    accept_supplier_quotation,
    reject_supplier_quotation,
)

from .suppliers import (
    SupplierListCreateAPIView,
    SupplierDetailAPIView,
)

__all__ = [
    "CategoryListCreateAPIView",
    "CategoryDetailAPIView",

    "InventoryDashboardView",
    "InventoryDashboardAPIView",

    "InventoryItemListCreateAPIView",
    "InventoryItemDetailAPIView",
    # "InventoryItemMovementAPIView",
    "check_item_sku",

    "ProductListCreateAPIView",
    "ProductDetailAPIView",
    "check_product_sku",

    "StockMovementListCreateAPIView",

    "SupplierListCreateAPIView",
    "SupplierDetailAPIView",

    "MaterialRequestListCreateAPIView",
    "MaterialRequestDetailAPIView",
    "approve_request",
    "reject_request",
    "issue_request",

    "SalesQuotationListCreateAPIView",
    "SalesQuotationDetailAPIView",
    "send_sales_quotation",
    "accept_sales_quotation",
    "expire_sales_quotation",

    "SupplierQuotationListCreateAPIView",
    "SupplierQuotationDetailAPIView",
    "send_supplier_quotation",
    "accept_supplier_quotation",
    "reject_supplier_quotation",
]

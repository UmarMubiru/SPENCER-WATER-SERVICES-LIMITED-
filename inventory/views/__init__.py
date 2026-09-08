from .categories import CategoryDetailAPIView, CategoryListCreateAPIView
from .dashboard import InventoryDashboardView
from .availability import (
    InventoryItemAvailabilityAPIView,
    available_tools_view,
    overdue_tools_view,
)
from .accountability import (
    ToolAccountabilityListAPIView,
    ToolAccountabilityDetailAPIView,
    resolve_accountability,
)

# Alias kept for compatibility with inventory/urls.py (the non-API,
# template-routes file), which imports this name. Both names now work.
InventoryDashboardAPIView = InventoryDashboardView
from .items import (
    InventoryItemDetailAPIView,
    InventoryItemListCreateAPIView,
    allocate_purchase_number,
    check_item_sku,
)
from .movements import StockMovementListCreateAPIView, StockMovementDetailAPIView
from .products import (
    ProductDetailAPIView,
    ProductListCreateAPIView,
    check_product_sku,
)
from .quotations import (
    SalesQuotationDetailAPIView,
    SalesQuotationListCreateAPIView,
    accept_sales_quotation,
    expire_sales_quotation,
    send_sales_quotation,
)
from .requests import (
    MaterialRequestDetailAPIView,
    MaterialRequestListCreateAPIView,
    approve_material_request,
    fulfill_material_request,
    invalidate_material_request,
    reject_material_request,
    return_tool,
    extend_return_date,
)
from .supplier_quotations import (
    SupplierQuotationDetailAPIView,
    SupplierQuotationListCreateAPIView,
    accept_supplier_quotation,
    reject_supplier_quotation,
    send_supplier_quotation,
)
from .suppliers import SupplierDetailAPIView, SupplierListCreateAPIView

__all__ = [
    "CategoryListCreateAPIView",
    "CategoryDetailAPIView",
    "InventoryDashboardView",
    "InventoryDashboardAPIView",
    "InventoryItemAvailabilityAPIView",
    "available_tools_view",
    "overdue_tools_view",
    "ToolAccountabilityListAPIView",
    "ToolAccountabilityDetailAPIView",
    "resolve_accountability",
    "InventoryItemListCreateAPIView",
    "InventoryItemDetailAPIView",
    "allocate_purchase_number",
    "check_item_sku",
    "ProductListCreateAPIView",
    "ProductDetailAPIView",
    "check_product_sku",
    "SupplierListCreateAPIView",
    "SupplierDetailAPIView",
    "StockMovementListCreateAPIView",
    "StockMovementDetailAPIView",
    "MaterialRequestListCreateAPIView",
    "MaterialRequestDetailAPIView",
    "approve_material_request",
    "reject_material_request",
    "invalidate_material_request",
    "fulfill_material_request",
    "return_tool",
    "extend_return_date",
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

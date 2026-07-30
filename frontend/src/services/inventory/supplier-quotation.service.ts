import inventoryAPI from "./api";
import {
  ListSupplierQuotationsParams,
  SupplierQuotation,
  SupplierQuotationInput,
} from "@/types/inventory/supplier-quotations";

function toApiInput(data: SupplierQuotationInput) {
  return {
    supplier: data.supplier, valid_until: data.validUntil, notes: data.notes,
    items: data.items.map((item) => ({
      inventory_item: item.inventoryItem, product: item.product, quantity: item.quantity, unit_price: item.unitPrice,
    })),
  };
}

function fromApiQuotation(quotation: any): SupplierQuotation {
  return {
    id: quotation.id, supplier: quotation.supplier, supplierName: quotation.supplierName ?? quotation.supplier_name,
    status: quotation.status, validUntil: quotation.validUntil ?? quotation.valid_until, notes: quotation.notes,
    items: quotation.items.map((item: any) => ({
      id: item.id, inventoryItem: item.inventory_item, inventoryItemName: item.inventory_item_name ?? item.inventoryItemName,
      product: item.product, productName: item.product_name ?? item.productName, quantity: item.quantity,
      unitPrice: Number(item.unitPrice ?? item.unit_price), subtotal: Number(item.subtotal),
    })),
    total: Number(quotation.total), createdAt: quotation.createdAt ?? quotation.created_at, updatedAt: quotation.updatedAt ?? quotation.updated_at,
  };
}

function mapListResponse(response: any) {
  const data = response.data;
  response.data = Array.isArray(data) ? data.map(fromApiQuotation) : { ...data, results: data.results.map(fromApiQuotation) };
  return response;
}

export const SupplierQuotationService = {
  getAll: (params: ListSupplierQuotationsParams) => inventoryAPI.get("/supplier-quotations/", { params }).then(mapListResponse),
  getById: (id: string) => inventoryAPI.get(`/supplier-quotations/${id}/`).then((response) => ({ ...response, data: fromApiQuotation(response.data) })),
  create: (data: SupplierQuotationInput) => inventoryAPI.post("/supplier-quotations/", toApiInput(data)),
  update: (id: string, data: Partial<SupplierQuotationInput>) => inventoryAPI.patch(`/supplier-quotations/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/supplier-quotations/${id}/`),
  send: (id: string) => inventoryAPI.post(`/supplier-quotations/${id}/send/`),
  accept: (id: string) => inventoryAPI.post(`/supplier-quotations/${id}/accept/`),
  reject: (id: string) => inventoryAPI.post(`/supplier-quotations/${id}/reject/`),
};

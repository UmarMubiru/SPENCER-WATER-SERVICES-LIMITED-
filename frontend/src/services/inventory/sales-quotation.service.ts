import inventoryAPI from "./api";
import { ListSalesQuotationsParams, SalesQuotation, SalesQuotationInput } from "@/types/inventory/sales-quotations";

function toApiInput(data: SalesQuotationInput) {
  return {
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    valid_until: data.validUntil,
    notes: data.notes,
    items: data.items.map((item) => ({ product: item.product, quantity: item.quantity, unit_price: item.unitPrice })),
  };
}

function fromApiQuotation(quotation: any): SalesQuotation {
  return {
    id: quotation.id, customerName: quotation.customerName ?? quotation.customer_name,
    customerEmail: quotation.customerEmail ?? quotation.customer_email,
    status: quotation.status, validUntil: quotation.validUntil ?? quotation.valid_until, notes: quotation.notes,
    items: quotation.items.map((item: any) => ({
      id: item.id, product: item.product, productName: item.product_name ?? item.productName, productSku: item.product_sku ?? item.productSku,
      quantity: item.quantity, unitPrice: Number(item.unitPrice ?? item.unit_price), subtotal: Number(item.subtotal),
    })),
    total: Number(quotation.total), createdAt: quotation.createdAt ?? quotation.created_at, updatedAt: quotation.updatedAt ?? quotation.updated_at,
  };
}

function mapListResponse(response: any) {
  const data = response.data;
  response.data = Array.isArray(data) ? data.map(fromApiQuotation) : { ...data, results: data.results.map(fromApiQuotation) };
  return response;
}

// Route stays /quotations/ for continuity with earlier work; this is the
// customer-facing quotation (as opposed to SupplierQuotationService below).
export const SalesQuotationService = {
  getAll: (params: ListSalesQuotationsParams) => inventoryAPI.get("/quotations/", { params }).then(mapListResponse),
  getById: (id: string) => inventoryAPI.get(`/quotations/${id}/`).then((response) => ({ ...response, data: fromApiQuotation(response.data) })),
  create: (data: SalesQuotationInput) => inventoryAPI.post("/quotations/", toApiInput(data)),
  update: (id: string, data: Partial<SalesQuotationInput>) => inventoryAPI.patch(`/quotations/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/quotations/${id}/`),
  send: (id: string) => inventoryAPI.post(`/quotations/${id}/send/`),
  accept: (id: string) => inventoryAPI.post(`/quotations/${id}/accept/`),
  expire: (id: string) => inventoryAPI.post(`/quotations/${id}/expire/`),
};

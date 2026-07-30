import inventoryAPI from "./api";
import { ListSalesQuotationsParams, SalesQuotationInput } from "@/types/inventory/sales-quotations";

// Route stays /quotations/ for continuity with earlier work; this is the
// customer-facing quotation (as opposed to SupplierQuotationService below).
export const SalesQuotationService = {
  getAll: (params: ListSalesQuotationsParams) => inventoryAPI.get("/quotations/", { params }),
  getById: (id: string) => inventoryAPI.get(`/quotations/${id}/`),
  create: (data: SalesQuotationInput) => inventoryAPI.post("/quotations/", data),
  update: (id: string, data: Partial<SalesQuotationInput>) => inventoryAPI.patch(`/quotations/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/quotations/${id}/`),
};

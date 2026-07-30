import inventoryAPI from "./api";
import {
  ListSupplierQuotationsParams,
  SupplierQuotationInput,
} from "@/types/inventory/supplier-quotations";

export const SupplierQuotationService = {
  getAll: (params: ListSupplierQuotationsParams) => inventoryAPI.get("/supplier-quotations/", { params }),
  getById: (id: string) => inventoryAPI.get(`/supplier-quotations/${id}/`),
  create: (data: SupplierQuotationInput) => inventoryAPI.post("/supplier-quotations/", data),
  update: (id: string, data: Partial<SupplierQuotationInput>) => inventoryAPI.patch(`/supplier-quotations/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/supplier-quotations/${id}/`),
};

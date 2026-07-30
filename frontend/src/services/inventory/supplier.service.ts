import inventoryAPI from "./api";
import { ListSuppliersParams, SupplierInput } from "@/types/inventory/supplier";

export const SupplierService = {
  getAll: (params: ListSuppliersParams) => inventoryAPI.get("/suppliers/", { params }),
  getById: (id: string) => inventoryAPI.get(`/suppliers/${id}/`),
  create: (data: SupplierInput) => inventoryAPI.post("/suppliers/", data),
  update: (id: string, data: Partial<SupplierInput>) => inventoryAPI.patch(`/suppliers/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/suppliers/${id}/`),
};

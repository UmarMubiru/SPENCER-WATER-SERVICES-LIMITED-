import inventoryAPI from "./api";
import { ListRequestsParams, MaterialRequestInput } from "@/types/inventory/requests";

export const RequestService = {
  getAll: (params: ListRequestsParams) => inventoryAPI.get("/requests/", { params }),
  getById: (id: string) => inventoryAPI.get(`/requests/${id}/`),
  create: (data: MaterialRequestInput) => inventoryAPI.post("/requests/", data),
  approve: (id: string, approvedQuantities?: Record<string, number>) =>
    inventoryAPI.post(`/requests/${id}/approve/`, { approvedQuantities }),
  reject: (id: string) => inventoryAPI.post(`/requests/${id}/reject/`),
  issue: (id: string) => inventoryAPI.post(`/requests/${id}/issue/`),
};

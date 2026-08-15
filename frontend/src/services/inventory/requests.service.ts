import inventoryAPI from "./api";
import { ListRequestsParams, MaterialRequestInput } from "@/types/inventory/requests";

const basePath = "/material-requests";

export const RequestService = {
  getAll: (params: ListRequestsParams) => inventoryAPI.get(`${basePath}/`, { params }),
  getById: (id: string) => inventoryAPI.get(`${basePath}/${id}/`),
  create: (data: MaterialRequestInput) => inventoryAPI.post(`${basePath}/`, data),

  approve: (id: string, approvedQuantities?: Record<string, number>, notes?: string) =>
    inventoryAPI.post(`${basePath}/${id}/approve/`, { approvedQuantities, notes }),

  reject: (id: string, notes?: string) =>
    inventoryAPI.post(`${basePath}/${id}/reject/`, { notes }),

  invalidate: (id: string, notes?: string) =>
    inventoryAPI.post(`${basePath}/${id}/invalidate/`, { notes }),

  fulfill: (id: string, issuedQuantities?: Record<string, number>) =>
    inventoryAPI.post(`${basePath}/${id}/fulfill/`, { issuedQuantities }),
};
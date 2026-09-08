import inventoryAPI from "./api";
import { ListMovementsParams, StockMovementInput } from "@/types/inventory/movement";

export const MovementService = {
  getAll: (params: ListMovementsParams) => inventoryAPI.get("/movements/", { params }),
  create: (data: StockMovementInput) => inventoryAPI.post("/movements/", data),
  update: (id: string, data: Partial<StockMovementInput>) => inventoryAPI.patch(`/movements/${id}/`, data),
};

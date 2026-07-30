import inventoryAPI from "./api";
import { ListInventoryItemsParams, InventoryItemInput } from "@/types/inventory/inventory-items";

export const InventoryItemService = {
  getAll: (params: ListInventoryItemsParams) => inventoryAPI.get("/items/", { params }),
  getById: (id: string) => inventoryAPI.get(`/items/${id}/`),
  create: (data: InventoryItemInput) => inventoryAPI.post("/items/", data),
  update: (id: string, data: Partial<InventoryItemInput>) => inventoryAPI.patch(`/items/${id}/`, data),
  remove: (id: string) => inventoryAPI.delete(`/items/${id}/`),
  checkSku: (sku: string) => inventoryAPI.get("/items/check-sku/", { params: { sku } }),
};


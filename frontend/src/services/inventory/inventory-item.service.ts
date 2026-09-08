import inventoryAPI from "./api";
import { ListInventoryItemsParams, InventoryItemInput } from "@/types/inventory/inventory-items";

function normalizeInventoryItemInput(data: InventoryItemInput | Partial<InventoryItemInput>) {
  return {
    ...data,
    category: data.category === "" ? null : data.category,
    supplier: data.supplier === "" ? null : data.supplier,
    transactionDate: data.transactionDate === "" ? null : data.transactionDate,
  };
}

export const InventoryItemService = {
  getAll: (params: ListInventoryItemsParams) => inventoryAPI.get("/items/", { params }),
  getById: (id: string) => inventoryAPI.get(`/items/${id}/`),
  create: (data: InventoryItemInput) =>
    inventoryAPI.post("/items/", normalizeInventoryItemInput(data)),
  update: (id: string, data: Partial<InventoryItemInput>) =>
    inventoryAPI.patch(`/items/${id}/`, normalizeInventoryItemInput(data)),
  remove: (id: string) => inventoryAPI.delete(`/items/${id}/`),
  checkSku: (sku: string) => inventoryAPI.get("/items/check-sku/", { params: { sku } }),
  allocatePurchaseNumber: () =>
    inventoryAPI.post<{ purchaseNumber: string }>("/items/allocate-purchase-number/"),
};


import { StockStatus } from "./common";

export interface InventoryItem {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category?: string | null;
  categoryName?: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  status: StockStatus;
  supplier?: string | null;
  supplierName?: string;
  warehouse?: string;
  createdAt: string;
  updatedAt: string;
}

export type InventoryItemInput = Omit<
  InventoryItem,
  "id" | "quantity" | "status" | "supplierName" | "categoryName" | "createdAt" | "updatedAt"
>;

export type ListInventoryItemsParams = {
  page: number;
  search?: string;
  category?: string;
  status?: string;
};

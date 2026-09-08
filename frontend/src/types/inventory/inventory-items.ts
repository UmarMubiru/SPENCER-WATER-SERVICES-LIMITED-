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
  inventoryType: "MATERIAL" | "COMPANY_TOOL";
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
  "id" | "sku" | "quantity" | "status" | "supplierName" | "categoryName" | "createdAt" | "updatedAt"
> & {
  sku?: string;
  // Only meaningful at creation time — records the opening stock as a
  // real StockMovement rather than setting quantity directly.
  initialQuantity?: number;
  movementReason?: "PURCHASE" | "RETURN";
  transactionDate?: string | null;
};

export type ListInventoryItemsParams = {
  page: number;
  search?: string;
  category?: string;
  status?: string;
};

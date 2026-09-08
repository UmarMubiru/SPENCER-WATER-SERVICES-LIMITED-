import { InventoryItem } from "./inventory-items";
import { StockMovement } from "./movement";

export interface DashboardSummary {
  totalInventoryItems: number;
  totalProducts: number;
  lowStockCount: number;
  pendingRequests: number;
  pendingQuotations: number;
  lowStockItems: InventoryItem[];
  recentMovements: StockMovement[];
}

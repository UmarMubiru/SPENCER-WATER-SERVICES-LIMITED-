import inventoryAPI from "./api";
import { DashboardSummary } from "@/types/inventory/dashboard";

type DashboardApiResponse = {
  total_inventory_items?: number;
  total_products?: number;
  low_stock_count?: number;
  pending_requests?: number;
  pending_quotations?: number;
  low_stock_items?: DashboardSummary["lowStockItems"];
  recent_movements?: DashboardSummary["recentMovements"];
};

export const DashboardService = {
  summary: () => inventoryAPI.get<DashboardApiResponse>("/dashboard/").then((response) => ({
    ...response,
    data: {
      totalInventoryItems: Number(response.data.total_inventory_items ?? 0),
      totalProducts: Number(response.data.total_products ?? 0),
      lowStockCount: Number(response.data.low_stock_count ?? 0),
      pendingRequests: Number(response.data.pending_requests ?? 0),
      pendingQuotations: Number(response.data.pending_quotations ?? 0),
      lowStockItems: response.data.low_stock_items ?? [],
      recentMovements: response.data.recent_movements ?? [],
    } satisfies DashboardSummary,
  }))

};

"use client";

import DashboardCards from "@/components/inventory/dashboard/DashboardCards";
import InventoryPageHeader from "@/components/inventory/layout/InventoryPageHeader";
import LowStockTable from "@/components/inventory/dashboard/LowStockTable";
import RecentMovements from "@/components/inventory/dashboard/RecentMovements";
import { useDashboard } from "@/hooks/inventory/useDashboard";

export default function InventoryDashboardPage() {
  const { dashboard, loading } = useDashboard();

  if (loading || !dashboard) {
    return <div className="inventory-dashboard min-h-[calc(100vh-4rem)] p-8 text-blue-400">Loading...</div>;
  }

  return (
    <div className="inventory-dashboard min-h-[calc(100vh-4rem)] space-y-8 p-8">
      <InventoryPageHeader
        title="Inventory Dashboard"
        description="Inventory overview and operational insights."
      />

      <DashboardCards
        totalItems={dashboard.totalInventoryItems}
        totalProducts={dashboard.totalProducts}
        lowStock={dashboard.lowStockCount}
        pendingRequests={dashboard.pendingRequests}
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <LowStockTable items={dashboard.lowStockItems} />
        <RecentMovements movements={dashboard.recentMovements} />
      </div>
    </div>
  );
}

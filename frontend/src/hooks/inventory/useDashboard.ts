"use client";

import { useEffect, useState } from "react";
import { DashboardService } from "@/services/inventory/dashboard.service";
import { DashboardSummary } from "@/types/inventory/dashboard";

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);

  const fetchOne = () =>
    DashboardService.summary().then((res) => setDashboard(res.data));

  useEffect(() => {
    fetchOne().finally(() => setLoading(false));
    const refreshInterval = window.setInterval(fetchOne, 15000);
    return () => window.clearInterval(refreshInterval);
  }, []);

  return { loading, dashboard, refresh: fetchOne };
}

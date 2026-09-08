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
    setLoading(true);
    fetchOne().finally(() => setLoading(false));
  }, []);

  return { loading, dashboard, refresh: fetchOne };
}

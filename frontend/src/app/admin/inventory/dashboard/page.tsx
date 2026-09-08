"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardCards from "@/components/inventory/dashboard/DashboardCards";
import LowStockTable from "@/components/inventory/dashboard/LowStockTable";
import RecentMovements from "@/components/inventory/dashboard/RecentMovements";
import { useDashboard } from "@/hooks/inventory/useDashboard";

interface OverdueTool {
  id: string;
  tool_name: string;
  tool_sku: string;
  project_name: string;
  responsible_person_name: string;
  issued_date: string;
  expected_return_date: string;
  days_overdue: number;
}

export default function InventoryDashboardPage() {
  const { dashboard, loading } = useDashboard();
  const [activeSection, setActiveSection] = useState<'low-stock' | 'movements' | 'overdue'>('low-stock');
  const [overdueTools, setOverdueTools] = useState<OverdueTool[]>([]);
  const [loadingOverdue, setLoadingOverdue] = useState(false);

  useEffect(() => {
    if (activeSection === 'overdue') {
      fetchOverdueTools();
    }
  }, [activeSection]);

  const fetchOverdueTools = async () => {
    setLoadingOverdue(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/overdue-tools/');
      if (response.ok) {
        const data = await response.json();
        setOverdueTools(data.tools || []);
      }
    } catch (err) {
      console.error('Failed to fetch overdue tools:', err);
    } finally {
      setLoadingOverdue(false);
    }
  };

  if (loading || !dashboard) {
    return <div className="inventory-dashboard p-5 text-blue-400 text-sm">Loading...</div>;
  }

  return (
    <div className="inventory-dashboard mx-auto w-full max-w-none space-y-6 p-2 md:p-3">
      <DashboardCards
        totalItems={dashboard.totalInventoryItems}
        lowStock={dashboard.lowStockCount}
        pendingRequests={dashboard.pendingRequests}
        overdueTools={overdueTools.length}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-blue-950">Inventory details</h2>
            <p className="text-sm text-slate-500">Choose a section to view its full table.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveSection('low-stock')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeSection === 'low-stock' ? 'bg-blue-600 text-white shadow-sm' : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'}`}>Low stock items ({dashboard.lowStockCount})</button>
            <button type="button" onClick={() => setActiveSection('movements')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeSection === 'movements' ? 'bg-blue-600 text-white shadow-sm' : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'}`}>Recent movements</button>
            <button type="button" onClick={() => setActiveSection('overdue')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition relative ${activeSection === 'overdue' ? 'bg-red-600 text-white shadow-sm' : 'border border-red-200 bg-white text-red-700 hover:bg-red-50'}`}>
              Overdue tools
              {overdueTools.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {overdueTools.length}
                </span>
              )}
            </button>
          </div>
        </div>
        {activeSection === 'low-stock' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1"><div><h3 className="font-semibold text-blue-950">Low stock items</h3><p className="text-sm text-slate-500">Items that need replenishment or a stock review.</p></div><Link href="/admin/inventory/items" className="text-sm font-semibold text-blue-700 hover:text-blue-900">View all items</Link></div>
            <LowStockTable items={dashboard.lowStockItems} />
          </div>
        ) : activeSection === 'movements' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1"><div><h3 className="font-semibold text-blue-950">Latest stock movements</h3><p className="text-sm text-slate-500">The most recent changes to the inventory ledger.</p></div><Link href="/admin/inventory/movements" className="text-sm font-semibold text-blue-700 hover:text-blue-900">View movement history</Link></div>
            <RecentMovements movements={dashboard.recentMovements} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1"><div><h3 className="font-semibold text-red-950">Overdue tools</h3><p className="text-sm text-slate-500">Tools that have passed their expected return date.</p></div><Link href="/admin/inventory/accountability" className="text-sm font-semibold text-red-700 hover:text-red-900">View accountability</Link></div>
            {loadingOverdue ? (
              <div className="p-8 text-center text-blue-400">Loading...</div>
            ) : overdueTools.length === 0 ? (
              <div className="p-8 text-center text-green-600 bg-green-50 rounded-xl">
                <div className="text-4xl mb-2">✓</div>
                <p className="font-medium">No overdue tools</p>
                <p className="text-sm text-slate-500">All tools are returned on time!</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-red-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-red-50 text-left text-red-700">
                    <tr>
                      <th className="p-4">Tool</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Responsible Person</th>
                      <th className="p-4">Expected Return</th>
                      <th className="p-4">Days Overdue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueTools.map((tool) => (
                      <tr className="border-t border-red-100" key={tool.id}>
                        <td className="p-4">
                          <div className="font-medium">{tool.tool_name}</div>
                          <div className="text-gray-500 text-xs">{tool.tool_sku}</div>
                        </td>
                        <td className="p-4">{tool.project_name || '—'}</td>
                        <td className="p-4">{tool.responsible_person_name || '—'}</td>
                        <td className="p-4">
                          {tool.expected_return_date ? new Date(tool.expected_return_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            {tool.days_overdue} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

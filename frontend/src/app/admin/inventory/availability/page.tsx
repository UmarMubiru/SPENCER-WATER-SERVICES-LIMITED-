'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface AvailableTool {
  id: string;
  sku: string;
  name: string;
  category: string;
  category_name: string;
  warehouse: string;
  quantity: number;
  available_quantity: number;
  issued_quantity: number;
  unit: string;
  unit_cost: number;
}

interface OverdueTool {
  id: string;
  sku: string;
  name: string;
  project_name: string;
  project_id: string;
  responsible_person_name: string;
  expected_return_date: string;
  days_overdue: number;
  quantity: number;
}

export default function ToolAvailabilityPage() {
  const [tools, setTools] = useState<AvailableTool[]>([]);
  const [overdueTools, setOverdueTools] = useState<OverdueTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOverdue, setShowOverdue] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    warehouse: '',
    available_only: true,
  });

  useEffect(() => {
    fetchAvailableTools();
    fetchOverdueTools();
  }, [filters]);

  const fetchAvailableTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.warehouse) params.append('warehouse', filters.warehouse);
      params.append('available_only', filters.available_only.toString());

      const response = await fetch(`http://127.0.0.1:8000/api/inventory/available-tools/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTools(data);
      }
    } catch (err) {
      console.error('Failed to fetch available tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueTools = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/overdue-tools/');
      if (response.ok) {
        const data = await response.json();
        setOverdueTools(data);
      }
    } catch (err) {
      console.error('Failed to fetch overdue tools:', err);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activePath="/admin/inventory" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Tool Availability"
            subtitle="View available company tools for project allocation"
            onSearch={(q) => handleFilterChange('search', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4">
            <button
              onClick={() => setShowOverdue(false)}
              className={`px-4 py-2 rounded-lg ${!showOverdue ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Available Tools
            </button>
            <button
              onClick={() => setShowOverdue(true)}
              className={`px-4 py-2 rounded-lg ${showOverdue ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'} relative`}
            >
              Overdue Tools
              {overdueTools.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {overdueTools.length}
                </span>
              )}
            </button>
          </div>

          {!showOverdue ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    placeholder="Filter by category"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                  <input
                    type="text"
                    value={filters.warehouse}
                    onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                    placeholder="Filter by warehouse"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.available_only}
                      onChange={(e) => handleFilterChange('available_only', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Show only available</span>
                  </label>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchAvailableTools}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Warehouse</th>
                      <th className="p-4">Total Qty</th>
                      <th className="p-4">Available</th>
                      <th className="p-4">Issued</th>
                      <th className="p-4">Unit Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool) => (
                      <tr className="border-t" key={tool.id}>
                        <td className="p-4 font-medium">{tool.sku}</td>
                        <td className="p-4">{tool.name}</td>
                        <td className="p-4">{tool.category_name}</td>
                        <td className="p-4">{tool.warehouse || '—'}</td>
                        <td className="p-4">{tool.quantity} {tool.unit}</td>
                        <td className="p-4">
                          <span className={`font-medium ${tool.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tool.available_quantity} {tool.unit}
                          </span>
                        </td>
                        <td className="p-4">{tool.issued_quantity} {tool.unit}</td>
                        <td className="p-4">UGX {tool.unit_cost.toLocaleString()}</td>
                      </tr>
                    ))}
                    {tools.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500">
                          No tools found matching your filters
                        </td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Overdue Tools</h2>
                <p className="text-sm text-gray-500">Tools that have passed their expected return date</p>
              </div>

              {overdueTools.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No overdue tools found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-500">
                      <tr>
                        <th className="p-4">Tool</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Project</th>
                        <th className="p-4">Responsible Person</th>
                        <th className="p-4">Due Date</th>
                        <th className="p-4">Days Overdue</th>
                        <th className="p-4">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueTools.map((tool) => (
                        <tr className="border-t" key={tool.id}>
                          <td className="p-4 font-medium">{tool.name}</td>
                          <td className="p-4 text-gray-500">{tool.sku}</td>
                          <td className="p-4">{tool.project_name || '—'}</td>
                          <td className="p-4">{tool.responsible_person_name || '—'}</td>
                          <td className="p-4">
                            {tool.expected_return_date ? new Date(tool.expected_return_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {tool.days_overdue} days
                            </span>
                          </td>
                          <td className="p-4">{tool.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

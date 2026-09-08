'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';

interface SystemActivity {
  id: string;
  module: string;
  module_display: string;
  action: string;
  action_display: string;
  description: string;
  performed_by_name: string;
  department: string;
  reference_id: string;
  reference_type: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  created_at: string;
}

export default function InventoryActivityPage() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filterAction, filterDateFrom, filterDateTo]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('module', 'inventory');
      if (filterAction) params.append('action', filterAction);
      if (filterDateFrom) params.append('date_from', filterDateFrom);
      if (filterDateTo) params.append('date_to', filterDateTo);

      const response = await fetch(`http://127.0.0.1:8000/api/reports/activities/?${params.toString()}`);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      setActivities(results);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      approve: 'bg-purple-100 text-purple-800',
      issue: 'bg-yellow-100 text-yellow-800',
      return: 'bg-orange-100 text-orange-800',
      adjustment: 'bg-pink-100 text-pink-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(activities.length / itemsPerPage);

  return (
    <AdminLayout
      title="Inventory Management Activity"
      subtitle="Audit log for inventory-related activities"
      activePath="/admin/reports/system-activity"
    >
      <div className="space-y-6">
        <Link href="/admin/reports/system-activity">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to System Activity
          </button>
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                <option value="create">Created</option>
                <option value="update">Updated</option>
                <option value="approve">Approved</option>
                <option value="issue">Issued</option>
                <option value="return">Returned</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-base">Inventory Activities</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({activities.length} total)
              </span>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No activities found</td>
                  </tr>
                ) : (
                  paginatedActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(activity.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                          {activity.action_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {activity.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.performed_by_name || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.reference_id ? (
                          <span className="font-mono text-xs">{activity.reference_id}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.ip_address || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

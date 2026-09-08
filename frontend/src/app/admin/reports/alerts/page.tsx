'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';

interface Alert {
  id: string;
  title: string;
  description: string;
  category: string;
  category_display: string;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  reference_id: string;
  reference_type: string;
  assigned_to_name: string;
  created_at: string;
  due_date: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filterStatus, filterPriority, filterCategory]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterCategory) params.append('category', filterCategory);

      const response = await fetch(`http://127.0.0.1:8000/api/reports/alerts/?${params.toString()}`);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      setAlerts(results);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reports/alerts/${alertId}/resolve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_notes: resolutionNotes }),
      });
      if (response.ok) {
        fetchAlerts();
        setSelectedAlert(null);
        setResolutionNotes('');
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reports/alerts/${alertId}/dismiss/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchAlerts();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-gray-100 text-gray-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      contract: 'bg-purple-100 text-purple-800',
      project: 'bg-green-100 text-green-800',
      inventory: 'bg-yellow-100 text-yellow-800',
      user: 'bg-red-100 text-red-800',
      tender: 'bg-orange-100 text-orange-800',
      activity: 'bg-pink-100 text-pink-800',
      employee: 'bg-indigo-100 text-indigo-800',
      system: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const paginatedAlerts = alerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(alerts.length / itemsPerPage);

  return (
    <AdminLayout
      title="Alerts & Notifications"
      subtitle="Actionable alerts requiring attention"
      activePath="/admin/reports/alerts"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="contract">Contract</option>
                <option value="project">Project</option>
                <option value="inventory">Inventory</option>
                <option value="user">User</option>
                <option value="tender">Tender</option>
                <option value="activity">Activity</option>
                <option value="employee">Employee</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {alerts.filter(a => a.status === 'open').length}
            </div>
            <div className="text-sm text-gray-500">Open Alerts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter(a => a.priority === 'critical' && a.status === 'open').length}
            </div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter(a => a.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-base">Alerts</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({alerts.length} total)
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No alerts found</td>
                  </tr>
                ) : (
                  paginatedAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                          {alert.priority_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {alert.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(alert.category)}`}>
                          {alert.category_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.assigned_to_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {alert.due_date ? formatDate(alert.due_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(alert.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          View
                        </button>
                        {alert.status === 'open' && (
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Dismiss
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedAlert.title}</h2>
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedAlert.priority)}`}>
                      {selectedAlert.priority_display}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedAlert.status)}`}>
                      {selectedAlert.status_display}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedAlert.category)}`}>
                      {selectedAlert.category_display}
                    </span>
                  </div>
                  <p className="text-gray-700">{selectedAlert.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Assigned To:</span>
                      <span className="ml-2 text-gray-900">{selectedAlert.assigned_to_name || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Due Date:</span>
                      <span className="ml-2 text-gray-900">{selectedAlert.due_date ? formatDate(selectedAlert.due_date) : '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reference:</span>
                      <span className="ml-2 text-gray-900">{selectedAlert.reference_id || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 text-gray-900">{formatDate(selectedAlert.created_at)}</span>
                    </div>
                  </div>
                  {selectedAlert.status === 'open' && (
                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add resolution notes..."
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleResolve(selectedAlert.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Mark as Resolved
                        </button>
                        <button
                          onClick={() => handleDismiss(selectedAlert.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

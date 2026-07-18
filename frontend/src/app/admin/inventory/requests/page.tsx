'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../../components/AdminLayout';
import { api } from '../../../../lib/api';

interface RequestItem {
  id: string;
  inventory_item: string;
  inventory_item_name: string;
  inventory_item_code: string;
  requested_quantity: number;
  approved_quantity: number;
  issued_quantity: number;
  remarks?: string;
}

interface MaterialRequest {
  id: string;
  request_number: string;
  project_reference: string;
  requested_by_name: string;
  status: string;
  remarks?: string;
  requested_at: string;
  approved_at?: string | null;
  items: RequestItem[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'ISSUED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function MaterialRequestsPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory/requests/');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Error fetching requests', response.status);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (statusFilter && request.status !== statusFilter) {
      return false;
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      return (
        request.request_number.toLowerCase().includes(lowerSearch) ||
        request.project_reference.toLowerCase().includes(lowerSearch) ||
        request.requested_by_name.toLowerCase().includes(lowerSearch)
      );
    }
    return true;
  });

  const counts = {
    pending: requests.filter((item) => item.status === 'PENDING').length,
    approved: requests.filter((item) => item.status === 'APPROVED').length,
    issued: requests.filter((item) => item.status === 'ISSUED').length,
    rejected: requests.filter((item) => item.status === 'REJECTED').length,
  };

  return (
    <AdminLayout
      title="Material Requests"
      subtitle="Track requested materials, approvals, and issuance"
      activePath="/admin/inventory/requests"
      onSearch={(query) => setSearch(query)}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Material Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Create, view, and manage inventory material requests.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/inventory/requests/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + New Request
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending', value: counts.pending, badge: 'bg-yellow-100 text-yellow-800' },
            { label: 'Approved', value: counts.approved, badge: 'bg-blue-100 text-blue-800' },
            { label: 'Issued', value: counts.issued, badge: 'bg-green-100 text-green-800' },
            { label: 'Rejected', value: counts.rejected, badge: 'bg-red-100 text-red-800' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${stat.badge}`}>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="ISSUED">Issued</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requests..."
                  className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No material requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-medium">Request No.</th>
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Requested By</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{request.request_number}</td>
                      <td className="px-6 py-4">{request.project_reference}</td>
                      <td className="px-6 py-4">{request.requested_by_name}</td>
                      <td className="px-6 py-4">{new Date(request.requested_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(request.status)}`}>
                          {request.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/inventory/requests/${request.id}`}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

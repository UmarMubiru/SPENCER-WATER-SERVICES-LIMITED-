'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminLayout } from '../../../components/AdminLayout';
import { api } from '../../../../../lib/api';

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
  approved_by_name?: string | null;
  rejected_at?: string | null;
  rejected_by_name?: string | null;
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

export default function MaterialRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<MaterialRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/inventory/requests/${params.id}/`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        router.push('/admin/inventory/requests');
      }
    } catch (error) {
      console.error('Error fetching request:', error);
      router.push('/admin/inventory/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'issue') => {
    if (!request) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const response = await api.post(`/inventory/requests/${request.id}/${action}/`, {});
      if (response.ok) {
        await fetchRequest();
        setMessage(
          action === 'approve'
            ? 'Request approved.'
            : action === 'reject'
            ? 'Request rejected.'
            : 'Materials issued.'
        );
      } else {
        const data = await response.json();
        setMessage(data.error || 'Unable to complete the action.');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setMessage('Unable to complete the action.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Material Request"
        subtitle="Loading request details"
        activePath="/admin/inventory/requests"
      >
        <div className="p-6 text-center text-gray-500">Loading request details...</div>
      </AdminLayout>
    );
  }

  if (!request) {
    return (
      <AdminLayout
        title="Material Request"
        subtitle="Request not found"
        activePath="/admin/inventory/requests"
      >
        <div className="p-6 text-center text-gray-500">Request not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Material Request Details"
      subtitle={`Request ${request.request_number}`}
      activePath="/admin/inventory/requests"
    >
      <div className="p-6 space-y-6">
        {message && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            {message}
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 border-b border-gray-200 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{request.request_number}</h3>
              <p className="text-sm text-gray-500">{request.project_reference}</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusBadge(request.status)}`}>
              {request.status.toLowerCase().replace('_', ' ')}
            </span>
          </div>

          <div className="p-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Requested By</p>
              <p className="mt-2 font-semibold text-gray-900">{request.requested_by_name}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Requested At</p>
              <p className="mt-2 font-semibold text-gray-900">{new Date(request.requested_at).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Approved By</p>
              <p className="mt-2 font-semibold text-gray-900">
                {request.approved_by_name || 'Not approved yet'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Approved At</p>
              <p className="mt-2 font-semibold text-gray-900">
                {request.approved_at ? new Date(request.approved_at).toLocaleString() : 'Not approved yet'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Rejected By</p>
              <p className="mt-2 font-semibold text-gray-900">
                {request.rejected_by_name || 'Not rejected'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Rejected At</p>
              <p className="mt-2 font-semibold text-gray-900">
                {request.rejected_at ? new Date(request.rejected_at).toLocaleString() : 'Not rejected'}
              </p>
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900">Requested Materials</h4>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Approved</th>
                    <th className="px-4 py-3 font-medium">Issued</th>
                    <th className="px-4 py-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.inventory_item_name}</p>
                        <p className="text-xs text-gray-500">{item.inventory_item_code}</p>
                      </td>
                      <td className="px-4 py-3">{item.requested_quantity}</td>
                      <td className="px-4 py-3">{item.approved_quantity}</td>
                      <td className="px-4 py-3">{item.issued_quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{item.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Workflow</p>
                <p className="text-sm text-gray-500">Review the request status and take the next action where applicable.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {request.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      {actionLoading ? 'Processing...' : 'Approve Request'}
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
                    >
                      {actionLoading ? 'Processing...' : 'Reject Request'}
                    </button>
                  </>
                )}
                {request.status === 'APPROVED' && (
                  <button
                    onClick={() => handleAction('issue')}
                    disabled={actionLoading}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-green-300"
                  >
                    {actionLoading ? 'Processing...' : 'Issue Materials'}
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Print Request
                </button>
                <button
                  onClick={() => router.push('/admin/inventory/requests')}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back to Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

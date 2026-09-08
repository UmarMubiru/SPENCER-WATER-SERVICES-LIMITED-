'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface MaterialRequestItem {
  id: string;
  inventory_item: string;
  inventory_item_name: string;
  inventory_item_sku: string;
  inventory_item_type: string;
  quantity_requested: number;
  quantity_approved: number;
  quantity_issued: number;
  quantity_remaining: number;
  responsible_person: string;
  responsible_person_name: string;
  expected_return_date: string;
  actual_return_date: string;
  condition_at_issue: string;
  condition_at_return: string;
  return_notes: string;
}

interface MaterialRequest {
  id: string;
  request_number: string;
  project_id: string;
  project_name: string;
  status: string;
  items: MaterialRequestItem[];
}

export default function ToolReturnsPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MaterialRequestItem | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    quantity_returned: 0,
    condition_at_return: 'GOOD',
    return_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/material-requests/?status=APPROVED');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/material-request-items/${selectedItem.id}/return/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData),
      });

      if (response.ok) {
        setShowReturnModal(false);
        setReturnData({
          quantity_returned: 0,
          condition_at_return: 'GOOD',
          return_notes: '',
        });
        setSelectedItem(null);
        fetchRequests();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to return tool');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter requests that have company tool items with issued quantity > 0
  const requestsWithTools = requests.filter(req =>
    req.items.some(item =>
      item.inventory_item_type === 'COMPANY_TOOL' &&
      item.quantity_issued > 0
    )
  );

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/inventory" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Tool Returns"
            subtitle="Return company tools from material requests"
            onSearch={(q: string) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Material Requests with Issued Tools</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="divide-y">
                {requestsWithTools.map((request) => (
                  <div key={request.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.request_number}</h3>
                        <p className="text-sm text-gray-500">{request.project_name}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {request.status}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-500">
                          <tr>
                            <th className="p-3">Tool</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Issued</th>
                            <th className="p-3">Expected Return</th>
                            <th className="p-3">Condition</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {request.items
                            .filter(item => item.inventory_item_type === 'COMPANY_TOOL' && item.quantity_issued > 0)
                            .map((item) => (
                              <tr className="border-t" key={item.id}>
                                <td className="p-3 font-medium">{item.inventory_item_name}</td>
                                <td className="p-3 text-gray-500">{item.inventory_item_sku}</td>
                                <td className="p-3">{item.quantity_issued}</td>
                                <td className="p-3">
                                  {item.expected_return_date ? new Date(item.expected_return_date).toLocaleDateString() : '—'}
                                </td>
                                <td className="p-3">
                                  {item.condition_at_issue || '—'}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setReturnData({
                                        quantity_returned: item.quantity_issued,
                                        condition_at_return: 'GOOD',
                                        return_notes: '',
                                      });
                                      setShowReturnModal(true);
                                    }}
                                    className="text-blue-600 hover:underline"
                                  >
                                    Return
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {requestsWithTools.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No material requests with issued company tools found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReturnModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Return Tool</h3>
            <div className="space-y-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Tool: {selectedItem.inventory_item_name}</p>
                <p className="text-sm text-gray-600">SKU: {selectedItem.inventory_item_sku}</p>
                <p className="text-sm text-gray-600">Issued: {selectedItem.quantity_issued}</p>
                <p className="text-sm text-gray-600">Expected Return: {selectedItem.expected_return_date ? new Date(selectedItem.expected_return_date).toLocaleDateString() : 'N/A'}</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Return</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.quantity_issued}
                  value={returnData.quantity_returned}
                  onChange={(e) => setReturnData({ ...returnData, quantity_returned: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition at Return</label>
                <select
                  value={returnData.condition_at_return}
                  onChange={(e) => setReturnData({ ...returnData, condition_at_return: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                >
                  <option value="GOOD">Good</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Notes</label>
                <textarea
                  value={returnData.return_notes}
                  onChange={(e) => setReturnData({ ...returnData, return_notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Add any notes about the return..."
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnData({
                    quantity_returned: 0,
                    condition_at_return: 'GOOD',
                    return_notes: '',
                  });
                  setSelectedItem(null);
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Return Tool'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

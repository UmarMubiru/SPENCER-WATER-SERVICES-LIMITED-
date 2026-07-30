'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  is_active: boolean;
  category: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export default function InventoryItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [showJsonIds, setShowJsonIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
    fetchHistory();
  }, [params.id]);

  useEffect(() => {
    // refetch when pagination or search changes
    fetchHistory();
  }, [page, pageSize]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/inventory/items/${params.id}/`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      } else {
        alert('Item not found');
        router.push('/admin/inventory/dashboard');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      let url = `/inventory/item-history/?item=${params.id}&page=${page}&page_size=${pageSize}`;
      if (searchQuery && searchQuery.length > 0) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      const resp = await api.get(url);
      if (resp.ok) {
        const d = await resp.json();
        if (d && d.results) {
          setHistory(d.results);
          setTotalCount(d.count ?? null);
        } else if (Array.isArray(d)) {
          setHistory(d);
          setTotalCount(d.length);
        }
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setDeleting(true);
    try {
      const response = await api.delete(`/inventory/items/${params.id}/`);
      if (response.ok) {
        router.push('/admin/inventory/dashboard');
      } else {
        alert('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/inventory/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/inventory/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Item not found</p>
        </div>
      </div>
    );
  }

  const stockStatus = item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock';
  const statusColor = item.quantity <= item.reorder_level ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/inventory/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Inventory Item Details"
          subtitle={`View and manage ${item.name}`}
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/inventory/edit/${item.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <Link
                    href="/admin/inventory/dashboard"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Item Code</p>
                  <p className="text-lg font-semibold text-gray-900">{item.item_code}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{item.category_name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{item.quantity} {item.unit}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {stockStatus}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Reorder Level</p>
                  <p className="text-lg font-semibold text-gray-900">{item.reorder_level} {item.unit}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Unit Cost</p>
                  <p className="text-lg font-semibold text-gray-900">UGX {Number(item.unit_cost).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Active</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {item.is_active ? 'Yes' : 'No'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {item.description && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Change History</h3>
                <div className="mb-3 flex items-center gap-3">
                  <input
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-2 border rounded-lg w-64"
                  />
                  <button
                    onClick={() => { setPage(1); fetchHistory(); }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Search
                  </button>
                  <div className="ml-auto text-sm text-gray-500">{totalCount !== null ? `${totalCount} entries` : ''}</div>
                </div>

                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">No history available for this item.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{h.summary ?? h.field_name}</p>
                            <p className="text-xs text-gray-500">By: {h.changed_by_name ?? 'system'} · {new Date(h.created_at).toLocaleString()}</p>
                            {h.action === 'DELETE' || h.field_name === '__deleted__' ? (
                              <div className="mt-2">
                                <button
                                  onClick={() => setShowJsonIds(prev => ({...prev, [h.id]: !prev[h.id]}))}
                                  className="px-2 py-1 text-xs bg-gray-200 rounded"
                                >
                                  {showJsonIds[h.id] ? 'Hide JSON' : 'Show JSON'}
                                </button>
                                {showJsonIds[h.id] && (
                                  <pre className="mt-2 p-2 bg-white border rounded text-xs overflow-auto">{(() => {
                                    try {
                                      const parsed = JSON.parse(h.old_value ?? h.new_value ?? '{}');
                                      return JSON.stringify(parsed, null, 2);
                                    } catch (e) {
                                      return h.old_value ?? h.new_value ?? '';
                                    }
                                  })()}</pre>
                                )}
                              </div>
                            ) : null}
                          </div>
                          <div>
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">{h.action}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Pagination controls */}
                {totalCount !== null && totalCount > pageSize && (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => { if (page > 1) setPage(page - 1); }}
                      className="px-3 py-1 bg-gray-200 rounded"
                      disabled={page <= 1}
                    >Prev</button>
                    <div className="text-sm text-gray-600">Page {page} • Showing {pageSize} per page</div>
                    <button
                      onClick={() => { setPage(page + 1); }}
                      className="px-3 py-1 bg-gray-200 rounded"
                      disabled={page * pageSize >= (totalCount ?? 0)}
                    >Next</button>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-auto border rounded px-2 py-1 text-sm">
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

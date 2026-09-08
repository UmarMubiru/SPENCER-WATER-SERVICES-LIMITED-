'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/items/${params.id}/`);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/items/${params.id}/`, {
        method: 'DELETE',
      });
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
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Inventory Item Details"
            subtitle={`View and manage ${item.name}`}
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

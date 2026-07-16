'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';

export default function AddMovementPage() {
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: 'purchase' as const,
    quantity: 0,
    reference_type: '',
    reference: '',
    notes: '',
  });
  const [items, setItems] = useState<Array<{ id: string; name: string; item_code: string; quantity: number }>>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/items/');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/movements/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Movement added successfully!');
        window.location.href = '/admin/inventory/movements';
      } else {
        alert('Error adding movement');
      }
    } catch (error) {
      console.error('Error adding movement:', error);
      alert('Error adding movement');
    }
  };

  return (
    <AdminLayout
      title="Add Stock Movement"
      subtitle="Record a new inventory movement"
      activePath="/admin/inventory/movements"
      onSearch={() => {}}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/admin/inventory/movements"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Stock Movements
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Movement Information</h2>
            <p className="text-blue-100 text-sm">Fill in the details below to record a new stock movement</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Item and Movement Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Movement Details</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item *</label>
                  <select
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select item</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.item_code} - {item.name} (Current: {item.quantity})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Movement Type *</label>
                  <select
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value as any })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="initial_stock">Initial Stock</option>
                    <option value="purchase">Purchase</option>
                    <option value="issue">Issue</option>
                    <option value="return">Return</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                    placeholder="Enter quantity (use positive for additions, negative for subtractions)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use positive for additions, negative for subtractions</p>
                </div>
              </div>

              {/* Reference Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Reference Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Type</label>
                    <input
                      type="text"
                      value={formData.reference_type}
                      onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
                      placeholder="e.g., PO#, MR#, ADJ#"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Number</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="e.g., PO-2024-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Additional notes about this movement..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Link
                href="/admin/inventory/movements"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
              >
                Add Movement
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

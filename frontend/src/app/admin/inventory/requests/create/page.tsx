"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '../../../components/AdminLayout';
import { api } from '../../../../../lib/api';

interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  unit: string;
}

interface RequestRow {
  inventory_item: string;
  requested_quantity: number;
  remarks: string;
}

export default function CreateMaterialRequestPage() {
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    request_number: '',
    project_reference: '',
    remarks: '',
    items: [{ inventory_item: '', requested_quantity: 1, remarks: '' } as RequestRow],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await api.get('/inventory/items/');
      if (response.ok) {
        const data = await response.json();
        setInventoryItems(data);
      }
    } catch (fetchError) {
      console.error('Error loading inventory items:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const updateItemField = (index: number, field: keyof RequestRow, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItemRow = () => {
    setFormState((prev) => ({
      ...prev,
      items: [...prev.items, { inventory_item: '', requested_quantity: 1, remarks: '' }],
    }));
  };

  const removeItemRow = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formState.request_number.trim() || !formState.project_reference.trim()) {
      setError('Request number and project reference are required.');
      setSubmitting(false);
      return;
    }

    if (formState.items.length === 0 || formState.items.some((item) => !item.inventory_item)) {
      setError('At least one requested item must be selected.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/inventory/requests/', {
        request_number: formState.request_number,
        project_reference: formState.project_reference,
        remarks: formState.remarks,
        items: formState.items.map((item) => ({
          inventory_item: item.inventory_item,
          requested_quantity: Number(item.requested_quantity),
          remarks: item.remarks,
        })),
      });

      if (response.ok) {
        router.push('/admin/inventory/requests');
      } else {
        const data = await response.json();
        const details = data.detail || JSON.stringify(data);
        setError(`Unable to submit request: ${details}`);
      }
    } catch (submitError) {
      console.error('Error submitting request:', submitError);
      setError('Unable to submit the material request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Create Material Request"
      subtitle="Submit a new inventory request for approval"
      activePath="/admin/inventory/requests"
    >
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">New Material Request</h3>
                <p className="text-sm text-gray-500">Enter request details and list the items required.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/admin/inventory/requests')}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="request-form"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>

          <form id="request-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Number</label>
                <input
                  value={formState.request_number}
                  onChange={(e) => updateField('request_number', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="e.g. MR-2026-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Reference</label>
                <input
                  value={formState.project_reference}
                  onChange={(e) => updateField('project_reference', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="Project name or code"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes / Remarks</label>
              <textarea
                value={formState.remarks}
                onChange={(e) => updateField('remarks', e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                rows={4}
                placeholder="Optional notes for the approver"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Requested Items</h4>
                  <p className="text-sm text-gray-500">Add one or more inventory items to the material request.</p>
                </div>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formState.items.map((item, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="grid gap-4 lg:grid-cols-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Inventory Item</label>
                        <select
                          value={item.inventory_item}
                          onChange={(e) => updateItemField(index, 'inventory_item', e.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select item</option>
                          {inventoryItems.map((inventoryItem) => (
                            <option key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.item_code} — {inventoryItem.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.requested_quantity}
                          onChange={(e) => updateItemField(index, 'requested_quantity', Number(e.target.value))}
                          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Item Notes</label>
                        <input
                          value={item.remarks}
                          onChange={(e) => updateItemField(index, 'remarks', e.target.value)}
                          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          placeholder="Optional remarks"
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';

const SERVICE_OPTIONS = [
  { id: 'borehole_drilling', label: 'Borehole Drilling' },
  { id: 'solar_pump_installation', label: 'Solar Pump Installation' },
  { id: 'water_treatment', label: 'Water Treatment' },
  { id: 'pipeline_extension', label: 'Pipeline Extension' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'water_storage', label: 'Water Storage' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'tank_installation', label: 'Tank Installation' },
  { id: 'other', label: 'Other' },
];

const UNIT_OPTIONS = [
  { id: 'each', label: 'Each' },
  { id: 'meter', label: 'Meter' },
  { id: 'square_meter', label: 'Square Meter' },
  { id: 'cubic_meter', label: 'Cubic Meter' },
  { id: 'hour', label: 'Hour' },
  { id: 'day', label: 'Day' },
  { id: 'kg', label: 'Kilogram' },
  { id: 'ton', label: 'Ton' },
  { id: 'liter', label: 'Liter' },
  { id: 'set', label: 'Set' },
];

interface TemplateItem {
  description: string;
  unit: string;
  default_quantity: number;
  default_rate: number;
  vat_percentage: number;
  discount_percentage: number;
  is_optional: boolean;
}

export default function NewQuotationTemplatePage() {
  const [templateForm, setTemplateForm] = useState({
    name: '',
    service: '',
    description: '',
    header: '',
    terms: '',
    footer: '',
    validity_days: 30,
    payment_terms: '',
  });

  const [items, setItems] = useState<TemplateItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        unit: 'each',
        default_quantity: 1,
        default_rate: 0,
        vat_percentage: 18,
        discount_percentage: 0,
        is_optional: false,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof TemplateItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotation-templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          items,
        }),
      });

      if (response.ok) {
        alert('Template created successfully!');
        window.location.href = '/admin/quotations/templates';
      } else {
        alert('Error creating template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Create Quotation Template"
      subtitle="Create a new quotation template"
      activePath="/admin/quotations/templates"
      onSearch={() => {}}
    >
      <div className="p-6 max-w-4xl">
        <Link
          href="/admin/quotations/templates"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Templates
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name *</label>
                <input
                  type="text"
                  required
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., Standard Borehole Installation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                <select
                  required
                  value={templateForm.service}
                  onChange={(e) => setTemplateForm({ ...templateForm, service: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select service</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of when to use this template"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Days *</label>
                <input
                  type="number"
                  required
                  value={templateForm.validity_days}
                  onChange={(e) => setTemplateForm({ ...templateForm, validity_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header</label>
                <textarea
                  value={templateForm.header}
                  onChange={(e) => setTemplateForm({ ...templateForm, header: e.target.value })}
                  rows={3}
                  placeholder="Header text for the quotation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <textarea
                  value={templateForm.terms}
                  onChange={(e) => setTemplateForm({ ...templateForm, terms: e.target.value })}
                  rows={4}
                  placeholder="Terms and conditions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <textarea
                  value={templateForm.payment_terms}
                  onChange={(e) => setTemplateForm({ ...templateForm, payment_terms: e.target.value })}
                  rows={3}
                  placeholder="Payment terms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer</label>
                <textarea
                  value={templateForm.footer}
                  onChange={(e) => setTemplateForm({ ...templateForm, footer: e.target.value })}
                  rows={2}
                  placeholder="Footer text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                        <select
                          required
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {UNIT_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Quantity *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={item.default_quantity}
                          onChange={(e) => updateItem(index, 'default_quantity', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Rate (UGX) *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={item.default_rate}
                          onChange={(e) => updateItem(index, 'default_rate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VAT % *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={item.vat_percentage}
                          onChange={(e) => updateItem(index, 'vat_percentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.discount_percentage}
                          onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_optional}
                            onChange={(e) => updateItem(index, 'is_optional', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Optional Item</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/admin/quotations/templates"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

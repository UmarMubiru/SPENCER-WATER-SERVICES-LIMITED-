'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface QuotationTemplate {
  id: string;
  name: string;
  service: string;
  description?: string;
  validity_days: number;
  created_at: string;
  updated_at: string;
  items: QuotationTemplateItem[];
}

interface QuotationTemplateItem {
  id: string;
  description: string;
  unit: string;
  default_quantity: number;
  default_rate: number;
  vat_percentage: number;
  discount_percentage: number;
  is_optional: boolean;
}

const SERVICE_LABELS: { [key: string]: string } = {
  borehole_drilling: 'Borehole Drilling',
  solar_pump_installation: 'Solar Pump Installation',
  water_treatment: 'Water Treatment',
  pipeline_extension: 'Pipeline Extension',
  plumbing: 'Plumbing',
  water_storage: 'Water Storage',
  maintenance: 'Maintenance',
  tank_installation: 'Tank Installation',
  other: 'Other',
};

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotation-templates/');
      if (response.ok) {
        const data = await response.json();
        setTemplates(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotation-templates/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        alert('Error deleting template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  return (
    <AdminLayout
      title="Quotation Templates"
      subtitle="Manage quotation templates for different services"
      activePath="/admin/quotations/templates"
      onSearch={() => {}}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
          <Link
            href="/admin/quotations/templates/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Template
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No quotation templates found.</p>
            <p className="text-sm mt-2">Create a template to streamline quotation generation.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{SERVICE_LABELS[template.service] || template.service}</p>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{template.items.length} items</span>
                      <span>Valid for {template.validity_days} days</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/admin/quotations/templates/${template.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

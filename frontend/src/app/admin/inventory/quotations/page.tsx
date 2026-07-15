'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface QuotationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  whatsapp: string;
  is_active?: boolean;
}

interface QuotationItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price?: number;
}

export default function QuotationsPage() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const templatesRes = await fetch('http://127.0.0.1:8000/api/inventory/quotation-templates/');
      if (templatesRes.ok) setTemplates(await templatesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/inventory/quotation-templates/${id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchData();
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
      title="Quotations"
      subtitle="Manage quotation templates and send to suppliers"
      activePath="/admin/inventory/quotations"
      onSearch={(q) => console.log('Search quotations:', q)}
    >
      <div className="p-6">
        {/* Templates */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Quotation Templates</h3>
              <Link
                href="/admin/inventory/quotations/create-template"
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
                <p className="text-sm mt-2">Create a template to get started with sending quotations.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{template.body}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Created: {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
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
        </div>
      </div>
    </AdminLayout>
  );
}

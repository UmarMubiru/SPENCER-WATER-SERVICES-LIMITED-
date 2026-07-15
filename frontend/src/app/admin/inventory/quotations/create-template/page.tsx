'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';

export default function CreateTemplatePage() {
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/inventory/quotation-templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      });
      
      if (response.ok) {
        alert('Template created successfully!');
        window.location.href = '/admin/inventory/quotations';
      } else {
        alert('Error creating template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template');
    }
  };

  return (
    <AdminLayout
      title="Create Quotation Template"
      subtitle="Create a new quotation template"
      activePath="/admin/inventory/quotations"
      onSearch={() => {}}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/admin/inventory/quotations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Quotations
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Template Information</h2>
            <p className="text-blue-100 text-sm">Fill in the details below to create a new quotation template</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Template Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Template Details</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                    placeholder="e.g., Standard Purchase Request"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Line *</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    required
                    placeholder="e.g., Purchase Request for {{items}}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template Body *</label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    required
                    rows={8}
                    placeholder="Dear {{contact_person}}, We would like to request a quotation for the following items: {{items}} Please provide your best prices by {{date}}. Thank you, {{supplier_name}}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available placeholders: {`{{supplier_name}}`}, {`{{contact_person}}`}, {`{{date}}`}, {`{{items}}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Link
                href="/admin/inventory/quotations"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
              >
                Create Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

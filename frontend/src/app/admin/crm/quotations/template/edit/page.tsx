'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../../../../components/admin/ui/PageHeader';

export default function EditTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    name: 'Standard Quotation Email',
    subject: 'Quotation for Water Services from Spencer Water Services Ltd',
    body: `Dear {{customer_name}},

Thank you for your interest in our water services. Please find below the quotation for the requested services:

{{items}}

If you have any questions or would like to discuss this further, please feel free to contact us.

Best regards,
Spencer Water Services Ltd
Phone: +256 700 123 456
Email: info@spencerwaterservices.co.ug`,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // For now, just save to localStorage since backend doesn't have email templates
      localStorage.setItem('quotationEmailTemplate', JSON.stringify(templateForm));
      alert('Template saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Edit Quotation Template"
      subtitle="Customize the email template for sending quotations"
      activePath="/admin/crm/quotations"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8">
        <PageHeader
          title="Edit Quotation Template"
          description="Customize the email template for sending quotations"
        />

        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="p-6">
            <form onSubmit={handleSave}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                    placeholder="e.g., Standard Service Quotation"
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    required
                    placeholder="e.g., Quotation for Water Services"
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Template Body
                  </label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    required
                    rows={12}
                    placeholder="Dear {{customer_name}}, We are pleased to provide this quotation for the following services: {{items}} Please let us know if you have any questions. Thank you, Spencer Water Services"
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm font-medium text-blue-900 mb-2">Available Placeholders:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><code className="bg-blue-100 px-1 rounded">{"{{customer_name}}"}</code> - Customer's name</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{company_name}}"}</code> - Customer's company</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{date}}"}</code> - Current date</li>
                      <li><code className="bg-blue-100 px-1 rounded">{"{{items}}"}</code> - List of quotation items</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:from-blue-400 disabled:to-blue-500"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-blue-900">Template Preview</h4>
              <p className="text-sm text-blue-800 mt-1">
                This template is used when sending quotations via email. The placeholders will be replaced with actual customer data when the quotation is sent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

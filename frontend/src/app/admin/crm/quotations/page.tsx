'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import Link from 'next/link';

interface Quotation {
  id: string;
  quotation_number: string;
  lead_customer_name?: string;
  lead_company?: string;
  customer_name_snapshot?: string;
  company_snapshot?: string;
  status: string;
  grand_total: number;
  created_at: string;
  valid_until?: string;
}

interface QuotationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: { [key: string]: string } = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
  accepted: 'Accepted',
};

const STATUS_COLORS: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  accepted: 'bg-blue-100 text-blue-800',
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotationsRes, templatesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/quotations/quotations/'),
        fetch('http://127.0.0.1:8000/api/quotations/quotation-templates/'),
      ]);

      if (quotationsRes.ok) {
        const data = await quotationsRes.json();
        setQuotations(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotation-templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      });

      if (response.ok) {
        setShowTemplateModal(false);
        setTemplateForm({ name: '', subject: '', body: '' });
        fetchData();
      } else {
        alert('Error creating template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error creating template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotation-templates/${id}/`, {
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

  const filteredQuotations = quotations.filter((quotation) => {
    const customerName = quotation.customer_name_snapshot || quotation.lead_customer_name || '';
    const companyName = quotation.company_snapshot || quotation.lead_company || '';

    const matchesSearch =
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex">
      <Sidebar activePath="/admin/crm/quotations" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Quotations"
            subtitle="Manage customer quotations"
            onSearch={(q: string) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 md:w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showTemplates ? 'Hide Templates' : 'Manage Templates'}
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Create Template
              </button>
              <Link
                href="/admin/quotations/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Create Quotation
              </Link>
            </div>
          </div>

          {/* Templates Section - Collapsible */}
          {showTemplates && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-white shadow-sm">
              <div className="border-b border-blue-100 p-5">
                <h3 className="font-semibold text-blue-900">Quotation Templates</h3>
              </div>

              <div className="p-5">
                {templates.length === 0 ? (
                  <div className="text-center text-blue-400 py-8">
                    <p>No quotation templates found.</p>
                    <p className="text-sm mt-2">Create a template to get started with sending quotations.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900">{template.name}</h4>
                            <p className="text-sm text-blue-600 mt-1">{template.subject}</p>
                            <p className="text-sm text-blue-900 mt-2 line-clamp-2">{template.body}</p>
                            <p className="text-xs text-blue-400 mt-2">
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
          )}

          {/* Quotations Table */}
          {loading ? (
            <div className="text-center text-gray-500">Loading quotations...</div>
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No quotations found.</p>
              <p className="text-sm mt-2">Create a quotation to get started.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quotation #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valid Until
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {quotation.quotation_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{quotation.customer_name_snapshot || quotation.lead_customer_name || 'N/A'}</div>
                          {(quotation.company_snapshot || quotation.lead_company) && (
                            <div className="text-xs text-gray-500">{quotation.company_snapshot || quotation.lead_company}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[quotation.status] || 'bg-gray-100 text-gray-800'}`}>
                            {STATUS_LABELS[quotation.status] || quotation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          UGX {quotation.grand_total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quotation.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/admin/quotations/${quotation.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">Create Quotation Template</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                    placeholder="e.g., Standard Service Quotation"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    required
                    placeholder="e.g., Quotation for Water Services"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Template Body</label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    required
                    rows={8}
                    placeholder="Dear {{customer_name}}, We are pleased to provide this quotation for the following services: {{items}} Please let us know if you have any questions. Thank you, Spencer Water Services"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-blue-400 mt-1">
                    Available placeholders: {`{{customer_name}}`}, {`{{company_name}}`}, {`{{date}}`}, {`{{items}}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-900 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

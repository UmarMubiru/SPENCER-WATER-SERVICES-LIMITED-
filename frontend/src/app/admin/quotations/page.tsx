'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotations/');
      if (response.ok) {
        const data = await response.json();
        setQuotations(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
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
    <AdminLayout
      title="Quotations"
      subtitle="Manage customer quotations"
      activePath="/admin/quotations"
    >
      <div className="p-6">
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
          <Link
            href="/admin/quotations/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Quotation
          </Link>
        </div>

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
    </AdminLayout>
  );
}

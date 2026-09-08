'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lead {
  id: string;
  lead_number: string;
  customer_name: string;
  service: string;
  status: string;
  description: string;
  created_at: string;
}

interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  grand_total: number;
  created_at: string;
}

export default function CustomerDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      // Fetch customer's leads and quotations (public access)
      const leadsResponse = await fetch('http://127.0.0.1:8000/api/quotations/leads/');

      if (leadsResponse.ok) {
        const data = await leadsResponse.json();
        setLeads(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
        if (data.results?.[0]?.customer_name) {
          setCustomerName(data.results[0].customer_name);
        }
      }

      const quotationsResponse = await fetch('http://127.0.0.1:8000/api/quotations/quotations/');

      if (quotationsResponse.ok) {
        const data = await quotationsResponse.json();
        setQuotations(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'site_visit': 'bg-purple-100 text-purple-800',
      'estimating': 'bg-orange-100 text-orange-800',
      'quotation': 'bg-indigo-100 text-indigo-800',
      'negotiation': 'bg-pink-100 text-pink-800',
      'won': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'sent': 'bg-indigo-100 text-indigo-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'revision': 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                <span className="text-xl">💧</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
                <p className="text-sm text-gray-600">Spencer Water Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {customerName || 'Guest'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/quotation" className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">New Quotation Request</h3>
                <p className="text-sm text-gray-600">Request a new quotation</p>
              </div>
            </div>
          </Link>

          <Link href="/portal/quotations" className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Quotations</h3>
                <p className="text-sm text-gray-600">View all quotations</p>
              </div>
            </div>
          </Link>

          <Link href="/portal/projects" className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Projects</h3>
                <p className="text-sm text-gray-600">Track project progress</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Leads</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-green-600">{quotations.length}</div>
            <div className="text-sm text-gray-600 mt-1">Quotations</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-purple-600">
              {quotations.filter(q => q.status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Accepted</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-3xl font-bold text-orange-600">
              {quotations.filter(q => q.status === 'pending' || q.status === 'sent').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending Review</div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No leads found. <Link href="/quotation" className="text-blue-600 hover:text-blue-700">Request a quotation</Link> to get started.
              </div>
            ) : (
              leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{lead.lead_number}</div>
                    <div className="text-sm text-gray-600">{lead.service}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Quotations</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {quotations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No quotations yet. Quotations will appear here after your leads are processed.
              </div>
            ) : (
              quotations.slice(0, 5).map((quotation) => (
                <div key={quotation.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{quotation.quotation_number}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(quotation.grand_total)}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                      {quotation.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(quotation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

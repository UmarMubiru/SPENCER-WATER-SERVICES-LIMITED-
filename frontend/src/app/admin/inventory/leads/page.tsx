'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardCard from '../../../../components/admin/ui/DashboardCard';
import { Users, TrendingUp, Clock, CheckCircle, AlertCircle, Filter, Plus, ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Lead {
  id: string;
  lead_number: string;
  customer_name: string;
  company?: string;
  phone: string;
  email: string;
  district?: string;
  service: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const STATUSES = [
  { id: 'new', label: 'New', color: 'blue' },
  { id: 'contacted', label: 'Contacted', color: 'amber' },
  { id: 'qualified', label: 'Qualified', color: 'cyan' },
  { id: 'site_visit', label: 'Site Visit', color: 'purple' },
  { id: 'estimating', label: 'Estimating', color: 'indigo' },
  { id: 'quotation', label: 'Quotation', color: 'green' },
  { id: 'negotiation', label: 'Negotiation', color: 'orange' },
  { id: 'won', label: 'Won', color: 'green' },
  { id: 'lost', label: 'Lost', color: 'red' },
];

const SERVICE_LABELS: { [key: string]: string } = {
  borehole_drilling: 'Borehole Drilling',
  solar_pump_installation: 'Solar Pump Installation',
  water_treatment: 'Water Treatment',
  pipeline_extension: 'Pipeline Extension',
  plumbing: 'Plumbing',
  water_storage: 'Water Storage',
  maintenance: 'Maintenance',
  water_taps_accessories: 'Water Taps & Accessories',
  other: 'Other',
};

export default function InventoryLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchLeads = async () => {
    try {
      let url = 'http://127.0.0.1:8000/api/quotations/leads/?service=water_taps_accessories';
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.lead_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/update_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchLeads();
      } else {
        alert('Error updating lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = STATUSES.find(s => s.id === status);
    return statusConfig?.color || 'gray';
  };

  const stats = [
    { label: "Today's Leads", value: leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length, icon: Users, tint: 'from-blue-600 to-blue-700' },
    { label: 'Open Leads', value: leads.filter(l => !['won', 'lost'].includes(l.status)).length, icon: Clock, tint: 'from-sky-500 to-blue-600' },
    { label: 'Pending Quotations', value: leads.filter(l => ['estimating', 'quotation'].includes(l.status)).length, icon: TrendingUp, tint: 'from-blue-400 to-blue-600' },
    { label: 'Won', value: leads.filter(l => l.status === 'won').length, icon: CheckCircle, tint: 'from-blue-800 to-blue-950' },
    { label: 'Lost', value: leads.filter(l => l.status === 'lost').length, icon: AlertCircle, tint: 'from-blue-600 to-blue-700' },
  ];

  const conversionRate = leads.length > 0 
    ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100) 
    : 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/inventory" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Link>
        <Link 
          href="/quotation?service=water_taps_accessories" 
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Lead
        </Link>
      </div>

      {/* Service Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Filter className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-1">Water Taps & Accessories Service</h3>
            <p className="text-sm text-blue-700 mb-2">Showing only leads for water taps and accessories inventory items.</p>
            <div className="flex items-center gap-4 text-xs text-blue-600">
              <span className="bg-blue-100 px-2 py-1 rounded">Service: water_taps_accessories</span>
              <span className="bg-blue-100 px-2 py-1 rounded">Scope: Inventory Sales</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <DashboardCard
            key={index}
            label={stat.label}
            value={stat.value.toString()}
            icon={stat.icon}
            tint={stat.tint}
          />
        ))}
        <DashboardCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          tint="from-blue-400 to-blue-600"
        />
      </div>

      {/* Search and Filter */}
      <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search leads, customer or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchLeads(); }}
            className="px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status.id} value={status.id}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 p-5">
          <h3 className="font-semibold text-blue-900">Water Taps & Accessories Leads</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-blue-400">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'No leads match your search criteria.' : 'No water taps & accessories leads available.'}
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            <div className="border-b border-blue-100 px-5 py-3 flex items-center justify-between bg-blue-50">
              <span className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
              </span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Page:</label>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <option key={pageNum} value={pageNum}>Page {pageNum}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="min-w-full">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-5 py-3 text-left text-blue-700">Lead #</th>
                  <th className="px-5 py-3 text-left text-blue-700">Customer</th>
                  <th className="px-5 py-3 text-left text-blue-700">Company</th>
                  <th className="px-5 py-3 text-left text-blue-700">Service</th>
                  <th className="px-5 py-3 text-left text-blue-700">Location</th>
                  <th className="px-5 py-3 text-left text-blue-700">Status</th>
                  <th className="px-5 py-3 text-left text-blue-700">Created</th>
                  <th className="px-5 py-3 text-left text-blue-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-blue-50">
                    <td className="px-5 py-4 text-blue-900">{lead.lead_number}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-blue-900">{lead.customer_name}</p>
                        <p className="text-sm text-blue-600">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-blue-900">{lead.company || '-'}</td>
                    <td className="px-5 py-4 text-blue-900">{SERVICE_LABELS[lead.service] || lead.service}</td>
                    <td className="px-5 py-4 text-blue-900">{lead.district || '-'}</td>
                    <td className="px-5 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                        className="px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer bg-blue-100 text-blue-700"
                      >
                        {STATUSES.map(status => (
                          <option key={status.id} value={status.id}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-blue-900">{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

interface Lead {
  id: string;
  customer_name: string;
  company_name?: string;
  source: 'WEBSITE' | 'MANUAL';
  stage: 'NEW' | 'CONTACTED' | 'SITE_VISIT_SCHEDULED' | 'QUOTED' | 'NEGOTIATION' | 'WON' | 'LOST';
  assigned_to?: string;
  estimated_value?: number;
  created_at: string;
  closed_at?: string;
}

interface CustomerProfile {
  id: string;
  full_name: string;
  company_name?: string;
  phone: string;
  email?: string;
  location?: string;
}

const STAGES = [
  { id: 'NEW', label: 'New', color: 'blue' },
  { id: 'CONTACTED', label: 'Contacted', color: 'amber' },
  { id: 'SITE_VISIT_SCHEDULED', label: 'Site Visit', color: 'purple' },
  { id: 'QUOTED', label: 'Quoted', color: 'green' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'orange' },
  { id: 'WON', label: 'Won', color: 'green' },
  { id: 'LOST', label: 'Lost', color: 'red' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    source: 'MANUAL' as const,
    stage: 'NEW' as const,
    assigned_to: '',
    estimated_value: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsRes, customersRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/crm/leads/'),
        fetch('http://127.0.0.1:8000/api/crm/customers/'),
      ]);
      
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/crm/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ customer_id: '', source: 'MANUAL', stage: 'NEW', assigned_to: '', estimated_value: '' });
        fetchData();
      } else {
        alert('Error creating lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Error creating lead');
    }
  };

  const handleStageChange = async (lead: Lead, newStage: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/crm/leads/${lead.id}/advance-stage/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_stage: newStage }),
      });
      
      if (response.ok) {
        fetchData();
      } else {
        alert('Error updating lead stage');
      }
    } catch (error) {
      console.error('Error updating lead stage:', error);
      alert('Error updating lead stage');
    }
  };

  const openDetailModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => lead.stage === stage);
  };

  const getStageColor = (stage: string) => {
    const stageConfig = STAGES.find(s => s.id === stage);
    return stageConfig?.color || 'gray';
  };

  const stats = [
    { label: 'Total Leads', value: leads.length, color: 'blue' },
    { label: 'Active Pipeline', value: leads.filter(l => !['WON', 'LOST'].includes(l.stage)).length, color: 'green' },
    { label: 'Won', value: leads.filter(l => l.stage === 'WON').length, color: 'green' },
    { label: 'Lost', value: leads.filter(l => l.stage === 'LOST').length, color: 'red' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/crm/leads" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Leads Pipeline"
          subtitle="Manage sales pipeline and lead stages"
          onSearch={(q) => console.log('Search leads:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                red: { bg: 'bg-red-50', valueColor: 'text-red-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create Lead
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Board</h2>
              <p className="text-sm text-gray-600">Drag leads between stages to advance pipeline</p>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading leads...</div>
            ) : (
              <div className="p-6 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {STAGES.map((stage) => (
                    <div key={stage.id} className="w-72 flex-shrink-0">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${stage.color}-100 text-${stage.color}-700`}>
                            {getLeadsByStage(stage.id).length}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {getLeadsByStage(stage.id).map((lead) => (
                          <div
                            key={lead.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openDetailModal(lead)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{lead.customer_name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium bg-${getStageColor(lead.stage)}-100 text-${getStageColor(lead.stage)}-700`}>
                                {lead.source}
                              </span>
                            </div>
                            {lead.company_name && (
                              <p className="text-sm text-gray-600 mb-2">{lead.company_name}</p>
                            )}
                            {lead.estimated_value && (
                              <p className="text-sm font-medium text-gray-900 mb-2">
                                UGX {parseInt(String(lead.estimated_value)).toLocaleString()}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                              {lead.assigned_to && (
                                <span>→ {lead.assigned_to}</span>
                              )}
                            </div>
                            
                            {/* Stage advancement buttons */}
                            {stage.id !== 'WON' && stage.id !== 'LOST' && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <select
                                  value={lead.stage}
                                  onChange={(e) => handleStageChange(lead, e.target.value)}
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {STAGES.filter(s => s.id !== lead.stage).map(s => (
                                    <option key={s.id} value={s.id}>Move to {s.label}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {getLeadsByStage(stage.id).length === 0 && (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm">
                            No leads
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Lead</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateLead}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name} {customer.company_name ? `(${customer.company_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MANUAL">Manually Created</option>
                    <option value="WEBSITE">Website Inquiry</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {STAGES.filter(s => s.id !== 'WON' && s.id !== 'LOST').map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="Staff member name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value (UGX)</label>
                  <input
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                    placeholder="e.g., 50000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-gray-900">{selectedLead.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-gray-900">{selectedLead.company_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <p className="text-gray-900">{selectedLead.source}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stage</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStageColor(selectedLead.stage)}-100 text-${getStageColor(selectedLead.stage)}-700`}>
                    {STAGES.find(s => s.id === selectedLead.stage)?.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Assigned To</p>
                  <p className="text-gray-900">{selectedLead.assigned_to || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Value</p>
                  <p className="text-gray-900">
                    {selectedLead.estimated_value ? `UGX ${parseInt(String(selectedLead.estimated_value)).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-gray-900">{new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Closed</p>
                  <p className="text-gray-900">{selectedLead.closed_at ? new Date(selectedLead.closed_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
                    View Activities
                  </button>
                  <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium">
                    Schedule Site Visit
                  </button>
                  <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium">
                    Create Quotation
                  </button>
                  <button className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-sm font-medium">
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

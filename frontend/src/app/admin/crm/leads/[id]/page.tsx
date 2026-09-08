'use client';

import React, { useState, useEffect, use } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';
import StatusBadge from '../../../../../components/admin/ui/StatusBadge';

interface Lead {
  id: string;
  lead_number: string;
  customer_name: string;
  company?: string;
  phone: string;
  email: string;
  preferred_contact?: string;
  district?: string;
  subcounty?: string;
  village?: string;
  address?: string;
  gps?: string;
  service: string;
  description: string;
  budget_range?: string;
  timeline?: string;
  source: string;
  status: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
}

interface LeadActivity {
  id: string;
  activity: string;
  description?: string;
  user_name?: string;
  timestamp: string;
}

interface LeadAttachment {
  id: string;
  file: string;
  uploaded_by_name?: string;
  created_at: string;
}

interface LeadQuotation {
  id: string;
  quotation_number: string;
  status: string;
  grand_total: number;
  created_at: string;
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
  other: 'Other',
};

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const leadId = unwrappedParams.id;
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [attachments, setAttachments] = useState<LeadAttachment[]>([]);
  const [quotations, setQuotations] = useState<LeadQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      const [leadRes, activitiesRes, attachmentsRes, quotationsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/`),
        fetch(`http://127.0.0.1:8000/api/quotations/lead-activities/?lead=${leadId}`),
        fetch(`http://127.0.0.1:8000/api/quotations/lead-attachments/?lead=${leadId}`),
        fetch(`http://127.0.0.1:8000/api/quotations/quotations/?lead=${leadId}`),
      ]);

      if (leadRes.ok) {
        const data = await leadRes.json();
        setLead(data);
      }
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
      if (attachmentsRes.ok) {
        const data = await attachmentsRes.json();
        setAttachments(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
      if (quotationsRes.ok) {
        const data = await quotationsRes.json();
        setQuotations(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/update_status/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchLeadDetails();
      } else {
        alert('Error updating lead status');
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/lead-activities/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: leadId,
          activity: 'note',
          description: newNote,
        }),
      });

      if (response.ok) {
        setNewNote('');
        fetchLeadDetails();
      } else {
        alert('Error adding note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'attachments', label: 'Attachments' },
  ];

  if (loading) {
    return (
      <AdminLayout
        title="Lead Details"
        subtitle="View lead information"
        activePath="/admin/crm/leads"
        onSearch={() => {}}
      >
        <div className="p-6 text-center text-gray-500">Loading...</div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout
        title="Lead Details"
        subtitle="View lead information"
        activePath="/admin/crm/leads"
        onSearch={() => {}}
      >
        <div className="p-6 text-center text-gray-500">Lead not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Lead ${lead.lead_number}`}
      subtitle={lead.customer_name}
      activePath="/admin/crm/leads"
      onSearch={() => {}}
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link 
            href="/admin/crm/leads" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to Leads
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/quotations/new?lead_id=${leadId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Create Quotation
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Lead Quotations</h3>
            <span className="text-sm text-blue-600">{quotations.length} found</span>
          </div>
          {quotations.length === 0 ? (
            <p className="text-blue-400">No quotations yet for this lead.</p>
          ) : (
            <div className="space-y-2">
              {quotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between border border-blue-100 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-medium text-blue-900">{quotation.quotation_number}</p>
                    <p className="text-sm text-blue-600">{quotation.status} • {Number(quotation.grand_total || 0).toLocaleString()} UGX</p>
                  </div>
                  <Link
                    href={`/admin/quotations/${quotation.id}`}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Open Full Editor
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-700 mb-1">Lead Status</label>
              <select
                value={lead.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              >
                {STATUSES.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-blue-100">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-blue-600 hover:text-blue-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Lead Number</p>
                  <p className="text-blue-900">{lead.lead_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Customer Name</p>
                  <p className="text-blue-900">{lead.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Company</p>
                  <p className="text-blue-900">{lead.company || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Phone</p>
                  <p className="text-blue-900">{lead.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Email</p>
                  <p className="text-blue-900">{lead.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Preferred Contact</p>
                  <p className="text-blue-900">{lead.preferred_contact || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Project Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">District</p>
                  <p className="text-blue-900">{lead.district || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Sub County</p>
                  <p className="text-blue-900">{lead.subcounty || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Village</p>
                  <p className="text-blue-900">{lead.village || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">GPS</p>
                  <p className="text-blue-900">{lead.gps || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-blue-600">Physical Address</p>
                  <p className="text-blue-900">{lead.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Service</p>
                  <p className="text-blue-900">{SERVICE_LABELS[lead.service] || lead.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Budget Range</p>
                  <p className="text-blue-900">{lead.budget_range || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Timeline</p>
                  <p className="text-blue-900">{lead.timeline || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Source</p>
                  <p className="text-blue-900">{lead.source}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-blue-600">Description</p>
                  <p className="text-blue-900">{lead.description}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Created</h3>
              <p className="text-blue-900">{new Date(lead.created_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Add Note</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter a note..."
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Activity History</h3>
              {activities.length === 0 ? (
                <p className="text-blue-400">No activities recorded</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-b border-blue-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900 capitalize">{activity.activity}</span>
                        <span className="text-sm text-blue-600">{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                      {activity.description && (
                        <p className="text-blue-900">{activity.description}</p>
                      )}
                      {activity.user_name && (
                        <p className="text-sm text-blue-600 mt-1">By {activity.user_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Attachments</h3>
            {attachments.length === 0 ? (
              <p className="text-blue-400">No attachments</p>
            ) : (
              <div className="space-y-4">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between border-b border-blue-100 pb-4">
                    <div>
                      <p className="font-medium text-blue-900">{attachment.file.split('/').pop()}</p>
                      <p className="text-sm text-blue-600">
                        Uploaded {new Date(attachment.created_at).toLocaleString()}
                        {attachment.uploaded_by_name && ` by ${attachment.uploaded_by_name}`}
                      </p>
                    </div>
                    <a
                      href={`http://127.0.0.1:8000${attachment.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import Link from 'next/link';

interface QuotationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  customer_name: string;
  company_name?: string;
  stage: string;
}

interface QuotationItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price?: number;
}

export default function QuotationsPage() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'send'>('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuotationTemplate | null>(null);
  
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: '',
  });
  
  const [sendForm, setSendForm] = useState({
    template_id: '',
    lead_id: '',
    items: [] as QuotationItem[],
    custom_message: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, leadsRes, servicesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/crm/quotation-templates/'),
        fetch('http://127.0.0.1:8000/api/crm/leads/'),
        fetch('http://127.0.0.1:8000/api/content/services/'),
      ]);
      
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/crm/quotation-templates/', {
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
      const response = await fetch(`http://127.0.0.1:8000/api/crm/quotation-templates/${id}/`, {
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

  const handleAddItemToQuotation = (service: { id: string; name: string }) => {
    setSendForm(prev => ({
      ...prev,
      items: [...prev.items, { item_id: service.id, item_name: service.name, quantity: 1 }],
    }));
  };

  const handleRemoveItemFromQuotation = (index: number) => {
    setSendForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItemQuantity = (index: number, quantity: number) => {
    setSendForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSendQuotation = async (method: 'email' | 'whatsapp') => {
    const template = templates.find(t => t.id === sendForm.template_id);
    const lead = leads.find(l => l.id === sendForm.lead_id);
    
    if (!template || !lead) {
      alert('Please select a template and lead');
      return;
    }
    
    // Build the quotation message
    let message = template.body;
    
    // Replace placeholders
    message = message.replace('{{customer_name}}', lead.customer_name);
    message = message.replace('{{company_name}}', lead.company_name || '');
    message = message.replace('{{date}}', new Date().toLocaleDateString());
    
    // Add items list
    if (sendForm.items.length > 0) {
      const itemsList = sendForm.items.map(item => 
        `- ${item.item_name} (Qty: ${item.quantity}${item.unit_price ? `, Price: UGX ${item.unit_price.toLocaleString()}` : ''})`
      ).join('\n');
      message = message.replace('{{items}}', itemsList);
    }
    
    // Add custom message
    if (sendForm.custom_message) {
      message += `\n\n${sendForm.custom_message}`;
    }
    
    // For now, just show the message since we don't have customer contact info
    alert(`Quotation Message:\n\n${message}`);
    
    setShowSendModal(false);
    setSendForm({ template_id: '', lead_id: '', items: [], custom_message: '' });
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/crm/quotations" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Quotations"
          subtitle="Manage quotation templates and send to customers"
          onSearch={(q) => console.log('Search quotations:', q)}
        />

        <div className="p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8 px-6">
                {[
                  { id: 'templates' as const, label: 'Templates' },
                  { id: 'send' as const, label: 'Send Quotation' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'templates' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Quotation Templates</h3>
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Create Template
                    </button>
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
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setSendForm(prev => ({ ...prev, template_id: template.id }));
                                  setActiveTab('send');
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                              >
                                Use
                              </button>
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
              )}

              {activeTab === 'send' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Send Quotation</h3>
                    <button
                      onClick={() => setShowSendModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + New Quotation
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowSendModal(true)}
                          className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
                        >
                          <p className="font-medium">Send New Quotation</p>
                          <p className="text-sm text-gray-600">Create and send a quotation to a customer</p>
                        </button>
                        <button
                          onClick={() => setActiveTab('templates')}
                          className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
                        >
                          <p className="font-medium">Manage Templates</p>
                          <p className="text-sm text-gray-600">Create or edit quotation templates</p>
                        </button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Available Templates</h4>
                      {templates.length === 0 ? (
                        <p className="text-gray-500 text-sm">No templates available</p>
                      ) : (
                        <div className="space-y-2">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              onClick={() => {
                                setSelectedTemplate(template);
                                setSendForm(prev => ({ ...prev, template_id: template.id }));
                                setShowSendModal(true);
                              }}
                              className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-gray-600">{template.subject}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Quotation Template</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                    placeholder="e.g., Standard Service Quotation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    required
                    placeholder="e.g., Quotation for Water Services"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Body</label>
                  <textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    required
                    rows={8}
                    placeholder="Dear {{customer_name}}, We are pleased to provide this quotation for the following services: {{items}} Please let us know if you have any questions. Thank you, Spencer Water Services"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available placeholders: {`{{customer_name}}`}, {`{{company_name}}`}, {`{{date}}`}, {`{{items}}`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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

      {/* Send Quotation Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Quotation</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                <select
                  value={sendForm.template_id}
                  onChange={(e) => setSendForm({ ...sendForm, template_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Lead/Customer</label>
                <select
                  value={sendForm.lead_id}
                  onChange={(e) => setSendForm({ ...sendForm, lead_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a lead</option>
                  {leads.filter(l => !['WON', 'LOST'].includes(l.stage)).map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.customer_name} {lead.company_name ? `(${lead.company_name})` : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Services</label>
                <select
                  onChange={(e) => {
                    const service = services.find(s => s.id === e.target.value);
                    if (service) handleAddItemToQuotation(service);
                    e.target.value = '';
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select services to add</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              
              {sendForm.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Selected Services</h4>
                  <div className="space-y-2">
                    {sendForm.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">{item.item_name}</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          onClick={() => handleRemoveItemFromQuotation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message (optional)</label>
                <textarea
                  value={sendForm.custom_message}
                  onChange={(e) => setSendForm({ ...sendForm, custom_message: e.target.value })}
                  rows={3}
                  placeholder="Add any additional notes or requirements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleSendQuotation('email')}
                  disabled={!sendForm.template_id || !sendForm.lead_id}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                >
                  ✉️ Send via Email
                </button>
                <button
                  onClick={() => handleSendQuotation('whatsapp')}
                  disabled={!sendForm.template_id || !sendForm.lead_id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                >
                  💬 Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

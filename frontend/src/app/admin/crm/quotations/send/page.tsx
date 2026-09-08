'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageHeader from '../../../../../components/admin/ui/PageHeader';

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
  stage: string;
}

interface QuotationItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

function SendQuotationPageContent() {
  const searchParams = useSearchParams();
  const leadIdFromUrl = searchParams.get('lead_id');

  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  // Default email template (load from localStorage if exists, otherwise use default)
  const [emailTemplate, setEmailTemplate] = useState<QuotationTemplate>({
    id: 'default',
    name: 'Standard Quotation Email',
    subject: 'Quotation for Water Services from Spencer Water Services Ltd',
    body: 'Dear {{customer_name}},\n\nThank you for your interest in our water services. Please find below the quotation for the requested services:\n\n{{items}}\n\nIf you have any questions or would like to discuss this further, please feel free to contact us.\n\nBest regards,\nSpencer Water Services Ltd\nPhone: +256 700 123 456\nEmail: info@spencerwaterservices.co.ug',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [sendForm, setSendForm] = useState({
    template_id: 'default',
    lead_id: leadIdFromUrl || '',
    items: [] as QuotationItem[],
    custom_message: '',
  });

  // Log sendForm changes
  useEffect(() => {
    console.log('DEBUG: sendForm.items changed:', sendForm.items);
  }, [sendForm.items]);

  useEffect(() => {
    fetchData();
    // Load custom template from localStorage
    const savedTemplate = localStorage.getItem('quotationEmailTemplate');
    if (savedTemplate) {
      try {
        setEmailTemplate(JSON.parse(savedTemplate));
      } catch (error) {
        console.error('Error loading saved template:', error);
      }
    }
  }, []);

  // Update lead_id when URL parameter changes
  useEffect(() => {
    if (leadIdFromUrl) {
      setSendForm(prev => ({ ...prev, lead_id: leadIdFromUrl }));
      fetchLeadDetails(leadIdFromUrl);
    }
  }, [leadIdFromUrl]);

  // Auto-fill custom message when lead is loaded
  useEffect(() => {
    if (selectedLead) {
      const message = `Lead Details:
- Customer: ${selectedLead.customer_name}
- Company: ${selectedLead.company || 'N/A'}
- Phone: ${selectedLead.phone}
- Email: ${selectedLead.email}
- Service: ${selectedLead.service}
- Location: ${selectedLead.district || 'N/A'}, ${selectedLead.subcounty || 'N/A'}, ${selectedLead.village || 'N/A'}
- Budget: ${selectedLead.budget_range || 'N/A'}
- Timeline: ${selectedLead.timeline || 'N/A'}

Description:
${selectedLead.description}`;
      setSendForm(prev => ({ ...prev, custom_message: message }));

      // Parse budget range to get a default price estimate
      let defaultPrice = 0;
      if (selectedLead.budget_range) {
        const budgetMatch = selectedLead.budget_range.match(/[\d,]+/);
        if (budgetMatch) {
          defaultPrice = parseInt(budgetMatch[0].replace(/,/g, '')) || 0;
        }
      }
      console.log('DEBUG: Default price from budget:', defaultPrice);
      
      // Always add the lead service as an item (don't depend on services being loaded)
      const newItems = [{ item_id: 'custom', item_name: selectedLead.service, quantity: 1, unit_price: defaultPrice }];
      console.log('DEBUG: Setting items to:', newItems);
      setSendForm(prev => ({
        ...prev,
        items: newItems
      }));
    }
  }, [selectedLead]);

  // Update items when services are loaded (to match with service IDs if possible)
  useEffect(() => {
    if (selectedLead && services.length > 0 && sendForm.items.length > 0) {
      const matchingService = services.find(s => s.id === selectedLead.service || s.name.toLowerCase().includes(selectedLead.service.toLowerCase()));
      console.log('DEBUG: Services loaded, checking for match:', matchingService);
      
      if (matchingService) {
        // Update the item to use the service ID instead of 'custom'
        const updatedItems = sendForm.items.map(item => 
          item.item_id === 'custom' && item.item_name === selectedLead.service
            ? { ...item, item_id: matchingService.id, item_name: matchingService.name }
            : item
        );
        console.log('DEBUG: Updated items with service ID:', updatedItems);
        setSendForm(prev => ({ ...prev, items: updatedItems }));
      }
    }
  }, [services, selectedLead]);

  const fetchLeadDetails = async (leadId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/`);
      if (response.ok) {
        const leadData = await response.json();
        setSelectedLead(leadData);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [templatesRes, leadsRes, servicesRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/quotations/quotation-templates/'),
        fetch('http://127.0.0.1:8000/api/quotations/leads/'),
        fetch('http://127.0.0.1:8000/api/content/services/'),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      } else {
        console.error('Templates fetch failed:', templatesRes.status);
      }
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      } else {
        console.error('Leads fetch failed:', leadsRes.status);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      } else {
        console.error('Services fetch failed:', servicesRes.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToQuotation = (service: { id: string; name: string }) => {
    setSendForm(prev => ({
      ...prev,
      items: [...prev.items, { item_id: service.id, item_name: service.name, quantity: 1, unit_price: 0 }],
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

  const handleUpdateItemPrice = (index: number, unit_price: number) => {
    setSendForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, unit_price } : item
      ),
    }));
  };

  const handleSendQuotation = async () => {
    const template = emailTemplate; // Use the email template (from localStorage or default)
    const lead = selectedLead; // Use the pre-selected lead from URL

    // Build the quotation message for email
    let emailMessage = template.body;

    // Replace placeholders
    if (lead) {
      emailMessage = emailMessage.replace('{{customer_name}}', lead.customer_name);
      emailMessage = emailMessage.replace('{{company_name}}', lead.company || '');
    }
    emailMessage = emailMessage.replace('{{date}}', new Date().toLocaleDateString());

    // Add items list
    if (sendForm.items.length > 0) {
      const itemsList = sendForm.items.map(item =>
        `- ${item.item_name} (Qty: ${item.quantity}${item.unit_price ? `, Price: UGX ${item.unit_price.toLocaleString()}` : ''})`
      ).join('\n');
      emailMessage = emailMessage.replace('{{items}}', itemsList);
    }

    // Add custom message
    if (sendForm.custom_message) {
      emailMessage += `\n\n${sendForm.custom_message}`;
    }

    // First, send the email with PDF attachment
    try {
      const emailResponse = await fetch('http://127.0.0.1:8000/api/quotations/quotations/send-quotation-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: sendForm.lead_id,
          message: emailMessage,
          items: sendForm.items,
        }),
      });

      if (emailResponse.ok) {
        const responseData = await emailResponse.json();
        // Email sent (or attempted), now send WhatsApp notification
        const customerName = lead?.customer_name || 'Customer';
        const customerEmail = lead?.email || 'your email';
        const customerPhone = lead?.phone || '';

        let whatsappMessage = `Hello ${customerName}! 📧\n\n`;
        if (responseData.status === 'sent') {
          whatsappMessage += `We have sent your quotation to your email (${customerEmail}). Please check your inbox.\n\n`;
        } else {
          whatsappMessage += `We attempted to send your quotation to your email (${customerEmail}) but encountered a technical issue. Our team will send it manually.\n\n`;
        }
        whatsappMessage += `If you have any questions, feel free to contact us.\n\nBest regards,\nSpencer Water Services Ltd`;

        // Format phone number for WhatsApp (remove spaces, add +256 if needed)
        let phoneNumber = customerPhone.replace(/\s+/g, '');
        if (!phoneNumber.startsWith('+')) {
          // Assume Uganda country code if not present
          phoneNumber = '+256' + phoneNumber.replace(/^0/, '');
        }

        // Open WhatsApp with notification message
        if (phoneNumber) {
          const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(whatsappUrl, '_blank');
        }

        alert(responseData.message);
      } else {
        alert('Error sending email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    }

    // Reset form
    setSendForm({ template_id: '', lead_id: '', items: [], custom_message: '' });
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

  return (
    <AdminLayout
      title="Send Quotation"
      subtitle="Create and send quotation to customer"
      activePath="/admin/crm/quotations"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8">
        <PageHeader
          title="Send Quotation"
          description="Create and send quotation to customer"
        />

        {/* Template Management Section */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900">Quotation Template</h3>
              <Link
                href="/admin/crm/quotations/template/edit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Template
              </Link>
            </div>
          </div>

          <div className="p-5">
            <div className="border border-blue-100 rounded-lg p-4 bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500" />
                    <h4 className="font-semibold text-blue-900">{emailTemplate.name}</h4>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">{emailTemplate.subject}</p>
                  <p className="text-sm text-blue-900 mt-2 line-clamp-2">{emailTemplate.body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Info */}
          <div className="space-y-6">
            {/* Customer Information (Read-only) */}
            {selectedLead && (
              <div className="rounded-xl p-6 border border-blue-100 bg-blue-50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">👤</span>
                  <h4 className="font-semibold text-blue-900">Customer Information</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-blue-600">Customer Name</label>
                    <p className="font-semibold text-blue-900">{selectedLead.customer_name}</p>
                  </div>
                  {selectedLead.company && (
                    <div>
                      <label className="text-sm text-blue-600">Company</label>
                      <p className="text-blue-900">{selectedLead.company}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-blue-600">Phone</label>
                    <p className="text-blue-900">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-600">Email</label>
                    <p className="text-blue-900">{selectedLead.email}</p>
                  </div>
                  {(selectedLead.district || selectedLead.subcounty || selectedLead.village) && (
                    <div>
                      <label className="text-sm text-blue-600">Location</label>
                      <p className="text-blue-900">
                        {[selectedLead.district, selectedLead.subcounty, selectedLead.village].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Information (Read-only) */}
            {selectedLead && (
              <div className="rounded-xl p-6 border border-blue-100 bg-blue-50 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🛠️</span>
                  <h4 className="font-semibold text-blue-900">Service Request</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-blue-600">Service</label>
                    <p className="font-semibold text-blue-900">{selectedLead.service}</p>
                  </div>
                  {selectedLead.description && (
                    <div>
                      <label className="text-sm text-blue-600">Description</label>
                      <p className="text-blue-900">{selectedLead.description}</p>
                    </div>
                  )}
                  {selectedLead.budget_range && (
                    <div>
                      <label className="text-sm text-blue-600">Budget Range</label>
                      <p className="text-blue-900">{selectedLead.budget_range}</p>
                    </div>
                  )}
                  {selectedLead.timeline && (
                    <div>
                      <label className="text-sm text-blue-600">Timeline</label>
                      <p className="text-blue-900">{selectedLead.timeline}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quotation Items & Actions */}
          <div className="space-y-6">
            {/* Quotation Items */}
            <div className="rounded-xl p-6 border border-blue-100 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <h4 className="font-semibold text-blue-900">Quotation Items</h4>
                </div>
                <span className="text-sm text-blue-600">{sendForm.items.length} item(s)</span>
              </div>

              {sendForm.items.length > 0 ? (
                <div className="space-y-3">
                  {sendForm.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <span className="flex-1 font-medium text-blue-900">{item.item_name}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-blue-600">Qty:</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-16 px-3 py-2 border border-blue-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-blue-600">Price (UGX):</label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateItemPrice(index, parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-24 px-3 py-2 border border-blue-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveItemFromQuotation(index)}
                        className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-8 border-2 border-dashed border-blue-200 text-center">
                  <span className="text-4xl mb-3 block">📦</span>
                  <p className="text-blue-400">No items in quotation</p>
                  <p className="text-sm text-blue-400 mt-1">Items will be auto-filled from lead service</p>
                </div>
              )}

              {/* Add Additional Items */}
              <div className="mt-4 pt-4 border-t border-blue-100">
                <label className="block text-sm font-medium text-blue-700 mb-2">Add Additional Items (Optional)</label>
                <select
                  onChange={(e) => {
                    const service = services.find(s => s.id === e.target.value);
                    if (service) {
                      handleAddItemToQuotation(service);
                    }
                    e.target.value = '';
                  }}
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a service to add</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Message */}
            <div className="rounded-xl p-6 border border-blue-100 bg-blue-50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💬</span>
                <h4 className="font-semibold text-blue-900">Additional Notes</h4>
              </div>
              <textarea
                value={sendForm.custom_message}
                onChange={(e) => setSendForm({ ...sendForm, custom_message: e.target.value })}
                rows={4}
                placeholder="Add any additional notes or requirements..."
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="rounded-xl p-6 border border-blue-100 bg-white shadow-sm">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('DEBUG: Send page - current items:', sendForm.items);
                    const itemsParam = encodeURIComponent(JSON.stringify(sendForm.items));
                    console.log('DEBUG: Send page - encoded items param:', itemsParam);
                    const previewUrl = `/admin/crm/quotations/preview?lead_id=${sendForm.lead_id}&items=${itemsParam}`;
                    console.log('DEBUG: Send page - preview URL:', previewUrl);
                    window.location.href = previewUrl;
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <span>📄</span>
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={handleSendQuotation}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Send Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SendQuotationPage() {
  return (
    <Suspense fallback={
      <AdminLayout
        title="Send Quotation"
        subtitle="Create and send quotation to customer"
        activePath="/admin/crm/quotations"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading quotation form...</div>
        </div>
      </AdminLayout>
    }>
      <SendQuotationPageContent />
    </Suspense>
  );
}

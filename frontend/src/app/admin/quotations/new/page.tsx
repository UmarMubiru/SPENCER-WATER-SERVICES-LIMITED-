'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

const SERVICE_OPTIONS = [
  { id: 'borehole_drilling', label: 'Borehole Drilling' },
  { id: 'solar_pump_installation', label: 'Solar Pump Installation' },
  { id: 'water_treatment', label: 'Water Treatment' },
  { id: 'pipeline_extension', label: 'Pipeline Extension' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'water_storage', label: 'Water Storage' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'tank_installation', label: 'Tank Installation' },
  { id: 'other', label: 'Other' },
];

const UNIT_OPTIONS = [
  { id: 'each', label: 'Pieces' },
  { id: 'meter', label: 'Meter' },
  { id: 'square_meter', label: 'Square Meter' },
  { id: 'cubic_meter', label: 'Cubic Meter' },
  { id: 'hour', label: 'Hour' },
  { id: 'day', label: 'Day' },
  { id: 'kg', label: 'Kilogram' },
  { id: 'ton', label: 'Ton' },
  { id: 'liter', label: 'Liter' },
  { id: 'set', label: 'Set' },
  { id: 'none', label: 'N/A' },
];

interface QuotationItem {
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  vat_percentage: number;
  discount_percentage: number;
  is_optional: boolean;
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-blue-400">Loading...</div>}>
      <NewQuotationPageContent />
    </Suspense>
  );
}

function NewQuotationPageContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('lead_id');
  const [leadName, setLeadName] = useState('');
  const [leadInquiry, setLeadInquiry] = useState('');
  const [quotationForm, setQuotationForm] = useState({
    customer_name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    service: '',
    header: 'QUOTATION',
    terms: 'This quotation is valid for 30 days from the date of issue. All prices are in UGX.',
    payment_terms: '50% advance payment, balance upon completion.',
    footer: 'Thank you for your business!',
    validity_days: 30,
    include_vat: true,
    mou_text: '',
  });

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A lead is a starting point, not a locked quotation.  Copy its enquiry
  // into the same editable builder used for a manually-created quotation.
  useEffect(() => {
    if (!leadId) return;

    const loadLead = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/quotations/leads/${leadId}/`);
        if (!response.ok) return;
        const lead = await response.json();
        const location = [lead.address, lead.village, lead.subcounty, lead.district].filter(Boolean).join(', ');
        const service = lead.service || lead.lead_services?.[0]?.service || '';

        setLeadName(lead.customer_name || 'Selected lead');
        setLeadInquiry(lead.description || lead.notes || 'No additional inquiry details were recorded.');
        setQuotationForm((current) => ({
          ...current,
          customer_name: lead.customer_name || current.customer_name,
          company: lead.company || current.company,
          email: lead.email || current.email,
          phone: lead.phone || current.phone,
          address: location || current.address,
          service,
        }));
      } catch (error) {
        console.error('Unable to load lead for quotation:', error);
      }
    };

    loadLead();
  }, [leadId]);

  const addItem = () => {
    setItems([
      ...items,
      {
        description: '',
        unit: 'each',
        quantity: 1,
        rate: 0,
        vat_percentage: 18,
        discount_percentage: 0,
        is_optional: false,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let vatTotal = 0;
    let discountTotal = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.rate;
      const vatAmount = quotationForm.include_vat ? lineTotal * (item.vat_percentage / 100) : 0;
      const discountAmount = lineTotal * (item.discount_percentage / 100);
      
      subtotal += lineTotal;
      vatTotal += vatAmount;
      discountTotal += discountAmount;
    });

    return {
      subtotal,
      vatTotal,
      discountTotal,
      grandTotal: subtotal + vatTotal - discountTotal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create quotation first
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name_snapshot: quotationForm.customer_name,
          company_snapshot: quotationForm.company,
          email_snapshot: quotationForm.email,
          phone_snapshot: quotationForm.phone,
          address_snapshot: quotationForm.address,
          header: quotationForm.header,
          terms: quotationForm.terms,
          payment_terms: quotationForm.payment_terms,
          footer: quotationForm.footer,
          include_vat: quotationForm.include_vat,
          valid_until: new Date(Date.now() + quotationForm.validity_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lead: leadId || null,
          template: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const quotationId = data.id;
        
        // Create each item separately
        const itemsUrl = 'http://127.0.0.1:8000/api/quotations/quotation-items/';
        for (const item of items) {
          await fetch(itemsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quotation: quotationId,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              rate: item.rate,
              vat_percentage: item.vat_percentage,
              discount_percentage: item.discount_percentage,
              is_optional: item.is_optional,
            }),
          });
        }
        
        // Calculate totals
        await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/calculate_totals/`, {
          method: 'POST',
        });
        
        // Continue in the full quotation record, which provides the document
        // actions (PDF/Word) and remains editable after creation.
        window.location.href = `/admin/quotations/${quotationId}`;
      } else {
        const error = await response.json();
        console.error('Error creating quotation:', error);
        alert(`Error creating quotation: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Error creating quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <AdminLayout
      title="Create Quotation"
      subtitle={leadId ? `Pre-filled from lead enquiry: ${leadName || 'Loading...'}` : 'Create a new quotation manually'}
      activePath="/admin/quotations"
    >
      <div className="p-6 max-w-6xl">
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Quotations
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={quotationForm.customer_name}
                  onChange={(e) => setQuotationForm({ ...quotationForm, customer_name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={quotationForm.company}
                  onChange={(e) => setQuotationForm({ ...quotationForm, company: e.target.value })}
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={quotationForm.email}
                  onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={quotationForm.phone}
                  onChange={(e) => setQuotationForm({ ...quotationForm, phone: e.target.value })}
                  placeholder="+256..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={quotationForm.address}
                  onChange={(e) => setQuotationForm({ ...quotationForm, address: e.target.value })}
                  placeholder="Customer address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quotation Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadId ? (
                <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">Customer inquiry</p>
                  <p className="mt-1 text-sm text-blue-700"><span className="font-medium">Requested service:</span> {SERVICE_OPTIONS.find((option) => option.id === quotationForm.service)?.label || quotationForm.service || 'As described by the customer'}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{leadInquiry}</p>
                  <p className="mt-3 text-xs text-blue-600">This came from the lead inquiry. Add or edit quotation items below; no service needs to be selected again.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service *</label>
                  <select
                    required
                    value={quotationForm.service}
                    onChange={(e) => setQuotationForm({ ...quotationForm, service: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select service</option>
                    {SERVICE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Validity Days *</label>
                <input
                  type="number"
                  required
                  value={quotationForm.validity_days}
                  onChange={(e) => setQuotationForm({ ...quotationForm, validity_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={quotationForm.include_vat}
                    onChange={(e) => setQuotationForm({ ...quotationForm, include_vat: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Include VAT in quotation</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quotation Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header</label>
                <input
                  type="text"
                  value={quotationForm.header}
                  onChange={(e) => setQuotationForm({ ...quotationForm, header: e.target.value })}
                  placeholder="Header text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <textarea
                  value={quotationForm.terms}
                  onChange={(e) => setQuotationForm({ ...quotationForm, terms: e.target.value })}
                  rows={4}
                  placeholder="Terms and conditions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <textarea
                  value={quotationForm.payment_terms}
                  onChange={(e) => setQuotationForm({ ...quotationForm, payment_terms: e.target.value })}
                  rows={3}
                  placeholder="Payment terms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Memorandum of Understanding (MOU)</label>
                <textarea
                  value={quotationForm.mou_text}
                  onChange={(e) => setQuotationForm({ ...quotationForm, mou_text: e.target.value })}
                  rows={4}
                  placeholder="Enter MOU terms and agreement details..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Add MOU section for formal agreement terms</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer</label>
                <textarea
                  value={quotationForm.footer}
                  onChange={(e) => setQuotationForm({ ...quotationForm, footer: e.target.value })}
                  rows={2}
                  placeholder="Footer text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">No items added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Item" to start adding line items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Item {index + 1}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <span>✕</span> Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                        <select
                          required
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select unit</option>
                          <option value="each">Each/Piece</option>
                          <option value="set">Set</option>
                          <option value="meter">Meter</option>
                          <option value="square_meter">Square Meter</option>
                          <option value="cubic_meter">Cubic Meter</option>
                          <option value="kg">Kilogram</option>
                          <option value="ton">Ton</option>
                          <option value="liter">Liter</option>
                          <option value="hour">Hour</option>
                          <option value="day">Day</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (UGX) *</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">VAT %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.vat_percentage || ''}
                          onChange={(e) => updateItem(index, 'vat_percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.discount_percentage || ''}
                          onChange={(e) => updateItem(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-5 flex justify-between items-center border-t border-gray-100 pt-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.is_optional}
                            onChange={(e) => updateItem(index, 'is_optional', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Optional Item</span>
                        </label>
                        <div className="text-sm font-medium text-gray-900">
                          Line Total: UGX {(item.quantity * item.rate).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">UGX {totals.subtotal.toLocaleString()}</span>
                    </div>
                    {quotationForm.include_vat && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT:</span>
                        <span className="font-medium">UGX {totals.vatTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">-UGX {totals.discountTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Grand Total:</span>
                      <span className="font-bold text-lg text-blue-600">UGX {totals.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/admin/quotations"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect, use } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface Quotation {
  id: string;
  quotation_number: string;
  lead: string;
  lead_customer_name: string;
  lead_company?: string;
  customer_name_snapshot?: string;
  company_snapshot?: string;
  email_snapshot?: string;
  phone_snapshot?: string;
  address_snapshot?: string;
  template?: string;
  template_name?: string;
  status: string;
  version: number;
  valid_until?: string;
  subtotal: number;
  vat_total: number;
  discount_total: number;
  grand_total: number;
  header?: string;
  terms?: string;
  footer?: string;
  payment_terms?: string;
  internal_notes?: string;
  customer_notes?: string;
  hero_image_1?: string;
  hero_image_url_1?: string;
  hero_image_2?: string;
  hero_image_url_2?: string;
  hero_image_3?: string;
  hero_image_url_3?: string;
  created_at: string;
  updated_at: string;
  include_vat?: boolean;
  items: QuotationItem[];
}

interface QuotationItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  vat_percentage: number;
  discount_percentage: number;
  is_optional: boolean;
  line_total: number;
  vat_amount: number;
  discount_amount: number;
  final_total: number;
}

const STATUS_LABELS: { [key: string]: string } = {
  draft: 'Draft',
  submitted: 'Submitted',
  review: 'Manager Review',
  approved: 'Approved',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
  revision: 'Revision Requested',
};

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

export default function QuotationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({
    customer_name_snapshot: '',
    company_snapshot: '',
    email_snapshot: '',
    phone_snapshot: '',
    address_snapshot: '',
    header: '',
    terms: '',
    payment_terms: '',
    footer: '',
    include_vat: true,
  });
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    vat_total: 0,
    discount_total: 0,
    grand_total: 0,
  });

  useEffect(() => {
    fetchQuotation();
  }, [resolvedParams.id]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/`);
      if (response.ok) {
        const data = await response.json();
        setQuotation(data);
        setEditForm({
          customer_name_snapshot: data.customer_name_snapshot || '',
          company_snapshot: data.company_snapshot || '',
          email_snapshot: data.email_snapshot || '',
          phone_snapshot: data.phone_snapshot || '',
          address_snapshot: data.address_snapshot || '',
          header: data.header || '',
          terms: data.terms || '',
          payment_terms: data.payment_terms || '',
          footer: data.footer || '',
          include_vat: data.include_vat !== undefined ? data.include_vat : true,
        });
        setEditingItems(data.items.map((item: any) => ({ ...item })));
        setRemovedItemIds([]);
      }
    } catch (error) {
      console.error('Error fetching quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuotation = async (field: string, value: any) => {
    if (!quotation) return;
    setIsSaving(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        fetchQuotation();
      } else {
        alert('Error updating quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Error updating quotation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusAction = async (action: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/${action}/`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchQuotation();
      } else {
        alert(`Error performing ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      alert(`Error performing ${action}`);
    }
  };

  const handleSendQuotation = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/send/`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Quotation sent successfully!');
        fetchQuotation();
      } else {
        alert('Error sending quotation');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Error sending quotation');
    }
  };

  const handleEditToggle = () => {
    if (!isEditing && quotation) {
      // Entering edit mode - initialize calculated totals from current quotation
      setCalculatedTotals({
        subtotal: quotation.subtotal || 0,
        vat_total: quotation.vat_total || 0,
        discount_total: quotation.discount_total || 0,
        grand_total: quotation.grand_total || 0,
      });
      
      // Sync editForm.include_vat with quotation.include_vat
      const includeVat = quotation.include_vat !== undefined ? quotation.include_vat : true;
      setEditForm({ ...editForm, include_vat: includeVat });
      
      // Recalculate all items based on current include_vat setting
      const updatedItems = quotation.items.map((item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const vatPercentage = parseFloat(item.vat_percentage) || 0;
        const discountPercentage = parseFloat(item.discount_percentage) || 0;
        
        const lineTotal = quantity * rate;
        const vatAmount = includeVat ? lineTotal * (vatPercentage / 100) : 0;
        const discountAmount = lineTotal * (discountPercentage / 100);
        const finalTotal = lineTotal + vatAmount - discountAmount;
        
        return {
          ...item,
          line_total: lineTotal,
          vat_amount: vatAmount,
          discount_amount: discountAmount,
          final_total: finalTotal,
        };
      });
      setEditingItems(updatedItems);
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
      const vatTotal = updatedItems.reduce((sum, item) => sum + (item.vat_amount || 0), 0);
      const discountTotal = updatedItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
      const grandTotal = subtotal + vatTotal - discountTotal;
      
      setCalculatedTotals({
        subtotal: subtotal,
        vat_total: vatTotal,
        discount_total: discountTotal,
        grand_total: grandTotal,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      // Save quotation fields first (including include_vat)
      const quotationResponse = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (quotationResponse.ok) {
        // Delete removed items first
        const itemsUrl = 'http://127.0.0.1:8000/api/quotations/quotation-items/';
        for (const itemId of removedItemIds) {
          await fetch(`${itemsUrl}${itemId}/`, {
            method: 'DELETE',
          });
        }

        // Save each item after quotation is updated
        for (const item of editingItems) {
          const payload = {
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            vat_percentage: item.vat_percentage,
            discount_percentage: item.discount_percentage,
            is_optional: item.is_optional,
          };

          if (String(item.id).startsWith('temp-')) {
            await fetch(itemsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quotation: resolvedParams.id,
                ...payload,
              }),
            });
          } else {
            await fetch(`${itemsUrl}${item.id}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
          }
        }
        
        // Recalculate totals (this will respect the updated include_vat flag)
        await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${resolvedParams.id}/calculate_totals/`, {
          method: 'POST',
        });
        
        alert('Quotation updated successfully!');
        setIsEditing(false);
        setRemovedItemIds([]);
        fetchQuotation();
      } else {
        alert('Error updating quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Error updating quotation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit form to current quotation data
    if (quotation) {
      setEditForm({
        customer_name_snapshot: quotation.customer_name_snapshot || '',
        company_snapshot: quotation.company_snapshot || '',
        email_snapshot: quotation.email_snapshot || '',
        phone_snapshot: quotation.phone_snapshot || '',
        address_snapshot: quotation.address_snapshot || '',
        header: quotation.header || '',
        terms: quotation.terms || '',
        payment_terms: quotation.payment_terms || '',
        footer: quotation.footer || '',
        include_vat: quotation.include_vat !== undefined ? quotation.include_vat : true,
      });
      setEditingItems(quotation.items.map((item: any) => ({ ...item })));
      setRemovedItemIds([]);
    }
  };

  const handleAddItem = () => {
    setEditingItems((prev) => ([
      ...prev,
      {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        description: '',
        unit: 'each',
        quantity: 1,
        rate: 0,
        vat_percentage: 18,
        discount_percentage: 0,
        is_optional: false,
        line_total: 0,
        vat_amount: 0,
        discount_amount: 0,
        final_total: 0,
      },
    ]));
  };

  const handleRemoveItem = (index: number) => {
    setEditingItems((prev) => {
      const item = prev[index];
      if (item && !String(item.id).startsWith('temp-')) {
        setRemovedItemIds((old) => [...old, String(item.id)]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    console.log('DEBUG: handleItemChange called for index:', index, 'field:', field, 'value:', value);
    const updatedItems = [...editingItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate item totals when relevant fields change
    const item = updatedItems[index];
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const vatPercentage = parseFloat(item.vat_percentage) || 0;
    const discountPercentage = parseFloat(item.discount_percentage) || 0;
    
    const lineTotal = quantity * rate;
    // Only include VAT if include_vat is checked
    const vatAmount = editForm.include_vat ? lineTotal * (vatPercentage / 100) : 0;
    const discountAmount = lineTotal * (discountPercentage / 100);
    const finalTotal = lineTotal + vatAmount - discountAmount;
    
    console.log(`DEBUG: Item calculation - quantity=${quantity}, rate=${rate}, lineTotal=${lineTotal}, vatAmount=${vatAmount}, finalTotal=${finalTotal}`);
    
    updatedItems[index] = {
      ...updatedItems[index],
      line_total: lineTotal,
      vat_amount: vatAmount,
      discount_amount: discountAmount,
      final_total: finalTotal,
    };
    
    // Recalculate overall quotation totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const vatTotal = updatedItems.reduce((sum, item) => sum + (item.vat_amount || 0), 0);
    const discountTotal = updatedItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const grandTotal = subtotal + vatTotal - discountTotal;
    
    console.log(`DEBUG: Totals calculation - subtotal=${subtotal}, vatTotal=${vatTotal}, discountTotal=${discountTotal}, grandTotal=${grandTotal}`);
    
    // Update calculated totals state
    setCalculatedTotals({
      subtotal: subtotal,
      vat_total: vatTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
    });
    
    setEditingItems(updatedItems);
  };

  const handleIncludeVatToggle = (value: boolean) => {
    console.log('DEBUG: handleIncludeVatToggle called with:', value);
    setEditForm({ ...editForm, include_vat: value });
    
    // Recalculate all items when include_vat changes
    const updatedItems = editingItems.map((item: any) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const vatPercentage = parseFloat(item.vat_percentage) || 0;
      const discountPercentage = parseFloat(item.discount_percentage) || 0;
      
      const lineTotal = quantity * rate;
      const vatAmount = value ? lineTotal * (vatPercentage / 100) : 0;
      const discountAmount = lineTotal * (discountPercentage / 100);
      const finalTotal = lineTotal + vatAmount - discountAmount;
      
      console.log(`DEBUG: Item ${item.description}: lineTotal=${lineTotal}, vatAmount=${vatAmount}, finalTotal=${finalTotal}, includeVat=${value}`);
      
      return {
        ...item,
        line_total: lineTotal,
        vat_amount: vatAmount,
        discount_amount: discountAmount,
        final_total: finalTotal,
      };
    });
    
    setEditingItems(updatedItems);
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
    const vatTotal = updatedItems.reduce((sum, item) => sum + (item.vat_amount || 0), 0);
    const discountTotal = updatedItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const grandTotal = subtotal + vatTotal - discountTotal;
    
    console.log(`DEBUG: Totals: subtotal=${subtotal}, vatTotal=${vatTotal}, discountTotal=${discountTotal}, grandTotal=${grandTotal}`);
    
    setCalculatedTotals({
      subtotal: subtotal,
      vat_total: vatTotal,
      discount_total: discountTotal,
      grand_total: grandTotal,
    });
  };

  if (loading) {
    return (
      <AdminLayout
        title="Quotation Details"
        subtitle="View and edit quotation"
        activePath="/admin/quotations"
        onSearch={() => {}}
      >
        <div className="p-6 text-center text-gray-500">Loading...</div>
      </AdminLayout>
    );
  }

  if (!quotation) {
    return (
      <AdminLayout
        title="Quotation Details"
        subtitle="View and edit quotation"
        activePath="/admin/quotations"
        onSearch={() => {}}
      >
        <div className="p-6 text-center text-gray-500">Quotation not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Quotation ${quotation.quotation_number}`}
      subtitle={quotation.lead_customer_name}
      activePath="/admin/quotations"
      onSearch={() => {}}
    >
      <div className="p-6">
        {/* Back Button */}
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          ← Back to Quotations
        </Link>

        {/* Status & Actions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  quotation.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  quotation.status === 'approved' ? 'bg-green-100 text-green-700' :
                  quotation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {STATUS_LABELS[quotation.status] || quotation.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <span className="text-gray-900">v{quotation.version}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
              <button
                onClick={() => { window.location.href = `/admin/crm/quotations/preview?quotation_id=${resolvedParams.id}`; }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Preview Document
              </button>
              <button
                onClick={handleSendQuotation}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send
              </button>
              {quotation.status === 'submitted' && (
                <button
                  onClick={() => handleStatusAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              )}
              {quotation.status === 'approved' && (
                <button
                  onClick={() => handleStatusAction('send')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Send to Customer
                </button>
              )}
              {quotation.status === 'accepted' && (
                <button
                  onClick={() => handleStatusAction('convert_to_project')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Convert to Project
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
            {isEditing && <span className="text-sm text-orange-600 font-medium">Editing Mode</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.customer_name_snapshot}
                  onChange={(e) => setEditForm({ ...editForm, customer_name_snapshot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.customer_name_snapshot || quotation.lead_customer_name || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.company_snapshot}
                  onChange={(e) => setEditForm({ ...editForm, company_snapshot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.company_snapshot || quotation.lead_company || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email_snapshot}
                  onChange={(e) => setEditForm({ ...editForm, email_snapshot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.email_snapshot || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.phone_snapshot}
                  onChange={(e) => setEditForm({ ...editForm, phone_snapshot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.phone_snapshot || 'N/A'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={editForm.address_snapshot}
                  onChange={(e) => setEditForm({ ...editForm, address_snapshot: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.address_snapshot || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <p className="text-gray-900">{quotation.template_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={quotation.valid_until || ''}
                onChange={(e) => handleUpdateQuotation('valid_until', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Include VAT</label>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.include_vat}
                  onChange={(e) => handleIncludeVatToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{(quotation.include_vat !== undefined ? quotation.include_vat : true) ? 'Yes' : 'No'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
          {(isEditing ? editingItems : quotation.items).length === 0 ? (
            <p className="text-gray-500">No items added yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Unit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                    {editForm.include_vat && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">VAT %</th>}
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Discount %</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Line Total</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Final Total</th>
                    {isEditing && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {(isEditing ? editingItems : quotation.items).map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="each">Pieces</option>
                            <option value="meter">Meter</option>
                            <option value="square_meter">Square Meter</option>
                            <option value="cubic_meter">Cubic Meter</option>
                            <option value="hour">Hour</option>
                            <option value="day">Day</option>
                            <option value="kg">Kilogram</option>
                            <option value="ton">Ton</option>
                            <option value="liter">Liter</option>
                            <option value="set">Set</option>
                            <option value="none">N/A</option>
                          </select>
                        ) : (
                          item.unit
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          item.rate.toLocaleString()
                        )}
                      </td>
                      {editForm.include_vat && (
                        <td className="py-3 px-4 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              value={item.vat_percentage}
                              onChange={(e) => handleItemChange(index, 'vat_percentage', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                            />
                          ) : (
                            `${item.vat_percentage}%`
                          )}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={item.discount_percentage}
                            onChange={(e) => handleItemChange(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-right"
                          />
                        ) : (
                          `${item.discount_percentage}%`
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">{Number(item.line_total || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">{Number(item.final_total || 0).toLocaleString()}</td>
                      {isEditing && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{(isEditing ? calculatedTotals.subtotal : quotation.subtotal).toLocaleString()} UGX</span>
              </div>
              {editForm.include_vat && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT Total:</span>
                  <span className="font-medium">{(isEditing ? calculatedTotals.vat_total : quotation.vat_total).toLocaleString()} UGX</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-{(isEditing ? calculatedTotals.discount_total : quotation.discount_total).toLocaleString()} UGX</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-900">Grand Total:</span>
                <span className="font-bold text-lg text-blue-600">{(isEditing ? calculatedTotals.grand_total : quotation.grand_total).toLocaleString()} UGX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
              <textarea
                value={quotation.internal_notes || ''}
                onChange={(e) => handleUpdateQuotation('internal_notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Internal notes for team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
              <textarea
                value={quotation.customer_notes || ''}
                onChange={(e) => handleUpdateQuotation('customer_notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes visible to customer"
              />
            </div>
          </div>
        </div>

        {/* Template Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header</label>
              {isEditing ? (
                <textarea
                  value={editForm.header}
                  onChange={(e) => setEditForm({ ...editForm, header: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.header || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              {isEditing ? (
                <textarea
                  value={editForm.terms}
                  onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.terms || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
              {isEditing ? (
                <textarea
                  value={editForm.payment_terms}
                  onChange={(e) => setEditForm({ ...editForm, payment_terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.payment_terms || 'N/A'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Footer</label>
              {isEditing ? (
                <textarea
                  value={editForm.footer}
                  onChange={(e) => setEditForm({ ...editForm, footer: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900">{quotation.footer || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import React from 'react';

interface QuotationPreviewProps {
  leadData?: {
    customer_name: string;
    company?: string;
    phone: string;
    email: string;
    address?: string;
  };
  items?: Array<{
    item_name?: string;
    name?: string;
    quantity: number;
    unit_price?: number;
  }>;
  quotationNumber?: string;
  validUntil?: string;
}

export default function QuotationPreview({
  leadData,
  items = [],
  quotationNumber = 'QT-2026-000001',
  validUntil = '2026-09-21'
}: QuotationPreviewProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% VAT
  const total = subtotal + tax;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-2xl">
      {/* Header Section */}
      <div className="border-b-4 border-blue-600 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-3xl">💧</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Spencer Water Services</h1>
              <p className="text-sm text-gray-600 mt-1">Your Trusted Water Solutions Partner</p>
              <p className="text-xs text-gray-500 mt-1 italic">"Delivering Clean Water, Building Better Lives"</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold">QUOTATION</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Ref: {quotationNumber}</p>
            <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Valid Until: {validUntil}</p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Bill To</h3>
          <p className="font-semibold text-gray-900">{leadData?.customer_name || 'Customer Name'}</p>
          {leadData?.company && <p className="text-sm text-gray-600 mt-1">{leadData.company}</p>}
          {leadData?.address && <p className="text-sm text-gray-600 mt-1">{leadData.address}</p>}
          <p className="text-sm text-gray-600 mt-1">{leadData?.phone || 'Phone'}</p>
          <p className="text-sm text-gray-600">{leadData?.email || 'Email'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Payment Terms</h3>
          <p className="text-sm text-gray-600">50% Advance</p>
          <p className="text-sm text-gray-600">50% On Completion</p>
          <p className="text-sm text-gray-600 mt-2">Bank: [Bank Name]</p>
          <p className="text-sm text-gray-600">Account: [Account Number]</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="text-left py-3 px-4 rounded-tl-lg">#</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-center py-3 px-4">Quantity</th>
              <th className="text-right py-3 px-4">Unit Price</th>
              <th className="text-right py-3 px-4 rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No items added yet
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{item.item_name || item.name}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.unit_price ? `UGX ${item.unit_price.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {item.unit_price ? `UGX ${(item.unit_price * item.quantity).toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">UGX {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">VAT (18%)</span>
            <span className="font-semibold text-gray-900">UGX {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg mt-2">
            <span className="font-bold text-blue-900">Total</span>
            <span className="font-bold text-blue-900">UGX {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Terms & Conditions</h3>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>This quotation is valid for 30 days from the date of issue</li>
          <li>Prices are subject to change without prior notice</li>
          <li>50% advance payment required to commence work</li>
          <li>Balance payment due upon completion</li>
          <li>Installation timeline depends on site conditions</li>
          <li>Warranty applies as per service agreement</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Spencer Water Services</h4>
            <p className="text-sm text-gray-600 mt-1">Kampala, Uganda</p>
            <p className="text-sm text-gray-600">Phone: +256 XXX XXX XXX</p>
            <p className="text-sm text-gray-600">Email: info@spencerwaterservices.com</p>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 px-4 py-2 rounded-lg inline-block">
              <p className="text-sm font-semibold text-blue-900">Thank you for your business!</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">This is a computer-generated quotation</p>
          </div>
        </div>
      </div>
    </div>
  );
}

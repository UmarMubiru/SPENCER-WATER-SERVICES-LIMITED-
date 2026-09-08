'use client';

import React, { useState } from 'react';
import { SiteFrame } from '../site-shell';

interface Quotation {
  id: string;
  quotation_number: string;
  lead_customer_name: string;
  lead_company?: string;
  status: string;
  version: number;
  valid_until?: string;
  subtotal: number;
  vat_total: number;
  discount_total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
  items: QuotationItem[];
}

interface QuotationItem {
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  vat_percentage: number;
  discount_percentage: number;
  final_total: number;
}

const STATUS_LABELS: { [key: string]: string } = {
  draft: 'Draft',
  submitted: 'Submitted for Review',
  review: 'Manager Review',
  approved: 'Approved',
  sent: 'Sent to You',
  accepted: 'Accepted',
  rejected: 'Rejected',
  revision: 'Revision Requested',
};

const STATUS_COLORS: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  sent: 'bg-purple-100 text-purple-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  revision: 'bg-orange-100 text-orange-700',
};

export default function TrackQuotationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setQuotation(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/?quotation_number=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        if (results.length > 0) {
          setQuotation(results[0]);
        } else {
          setError('No quotation found with this number. Please check and try again.');
        }
      } else {
        setError('Error searching for quotation. Please try again.');
      }
    } catch (err) {
      setError('Error searching for quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!quotation) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotation.id}/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Refresh quotation data
        const refreshResponse = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotation.id}/`);
        if (refreshResponse.ok) {
          setQuotation(await refreshResponse.json());
        }
      } else {
        alert('Error performing action');
      }
    } catch (err) {
      alert('Error performing action');
    }
  };

  return (
    <SiteFrame>
      <main>
        <section className="hero hero-subpage">
          <div className="hero-centered">
            <p className="breadcrumb">Home / Track Quotation</p>
            <p className="eyebrow">Customer Portal</p>
            <h1>Track Your Quotation</h1>
            <p>
              Enter your quotation number to check the status and details of your quotation.
            </p>
          </div>

          <div className="sws-feature-strip">
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div>
                <strong>Quality & Reliability</strong>
                <span>We deliver lasting solutions</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <strong>Expert Engineers</strong>
                <span>Skilled, certified & experienced</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20"/>
                  <path d="M12 2v20"/>
                  <path d="m4.93 4.93 14.14 14.14"/>
                  <path d="m19.07 4.93-14.14 14.14"/>
                </svg>
              </div>
              <div>
                <strong>Sustainable Approach</strong>
                <span>Solutions for a better tomorrow</span>
              </div>
            </div>
            <div className="sws-feature-divider" />
            <div className="sws-feature-item">
              <div className="sws-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <strong>Nationwide Service</strong>
                <span>Across Uganda & beyond</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner max-w-4xl mx-auto">
            {/* Search Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <form onSubmit={handleSearch}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Number</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g., QTN-2024-000001"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? 'Searching...' : 'Track'}
                  </button>
                </div>
              </form>
              {error && (
                <p className="text-red-600 mt-3">{error}</p>
              )}
            </div>

            {/* Quotation Details */}
            {quotation && (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{quotation.quotation_number}</h2>
                      <p className="text-gray-600">{quotation.lead_customer_name}</p>
                      {quotation.lead_company && (
                        <p className="text-gray-600">{quotation.lead_company}</p>
                      )}
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_COLORS[quotation.status]}`}>
                      {STATUS_LABELS[quotation.status] || quotation.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Version</p>
                      <p className="font-medium">v{quotation.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">{new Date(quotation.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valid Until</p>
                      <p className="font-medium">{quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-blue-600">{quotation.grand_total.toLocaleString()} UGX</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {quotation.status === 'sent' && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleAction('accept')}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Accept Quotation
                      </button>
                      <button
                        onClick={() => handleAction('customer_reject')}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Reject Quotation
                      </button>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Items</h3>
                  {quotation.items.length === 0 ? (
                    <p className="text-gray-500">No items</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotation.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 px-4">{item.description}</td>
                              <td className="py-3 px-4 text-right">{item.quantity}</td>
                              <td className="py-3 px-4 text-right">{item.rate.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right font-medium">{item.final_total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{quotation.subtotal.toLocaleString()} UGX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT Total:</span>
                        <span className="font-medium">{quotation.vat_total.toLocaleString()} UGX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">-{quotation.discount_total.toLocaleString()} UGX</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="font-semibold text-gray-900">Grand Total:</span>
                        <span className="font-bold text-lg text-blue-600">{quotation.grand_total.toLocaleString()} UGX</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revision Request */}
                {quotation.status === 'sent' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Revision</h3>
                    <button
                      onClick={() => handleAction('request_revision')}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Request Changes
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to request changes to this quotation. We'll review and send you a revised version.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QuotationItem {
  id: string;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  vat_amount: number;
  discount_amount: number;
  final_total: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  subtotal: number;
  vat_total: number;
  discount_total: number;
  grand_total: number;
  valid_until: string;
  notes: string;
  created_at: string;
  lead_customer_name: string;
  lead_company: string;
  items: QuotationItem[];
}

export default function CustomerQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/quotations/quotations/');

      if (response.ok) {
        const data = await response.json();
        setQuotations(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (quotationId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/pdf/`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotation-${selectedQuotation?.quotation_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleAcceptQuotation = async (quotationId: string) => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/accept/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Quotation accepted successfully!');
        loadQuotations();
        setSelectedQuotation(null);
      } else {
        alert('Failed to accept quotation');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert('Failed to accept quotation');
    }
  };

  const handleRejectQuotation = async (quotationId: string, reason: string) => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await fetch(`http://127.0.0.1:8000/api/quotations/quotations/${quotationId}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejection_reason: reason }),
      });

      if (response.ok) {
        alert('Quotation rejected. We will contact you to discuss alternatives.');
        loadQuotations();
        setSelectedQuotation(null);
      } else {
        alert('Failed to reject quotation');
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      alert('Failed to reject quotation');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
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
              <Link href="/portal/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900">My Quotations</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedQuotation ? (
          /* Quotation Detail View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedQuotation.quotation_number}</h2>
                <p className="text-sm text-gray-600">{selectedQuotation.lead_customer_name}</p>
              </div>
              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Status and Validity */}
              <div className="flex justify-between items-center mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedQuotation.status)}`}>
                  {selectedQuotation.status}
                </span>
                <span className="text-sm text-gray-600">
                  Valid until: {new Date(selectedQuotation.valid_until).toLocaleDateString()}
                </span>
              </div>

              {/* Items Table */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Item</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Unit Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{item.item_name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(item.final_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (18%)</span>
                  <span>{formatCurrency(selectedQuotation.vat_total)}</span>
                </div>
                {selectedQuotation.discount_total > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedQuotation.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Grand Total</span>
                  <span>{formatCurrency(selectedQuotation.grand_total)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedQuotation.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleDownloadPDF(selectedQuotation.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
                {selectedQuotation.status === 'sent' && (
                  <>
                    <button
                      onClick={() => handleAcceptQuotation(selectedQuotation.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept Quotation
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Please provide a reason for rejection:');
                        if (reason) handleRejectQuotation(selectedQuotation.id, reason);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Quotation
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Quotations List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Quotations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {quotations.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No quotations found. Quotations will appear here after your leads are processed.
                </div>
              ) : (
                quotations.map((quotation) => (
                  <div
                    key={quotation.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedQuotation(quotation)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">{quotation.quotation_number}</div>
                      <div className="text-sm text-gray-600">{quotation.lead_customer_name}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(quotation.grand_total)}</div>
                        <div className="text-sm text-gray-600">
                          Valid: {new Date(quotation.valid_until).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

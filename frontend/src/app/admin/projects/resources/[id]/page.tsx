'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { Wrench, DollarSign, AlertCircle, CheckCircle, ClipboardPlus, Minus, Plus, X } from 'lucide-react';
import Pagination from '@/components/inventory/common/Pagination';

interface ToolSummary {
  requested: number;
  available: number;
}

interface FundSummary {
  allocated: number;
  used: number;
  remaining: number;
  pending: number;
}


interface AvailableTool {
  inventory_item: string;
  sku: string;
  name: string;
  category_name: string;
  warehouse: string;
  quantity: number;
  available_quantity: number;
  issued_quantity: number;
  unit: string;
  unit_cost: number;
}

interface FundTransaction {
  id: string;
  project: string;
  project_name: string;
  activity: string | null;
  activity_name: string;
  resource_allocation: string | null;
  expense_type: string;
  description: string;
  amount: number;
  spent_by: string;
  spent_by_name: string;
  transaction_date: string;
  supplier_or_payee: string;
  reference_number: string;
  status: string;
  receipt_or_document: string | null;
}

interface ProjectAllocation {
  id: string;
  tool_name: string;
  category: string | null;
  resource_type: string;
  allocated_quantity: number | null;
  money_amount: number | null;
  money_purpose: string;
  remaining_quantity: number | null;
  remaining_amount: number | null;
}

export default function ProjectResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>('');
  // Open the actual project allocations first; funds remain available in their
  // own tab and at the dedicated Funds page.
  const [activeTab, setActiveTab] = useState<'tools' | 'funds'>('tools');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tools state
  const [toolSummary, setToolSummary] = useState<ToolSummary>({
    requested: 0, available: 0
  });
  const [projectName, setProjectName] = useState('');
  const [availableTools, setAvailableTools] = useState<AvailableTool[]>([]);
  const [projectAllocations, setProjectAllocations] = useState<ProjectAllocation[]>([]);
  const [toolsPage, setToolsPage] = useState(1);
  const [toolsTotal, setToolsTotal] = useState(0);

  // Funds state
  const [fundSummary, setFundSummary] = useState<FundSummary>({
    allocated: 0, used: 0, remaining: 0, pending: 0
  });
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>([]);
  const [fundsPage, setFundsPage] = useState(1);
  const [fundsTotal, setFundsTotal] = useState(0);

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AvailableTool | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const inventoryHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        setProjectId(id);

        // Fetch tools data with pagination
        const [toolsRes, projectRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/inventory/available-tools/?available_only=true&page=${toolsPage}&page_size=10`),
          fetch(`http://127.0.0.1:8000/api/projects/${id}/`),
        ]);

        if (toolsRes.ok) {
          const toolsData = await toolsRes.json();
          setAvailableTools(toolsData.results || toolsData);
          setToolsTotal(toolsData.count || toolsData.length);
          setToolSummary((current) => ({ ...current, available: toolsData.count || toolsData.length }));
        }

        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProjectName(projectData.name || 'Project');
          const summaryResponse = await fetch(`http://127.0.0.1:8000/api/projects/${id}/fund_summary/`);
          if (summaryResponse.ok) {
            const fundData = await summaryResponse.json();
            setFundSummary({ allocated: fundData.total_allocated, used: fundData.used_amount, remaining: fundData.remaining_amount, pending: fundData.pending_amount });
          }
        }

        // Fetch funds data with pagination
        const transactionsRes = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${id}&page=${fundsPage}&page_size=10`);
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setFundTransactions(transactionsData.results || transactionsData);
          setFundsTotal(transactionsData.count || transactionsData.length);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, toolsPage, fundsPage]);

  const handleRequestTool = async () => {
    if (!selectedTool || requestQuantity <= 0) return;
    setRequestSubmitting(true);
    setRequestError('');
    try {
      const { id } = await params;
      const response = await fetch('http://127.0.0.1:8000/api/inventory/material-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...inventoryHeaders() },
        body: JSON.stringify({
          project_id: id,
          project_name: projectName,
          department: 'Projects',
          notes: `Request for ${selectedTool.name}`,
          items: [
            {
              inventory_item: selectedTool.inventory_item,
              quantity_requested: requestQuantity,
            }
          ]
        }),
      });

      if (response.ok) {
        setShowRequestModal(false);
        setSelectedTool(null);
        setRequestQuantity(1);
        setToolSummary((current) => ({ ...current, requested: current.requested + 1 }));
        alert('Tool request submitted. It is now waiting for approval in Inventory → Material Requests.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || Object.values(errorData).flat().join(' ') || `Request could not be sent (error ${response.status}).`;
        setRequestError(message);
        setError(message);
      }
    } catch (err) {
      const message = 'Network error. Please try again.';
      setRequestError(message);
      setError(message);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleEditTransaction = (transaction: FundTransaction) => {
    // Navigate to edit page or open edit modal
    // For now, just alert as placeholder
    alert(`Edit transaction: ${transaction.id}`);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/${transactionId}/`, {
        method: 'DELETE',
        headers: inventoryHeaders(),
      });

      if (response.ok) {
        // Refresh the transactions list
        const transactionsRes = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${projectId}&page=${fundsPage}&page_size=10`);
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setFundTransactions(transactionsData.results || transactionsData);
          setFundsTotal(transactionsData.count || transactionsData.length);
        }
        alert('Transaction deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.detail || 'Failed to delete transaction';
        setError(message);
      }
    } catch (err) {
      const message = 'Network error. Please try again.';
      setError(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Project Resources" subtitle="Manage tools and funds" onSearch={(q: string) => console.log('Search:', q)} />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar activePath="/admin/projects" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Project Resources"
            subtitle="Manage tools and funds"
            onSearch={(q: string) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('tools')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'tools' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveTab('funds')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'funds' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Funds
              </button>
            </div>

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Available in Inventory</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-inner">
                        <Wrench size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[32px] font-semibold leading-none text-blue-950">
                      {toolSummary.available}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Requests Submitted</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-inner">
                        <CheckCircle size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[32px] font-semibold leading-none text-blue-950">
                      {toolSummary.requested}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Approval & Issue</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-inner">
                        <AlertCircle size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[32px] font-semibold leading-none text-blue-950">
                      Inventory
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Stock Control</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-inner">
                        <CheckCircle size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[32px] font-semibold leading-none text-blue-950">
                      Inventory
                    </div>
                  </div>
                </div>

                {/* Available Tools Section */}
                <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="px-6 py-4 border-b border-blue-50">
                    <h3 className="text-[15px] font-semibold text-blue-900">Available Company Items (Tools)</h3>
                    <p className="mt-1 text-xs text-blue-500">Submit a request here; Inventory reviews, approves, and issues the tool.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-blue-50/60">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Tool</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">SKU</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Total</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Available</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableTools.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-blue-400">No available tools</td>
                          </tr>
                        ) : (
                          availableTools.map((tool) => (
                            <tr key={tool.inventory_item} className="border-t border-blue-50 transition-colors hover:bg-blue-50/40">
                              <td className="px-6 py-4 font-medium text-blue-900">{tool.name}</td>
                              <td className="px-6 py-4 font-mono text-[13px] text-blue-900">{tool.sku}</td>
                              <td className="px-6 py-4 text-center text-blue-900">{tool.quantity}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`font-medium ${tool.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {tool.available_quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {tool.available_quantity > 0 ? (
                                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-100 text-green-800">Available</span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-red-100 text-red-800">Unavailable</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {tool.available_quantity > 0 ? (
                                  <button
                                    onClick={() => {
                                      setRequestError('');
                                      setSelectedTool(tool);
                                      setShowRequestModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                  >
                                    Request
                                  </button>
                                ) : (
                                  <Link
                                    href={`/admin/projects/resources/funds/${projectId}/create`}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                                  >
                                    Request Hire
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 border-t border-blue-50 flex justify-end">
                    <Pagination
                      page={toolsPage}
                      totalPages={Math.ceil(toolsTotal / 10)}
                      onPrevious={() => setToolsPage((p) => Math.max(1, p - 1))}
                      onNext={() => setToolsPage((p) => Math.min(Math.ceil(toolsTotal / 10), p + 1))}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Funds Tab */}
            {activeTab === 'funds' && (
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Allocated</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-inner">
                        <DollarSign size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                      UGX {Number(fundSummary.allocated || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Used</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-inner">
                        <DollarSign size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                      UGX {Number(fundSummary.used || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Remaining</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-inner">
                        <DollarSign size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                      UGX {Number(fundSummary.remaining || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-blue-400">Pending</span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-inner">
                        <AlertCircle size={17} className="text-white" />
                      </span>
                    </div>
                    <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                      UGX {Number(fundSummary.pending || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Fund Transactions Table */}
                <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="px-6 py-4 border-b border-blue-50 flex justify-between items-center">
                    <h3 className="text-[15px] font-semibold text-blue-900">Fund Transactions</h3>
                    <Link
                      href={`/admin/projects/resources/funds/${projectId}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage Transactions →
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-blue-50/60">
                        <tr>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Date</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Type</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Description</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Amount</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Spent By</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Supplier/Payee</th>
                          <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Reference</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Document</th>
                          <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fundTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-6 py-10 text-center text-blue-400">No transactions</td>
                          </tr>
                        ) : (
                          fundTransactions.map((txn) => (
                            <tr key={txn.id} className="border-t border-blue-50 transition-colors hover:bg-blue-50/40">
                              <td className="px-6 py-4 text-blue-700">{txn.transaction_date ? new Date(txn.transaction_date).toLocaleDateString() : '—'}</td>
                              <td className="px-6 py-4 text-blue-900">{txn.expense_type}</td>
                              <td className="px-6 py-4 text-blue-900">{txn.description}</td>
                              <td className="px-6 py-4 text-center font-medium text-blue-900">UGX {txn.amount.toLocaleString()}</td>
                              <td className="px-6 py-4 text-blue-700">{txn.spent_by_name || '—'}</td>
                              <td className="px-6 py-4 text-blue-700">{txn.supplier_or_payee || '—'}</td>
                              <td className="px-6 py-4 text-blue-700">{txn.reference_number || '—'}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                                  txn.status === 'POSTED' ? 'bg-green-100 text-green-800' :
                                  txn.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                  txn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {txn.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {txn.receipt_or_document ? <a href={txn.receipt_or_document.startsWith('http') ? txn.receipt_or_document : `http://127.0.0.1:8000${txn.receipt_or_document}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">View proof</a> : '—'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEditTransaction(txn)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(txn.id)}
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 border-t border-blue-50 flex justify-end">
                    <Pagination
                      page={fundsPage}
                      totalPages={Math.ceil(fundsTotal / 10)}
                      onPrevious={() => setFundsPage((p) => Math.max(1, p - 1))}
                      onNext={() => setFundsPage((p) => Math.min(Math.ceil(fundsTotal / 10), p + 1))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/25 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Request company tool">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_80px_rgba(15,45,90,.24)]">
            <div className="flex items-start justify-between bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 text-white">
              <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><ClipboardPlus size={19} /></span><div><h3 className="text-base font-semibold">Request company tool</h3><p className="mt-0.5 text-xs text-blue-100">Sent to Inventory for approval and issue.</p></div></div>
              <button onClick={() => { setShowRequestModal(false); setSelectedTool(null); setRequestQuantity(1); }} className="rounded-lg p-2 text-blue-100 hover:bg-white/15 hover:text-white" aria-label="Close request form"><X size={20} /></button>
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-blue-950">{selectedTool.name}</p><p className="mt-0.5 font-mono text-[11px] text-blue-500">{selectedTool.sku}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700">{selectedTool.category_name || 'Company tool'}</span></div></div>
              <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-green-100 bg-green-50 p-3"><p className="text-[11px] font-medium text-green-700">Available now</p><p className="mt-0.5 text-xl font-semibold text-green-800">{selectedTool.available_quantity} <span className="text-xs font-medium">{selectedTool.unit}</span></p></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[11px] font-medium text-slate-500">Total stock</p><p className="mt-0.5 text-xl font-semibold text-slate-800">{selectedTool.quantity} <span className="text-xs font-medium">{selectedTool.unit}</span></p></div></div>
              <div><label className="mb-2 block text-sm font-semibold text-blue-900">Quantity needed</label><div className="flex items-center gap-2"><button type="button" onClick={() => setRequestQuantity((value) => Math.max(1, value - 1))} disabled={requestQuantity <= 1} className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Minus size={16} /></button><input type="number" min="1" max={selectedTool.available_quantity} value={requestQuantity} onChange={(e) => setRequestQuantity(Math.min(selectedTool.available_quantity, Math.max(1, parseInt(e.target.value) || 1)))} className="h-10 w-20 rounded-lg border border-blue-200 text-center font-semibold text-blue-950 focus:border-blue-500 focus:outline-none" /><button type="button" onClick={() => setRequestQuantity((value) => Math.min(selectedTool.available_quantity, value + 1))} disabled={requestQuantity >= selectedTool.available_quantity} className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={16} /></button><span className="text-xs text-blue-500">Max. {selectedTool.available_quantity}</span></div></div>
              {requestError && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{requestError}</div>}
            </div>
            <div className="flex gap-3 border-t border-blue-50 bg-slate-50/70 px-5 py-4"><button onClick={() => { setShowRequestModal(false); setSelectedTool(null); setRequestQuantity(1); setRequestError(''); }} className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" disabled={requestSubmitting} onClick={handleRequestTool} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{requestSubmitting ? 'Sending…' : 'Submit request'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

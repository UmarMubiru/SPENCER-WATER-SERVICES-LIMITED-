'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/Sidebar';
import { Topbar } from '../../../../components/Topbar';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Pagination from '@/components/inventory/common/Pagination';

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
  receipt_or_document: string | null;
  status: string;
  notes: string;
  created_at: string;
}

interface ProjectAllocation {
  id: string;
  tool_name: string;
  resource_type: string;
  money_amount: number | null;
  money_purpose: string;
  remaining_amount: number | null;
}

interface ProjectActivity {
  id: string;
  activity_name: string;
}

interface FundSummary {
  total_allocated: number;
  working_budget_allocated?: number;
  unallocated_amount?: number;
  used_amount: number;
  remaining_amount: number;
  pending_amount: number;
}

export default function ProjectFundsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [allocations, setAllocations] = useState<ProjectAllocation[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [summary, setSummary] = useState<FundSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    activity: '',
    resource_allocation: '',
    expense_type: 'MATERIALS',
    description: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    supplier_or_payee: '',
    notes: '',
  });
  const [allocationData, setAllocationData] = useState({ money_amount: '', money_purpose: '' });
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);

  const expenseTypeOptions = [
    { value: 'TOOL_HIRE', label: 'Tool Hire' },
    { value: 'TRANSPORT', label: 'Transport' },
    { value: 'FUEL', label: 'Fuel' },
    { value: 'ACCOMMODATION', label: 'Accommodation' },
    { value: 'MATERIALS', label: 'Materials' },
    { value: 'LABOUR', label: 'Labour' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    POSTED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        setProjectId(id);
        
        const [transactionsRes, allocationsRes, activitiesRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${id}&page=${page}&page_size=10`),
          fetch(`http://127.0.0.1:8000/api/projects/resource_allocations/?project=${id}`),
          fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${id}`),
        ]);

        const [transactionsData, allocationsData, activitiesData] = await Promise.all([
          transactionsRes.json(),
          allocationsRes.json(),
          activitiesRes.json(),
        ]);

        setTransactions(transactionsData.results || transactionsData);
        setTotal(transactionsData.count || transactionsData.length);
        setAllocations(allocationsData);
        setActivities(activitiesData);

        const summaryResponse = await fetch(`http://127.0.0.1:8000/api/projects/${id}/fund_summary/`);
        if (summaryResponse.ok) {
          const summaryPayload = await summaryResponse.json();
          setSummary({
            ...summaryPayload,
            total_allocated: Number(summaryPayload.total_allocated || 0),
            used_amount: Number(summaryPayload.used_amount || 0),
            remaining_amount: Number(summaryPayload.remaining_amount || 0),
            pending_amount: Number(summaryPayload.pending_amount || 0),
            working_budget_allocated: Number(summaryPayload.working_budget_allocated || 0),
            unallocated_amount: Number(summaryPayload.unallocated_amount || 0),
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { id } = await params;
      const payload = new FormData();
      Object.entries({ ...formData, project: id }).forEach(([key, value]) => {
        if (value !== '') payload.append(key, String(value));
      });
      if (receiptFile) payload.append('receipt_or_document', receiptFile);
      const response = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/`, {
        method: 'POST',
        body: payload,
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          activity: '',
          resource_allocation: '',
          expense_type: 'MATERIALS',
          description: '',
          amount: 0,
          transaction_date: new Date().toISOString().split('T')[0],
          supplier_or_payee: '',
          notes: '',
        });
        setReceiptFile(null);
        // Refresh data
        const { id: pid } = await params;
        const [transactionsRes, summaryRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${pid}`),
          fetch(`http://127.0.0.1:8000/api/projects/${pid}/fund_summary/`),
        ]);
        const [transactionsData, summaryData] = await Promise.all([
          transactionsRes.json(),
          summaryRes.ok ? summaryRes.json() : null,
        ]);
        setTransactions(transactionsData.results || transactionsData);
        setSummary(summaryData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.detail || 'Failed to create transaction');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { id } = await params;
      const response = await fetch('http://127.0.0.1:8000/api/projects/resource_allocations/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: id, resource_type: 'money', ...allocationData }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.money_amount?.[0] || 'Could not save the allocation.');
      }
      setAllocationData({ money_amount: '', money_purpose: '' });
      setShowAllocationForm(false);
      const [allocationsResponse, summaryResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/projects/resource_allocations/?project=${id}`),
        fetch(`http://127.0.0.1:8000/api/projects/${id}/fund_summary/`),
      ]);
      const allocationsPayload = await allocationsResponse.json();
      setAllocations(allocationsPayload.results || allocationsPayload);
      if (summaryResponse.ok) setSummary(await summaryResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the allocation.');
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    setError('');
    try {
      console.log('Approving transaction:', id);
      const response = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/${id}/approve/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Approve response status:', response.status);
      const data = await response.json();
      console.log('Approve response data:', data);
      
      if (response.ok) {
        const { id: pid } = await params;
        const [transactionsRes, summaryRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${pid}`),
          fetch(`http://127.0.0.1:8000/api/projects/${pid}/fund_summary/`),
        ]);
        const [transactionsData, summaryData] = await Promise.all([
          transactionsRes.json(),
          summaryRes.ok ? summaryRes.json() : null,
        ]);
        setTransactions(transactionsData.results || transactionsData);
        setSummary(summaryData);
      } else {
        setError(data.error || data.detail || 'Failed to approve transaction');
      }
    } catch (err) {
      console.error('Approve error:', err);
      setError('Failed to approve transaction');
    } finally {
      setApprovingId(null);
    }
  };

  const handlePost = async (id: string) => {
    setPostingId(id);
    setError('');
    try {
      console.log('Posting transaction:', id);
      const response = await fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/${id}/post/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Post response status:', response.status);
      const data = await response.json();
      console.log('Post response data:', data);
      
      if (response.ok) {
        const { id: pid } = await params;
        const [transactionsRes, summaryRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/projects/fund_transactions/?project=${pid}`),
          fetch(`http://127.0.0.1:8000/api/projects/${pid}/fund_summary/`),
        ]);
        const [transactionsData, summaryData] = await Promise.all([
          transactionsRes.json(),
          summaryRes.ok ? summaryRes.json() : null,
        ]);
        setTransactions(transactionsData.results || transactionsData);
        setSummary(summaryData);
      } else {
        setError(data.error || data.detail || 'Failed to post transaction');
      }
    } catch (err) {
      console.error('Post error:', err);
      setError('Failed to post transaction');
    } finally {
      setPostingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Project Funds" subtitle="Manage project fund transactions" onSearch={(q) => console.log('Search:', q)} />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Project Funds"
            subtitle="Manage project fund transactions"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {summary && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-blue-400">Contract Value</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-inner">
                    <DollarSign size={17} className="text-white" />
                  </span>
                </div>
                <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                  UGX {Number(summary.total_allocated || 0).toLocaleString()}
                </div>
              </div>
              <div className="group rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-blue-400">Used Amount</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-inner">
                    <DollarSign size={17} className="text-white" />
                  </span>
                </div>
                <div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">
                  UGX {Number(summary.used_amount || 0).toLocaleString()}
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
                  UGX {Number(summary.remaining_amount || 0).toLocaleString()}
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
                  UGX {Number(summary.pending_amount || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="px-6 py-4 border-b border-blue-50">
              <h2 className="text-[15px] font-semibold text-blue-900">Working Budget Allocations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-50/60"><tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Purpose</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-blue-500">Allocated</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-blue-500">Available</th>
                </tr></thead>
                <tbody>
                  {allocations.filter((allocation) => allocation.resource_type === 'money').map((allocation) => (
                    <tr key={allocation.id} className="border-t border-blue-50">
                      <td className="px-6 py-3.5 text-blue-900">{allocation.money_purpose || 'General project funds'}</td>
                      <td className="px-6 py-3.5 text-right text-blue-900">UGX {Number(allocation.money_amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-medium text-green-700">UGX {Number(allocation.remaining_amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!allocations.some((allocation) => allocation.resource_type === 'money') && <tr><td colSpan={3} className="px-6 py-8 text-center text-blue-400">No working budget has been allocated yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="px-6 py-4 border-b border-blue-50 flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-semibold text-blue-900">Project Funds</h2>
                <p className="mt-1 text-xs text-blue-500">Allocate the working budget, then record and approve each payment against it.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAllocationForm(!showAllocationForm)} className="px-4 py-2 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                  {showAllocationForm ? 'Cancel' : '+ Allocate Funds'}
                </button>
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  {showForm ? 'Cancel' : '+ Record Payment'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {showAllocationForm && (
              <form onSubmit={handleAllocationSubmit} className="p-6 border-b border-blue-50 bg-blue-50/30">
                <div className="grid gap-5 md:grid-cols-[1fr_2fr_auto] items-end">
                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Amount to allocate (UGX)</label>
                    <input type="number" min="1" step="0.01" required value={allocationData.money_amount} onChange={(e) => setAllocationData({ ...allocationData, money_amount: e.target.value })} className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Working purpose / budget line</label>
                    <input required value={allocationData.money_purpose} onChange={(e) => setAllocationData({ ...allocationData, money_purpose: e.target.value })} placeholder="e.g. Labour and site transport" className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900" />
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save allocation</button>
                </div>
              </form>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="p-6 border-b border-blue-50 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Activity</label>
                    <select
                      name="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Activity (Optional)</option>
                      {activities.map((act) => (
                        <option key={act.id} value={act.id}>{act.activity_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Resource Allocation</label>
                    <select
                      name="resource_allocation"
                      value={formData.resource_allocation}
                      onChange={(e) => setFormData({ ...formData, resource_allocation: e.target.value })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Allocation (Optional)</option>
                      {allocations
                        .filter(a => a.resource_type === 'money')
                        .map((alloc) => (
                          <option key={alloc.id} value={alloc.id}>
                            {alloc.money_purpose || 'Money'} (Remaining: {alloc.remaining_amount})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Expense Type</label>
                    <select
                      name="expense_type"
                      value={formData.expense_type}
                      onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {expenseTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Amount (UGX)</label>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Transaction Date</label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-blue-700 mb-2">Supplier/Payee</label>
                    <input
                      type="text"
                      name="supplier_or_payee"
                      value={formData.supplier_or_payee}
                      onChange={(e) => setFormData({ ...formData, supplier_or_payee: e.target.value })}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-blue-700 mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-blue-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-blue-700 mb-2">Payment proof</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-900"
                  />
                  <p className="mt-1 text-xs text-blue-500">Upload a receipt, mobile-money confirmation screenshot, or bank-transfer proof. It is required before posting.</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {submitting ? 'Creating...' : 'Create Transaction'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-50/60">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Date</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Expense Type</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">Description</th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Amount</th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Status</th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Document</th>
                    <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-blue-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr className="border-t border-blue-50 transition-colors hover:bg-blue-50/40" key={transaction.id}>
                      <td className="px-6 py-4 text-blue-700">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-blue-900">{transaction.expense_type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-blue-900">{transaction.description}</td>
                      <td className="px-6 py-4 text-center font-medium text-blue-900">UGX {transaction.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${statusColors[transaction.status]}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {transaction.receipt_or_document ? (
                          <a href={transaction.receipt_or_document.startsWith('http') ? transaction.receipt_or_document : `http://127.0.0.1:8000${transaction.receipt_or_document}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">View proof</a>
                        ) : <span className="text-sm text-amber-600">Missing</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {transaction.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(transaction.id)}
                            disabled={approvingId === transaction.id}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approvingId === transaction.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        {transaction.status === 'APPROVED' && (
                          <button
                            onClick={() => handlePost(transaction.id)}
                            disabled={postingId === transaction.id}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {postingId === transaction.id ? 'Posting...' : 'Post'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-blue-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-blue-50 flex justify-end">
              <Pagination
                page={page}
                totalPages={Math.ceil(total / 10)}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(Math.ceil(total / 10), p + 1))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

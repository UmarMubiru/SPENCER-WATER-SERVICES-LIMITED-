'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, DollarSign, Wrench } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

type Row = { id: string; project: string; project_name: string; name: string; type: string; amount: string | null; quantity: number | null; status: string; source: 'allocation' | 'payment' };
type Project = { id: string; name: string; project_reference: string };
type ProjectOverview = { project: string; project_name: string; toolAllocations: number; toolQuantity: number; fundPayments: number; posted: number; pending: number };
const money = (value: string | number | null) => `UGX ${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export default function ResourcesDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/projects/resource_allocations/'),
      fetch('http://127.0.0.1:8000/api/projects/fund_transactions/'),
      fetch('http://127.0.0.1:8000/api/projects/'),
    ]).then(async ([allocationResponse, transactionResponse, projectResponse]) => {
      const allocationPayload = allocationResponse.ok ? await allocationResponse.json() : [];
      const transactionPayload = transactionResponse.ok ? await transactionResponse.json() : [];
      const allocationRows: Row[] = (allocationPayload.results || allocationPayload).map((item: { id: string; project: string; project_name: string; resource_type: string; tool_name: string | null; money_purpose: string; money_amount: string | null; allocated_quantity: number | null }) => ({ id: item.id, project: item.project, project_name: item.project_name, name: item.tool_name || item.money_purpose || 'Resource allocation', type: item.resource_type.replace('_', ' '), amount: item.money_amount, quantity: item.allocated_quantity, status: 'ALLOCATED', source: 'allocation' }));
      const paymentRows: Row[] = (transactionPayload.results || transactionPayload).map((item: { id: string; project: string; project_name: string; expense_type: string; description: string; amount: string; status: string }) => ({ id: `payment-${item.id}`, project: item.project, project_name: item.project_name, name: item.description, type: `${item.expense_type.replace('_', ' ')} payment`, amount: item.amount, quantity: null, status: item.status, source: 'payment' }));
      setRows([...allocationRows, ...paymentRows]);
      if (projectResponse.ok) { const data = await projectResponse.json(); setProjects(data.results || data); }
    }).finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => ({
    allocations: rows.filter((row) => row.source === 'allocation').length,
    payments: rows.filter((row) => row.source === 'payment').length,
    posted: rows.filter((row) => row.status === 'POSTED').reduce((sum, row) => sum + Number(row.amount || 0), 0),
    pending: rows.filter((row) => row.status === 'PENDING').reduce((sum, row) => sum + Number(row.amount || 0), 0),
  }), [rows]);
  const projectOverviews = useMemo(() => {
    const overview = new Map<string, ProjectOverview>();
    rows.forEach((row) => {
      const current = overview.get(row.project) || { project: row.project, project_name: row.project_name, toolAllocations: 0, toolQuantity: 0, fundPayments: 0, posted: 0, pending: 0 };
      if (row.source === 'allocation' && row.type === 'company tool') {
        current.toolAllocations += 1;
        current.toolQuantity += Number(row.quantity || 0);
      }
      if (row.source === 'payment') {
        current.fundPayments += 1;
        if (row.status === 'POSTED') current.posted += Number(row.amount || 0);
        if (row.status === 'PENDING') current.pending += Number(row.amount || 0);
      }
      overview.set(row.project, current);
    });
    return [...overview.values()];
  }, [rows]);
  const href = projectId ? `/admin/projects/resources/${projectId}` : '#';
  const cards = [['Formal Allocations', totals.allocations, Wrench, 'from-blue-600 to-blue-700'], ['Fund Payments', totals.payments, DollarSign, 'from-purple-500 to-purple-600'], ['Posted Spend', money(totals.posted), CheckCircle, 'from-green-500 to-green-600'], ['Pending Payments', money(totals.pending), AlertCircle, 'from-amber-500 to-amber-600']] as const;

  return <div className="min-h-screen flex">
    <Sidebar activePath="/admin/projects/resources" />
    <div className="flex-1 ml-64 min-h-screen"><Topbar title="Project Resources" subtitle="Review project tools, working budgets, and fund payments" onSearch={() => undefined} />
      <main className="p-6 space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, colour]) => <div key={label} className="rounded-2xl border border-blue-100/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,.04)]"><div className="flex items-center justify-between"><span className="text-[13px] font-medium text-blue-400">{label}</span><span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colour}`}><Icon size={17} className="text-white" /></span></div><div className="font-serif mt-4 text-[28px] font-semibold leading-none text-blue-950">{value}</div></div>)}</div>
        <div className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.04)]"><div className="flex flex-wrap gap-3"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="min-w-72 flex-1 rounded-lg border border-blue-200 px-4 py-2.5 text-blue-900"><option value="">Select a project to view or add resources</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.project_reference} — {project.name}</option>)}</select><Link href={href} onClick={(event) => !projectId && event.preventDefault()} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${projectId ? 'border border-blue-600 text-blue-700 hover:bg-blue-50' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}>View project</Link><Link href={href} onClick={(event) => !projectId && event.preventDefault()} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${projectId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}>{projectId ? '+ Add / request resource' : 'Select a project first'}</Link></div></div>
        <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,.04)]"><div className="border-b border-blue-50 px-6 py-4"><h2 className="text-[15px] font-semibold text-blue-900">Project Resource Overview</h2><p className="mt-1 text-xs text-blue-500">One row per project. Tool allocations are highlighted here; individual fund payments are available after opening the project.</p></div><div className="overflow-x-auto"><table className="min-w-full"><thead className="bg-blue-50/60"><tr>{['Project', 'Tools Allocated', 'Fund Activity', 'Action'].map((heading) => <th key={heading} className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-blue-500">{heading}</th>)}</tr></thead><tbody>{projectOverviews.map((project) => <tr key={project.project} className="border-t border-blue-50 hover:bg-blue-50/40"><td className="px-6 py-4 font-medium text-blue-900">{project.project_name}</td><td className="px-6 py-4">{project.toolAllocations ? <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{project.toolQuantity} tool(s) in {project.toolAllocations} allocation(s)</span> : <span className="text-blue-400">No tools allocated</span>}</td><td className="px-6 py-4">{project.fundPayments ? <span className="text-blue-700">{project.fundPayments} payment(s) · {money(project.posted)} posted{project.pending ? ` · ${money(project.pending)} pending` : ''}</span> : <span className="text-blue-400">No fund activity</span>}</td><td className="px-6 py-4"><Link href={`/admin/projects/resources/${project.project}`} className="text-sm font-medium text-blue-600 hover:underline">View details</Link></td></tr>)}{loading && <tr><td colSpan={4} className="px-6 py-10 text-center text-blue-400">Loading project resources…</td></tr>}{!loading && projectOverviews.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-blue-400">No project resources or payments have been recorded yet.</td></tr>}</tbody></table></div></div>
      </main>
    </div>
  </div>;
}

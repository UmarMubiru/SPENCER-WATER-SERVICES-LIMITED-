'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '../../../../components/AdminLayout';

const API = 'http://127.0.0.1:8000/api/projects';

type Worker = { id: number; full_name: string; phone: string; next_of_kin: string; payment_type: 'piece_rate' | 'daily_rate'; piece_rate: string | number; daily_rate: string | number; is_active: boolean };
type Task = { id: number; title: string; arrangement: string; payment_rule: string; total_amount: string; target_quantity: string; approved_quantity: string; unit: string; earned_amount: string; status: string; assignments: { worker_name: string }[] };

export default function CasualWorkPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', arrangement: 'individual', payment_rule: 'progress', total_amount: '', target_quantity: '', unit: '' });

  const load = async () => {
    const [taskResponse, workerResponse] = await Promise.all([
      fetch(`${API}/casual_work_tasks/?project=${projectId}`),
      fetch(`${API}/casual_workers/?project=${projectId}`),
    ]);
    if (taskResponse.ok) { const data = await taskResponse.json(); setTasks(data.results || data); }
    if (workerResponse.ok) { const data = await workerResponse.json(); const list = data.results || data; setWorkers(Array.isArray(list) ? list.filter((worker) => worker.is_active) : []); }
  };
  useEffect(() => { load(); }, [projectId]);

  const createTask = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedWorkers.length === 0) { setError('Assign at least one casual worker to this task.'); return; }
    if (form.arrangement === 'individual' && selectedWorkers.length !== 1) { setError('An individual task must have exactly one worker.'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch(`${API}/casual_work_tasks/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, project: projectId, status: 'in_progress' }) });
      if (!response.ok) { setError('Could not create the task. Check the agreed amount and coverage.'); return; }
      const task = await response.json();
      await Promise.all(selectedWorkers.map((casual_worker) => fetch(`${API}/casual_work_assignments/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: task.id, casual_worker }) })));
      setForm({ title: '', description: '', arrangement: 'individual', payment_rule: 'progress', total_amount: '', target_quantity: '', unit: '' });
      setSelectedWorkers([]); await load();
    } catch { setError('Network error. Please try again.'); } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Casual Work & Payments" subtitle="Create any field task and measure approved work" activePath="/admin/projects">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center"><Link href={`/admin/projects/management/${projectId}`} className="text-sm text-blue-600 hover:underline">← Project management</Link><Link href={`/admin/projects/casual-workers/create?project=${projectId}`} className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg">Add casual worker</Link></div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center"><div><h2 className="font-semibold">Active Casual Workers</h2><p className="text-sm text-gray-500">Workers currently available for this project’s field tasks.</p></div><span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">{workers.length} active</span></div>
          {workers.length === 0 ? <p className="p-6 text-center text-gray-500">No active casual workers yet. Add one to begin assigning field tasks.</p> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-gray-500"><tr><th className="p-3">Worker</th><th className="p-3">Phone</th><th className="p-3">Next of Kin</th><th className="p-3">Payment Basis</th><th className="p-3">Rate</th></tr></thead><tbody>{workers.map((worker) => <tr className="border-t" key={worker.id}><td className="p-3 font-medium">{worker.full_name}</td><td className="p-3">{worker.phone}</td><td className="p-3">{worker.next_of_kin || '—'}</td><td className="p-3">{worker.payment_type === 'piece_rate' ? 'Piece rate' : 'Daily rate'}</td><td className="p-3">UGX {Number(worker.payment_type === 'piece_rate' ? worker.piece_rate : worker.daily_rate).toLocaleString()}</td></tr>)}</tbody></table></div>}
        </div>
        <form onSubmit={createTask} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div><h2 className="text-lg font-semibold">New field work task</h2><p className="text-sm text-gray-600">Use your own description and unit—there is no fixed activity list.</p></div>
          {error && <p className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Task name, e.g. Clear field behind tank" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input required placeholder="Unit, e.g. metres, holes, acres, days" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input required type="number" min="0.01" step="0.01" placeholder="Total agreed amount (UGX)" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} className="border rounded-lg px-3 py-2" />
            <input required type="number" min="0.01" step="0.01" placeholder="Total expected coverage" value={form.target_quantity} onChange={(e) => setForm({ ...form, target_quantity: e.target.value })} className="border rounded-lg px-3 py-2" />
            <select value={form.arrangement} onChange={(e) => setForm({ ...form, arrangement: e.target.value })} className="border rounded-lg px-3 py-2"><option value="individual">Individual work</option><option value="group">Group work</option></select>
            <select value={form.payment_rule} onChange={(e) => setForm({ ...form, payment_rule: e.target.value })} className="border rounded-lg px-3 py-2"><option value="progress">Pay approved coverage progressively</option><option value="completion">Pay only after approved completion</option><option value="daily">Daily service (use days as the unit)</option></select>
          </div>
          <textarea placeholder="Optional task description or quality requirements" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          <div><p className="text-sm font-medium mb-2">Assigned workers</p><div className="flex flex-wrap gap-3">{workers.map((worker) => <label key={worker.id} className="text-sm flex gap-2 items-center"><input type="checkbox" checked={selectedWorkers.includes(worker.id)} onChange={() => setSelectedWorkers(selectedWorkers.includes(worker.id) ? selectedWorkers.filter((id) => id !== worker.id) : [...selectedWorkers, worker.id])} />{worker.full_name}</label>)}</div></div>
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Create task'}</button>
        </form>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden"><div className="p-5 border-b"><h2 className="font-semibold">Active task register</h2></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-gray-500"><tr><th className="p-3">Task</th><th className="p-3">Workers</th><th className="p-3">Coverage</th><th className="p-3">Earned</th><th className="p-3"></th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-t"><td className="p-3"><div className="font-medium">{task.title}</div><div className="text-gray-500">{task.payment_rule.replace('_', ' ')}, UGX {Number(task.total_amount).toLocaleString()}</div></td><td className="p-3">{task.assignments.map((a) => a.worker_name).join(', ')}</td><td className="p-3">{task.approved_quantity} / {task.target_quantity} {task.unit}</td><td className="p-3">UGX {Number(task.earned_amount).toLocaleString()}</td><td className="p-3"><Link className="text-blue-600 hover:underline" href={`/admin/projects/management/${projectId}/casual-work/${task.id}`}>Record work</Link></td></tr>)}</tbody></table></div></div>
      </div>
    </AdminLayout>
  );
}

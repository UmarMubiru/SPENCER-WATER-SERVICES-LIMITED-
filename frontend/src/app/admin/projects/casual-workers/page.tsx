'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../../components/AdminLayout';

type Project = { id: string; name: string; project_reference: string };

export default function CasualWorkersDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]); const [projectId, setProjectId] = useState('');
  useEffect(() => { fetch('http://127.0.0.1:8000/api/projects/').then(async (response) => { if (response.ok) { const data = await response.json(); setProjects(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []); } }); }, []);
  const manageHref = projectId ? `/admin/projects/management/${projectId}/casual-work` : '#';
  const addHref = projectId ? `/admin/projects/casual-workers/create?project=${projectId}` : '#';
  return <AdminLayout title="Casual Workers & Payment" subtitle="Select a project to create workers, assign work, and manage payment" activePath="/admin/projects/casual-workers"><div className="p-6 max-w-4xl mx-auto"><div className="bg-white border rounded-2xl p-6"><h2 className="text-lg font-semibold">Choose a project</h2><p className="text-sm text-gray-600 mt-1">Casual workers and their task payments are always managed within a project.</p><div className="flex flex-wrap gap-3 mt-5"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="border rounded-lg px-3 py-2 min-w-72"><option value="">Select project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.project_reference} — {project.name}</option>)}</select><Link href={addHref} onClick={(event) => !projectId && event.preventDefault()} className="px-4 py-2 bg-green-600 text-white rounded-lg">+ Add Casual Worker</Link><Link href={manageHref} onClick={(event) => !projectId && event.preventDefault()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Manage Work & Payment</Link></div></div></div></AdminLayout>;
}

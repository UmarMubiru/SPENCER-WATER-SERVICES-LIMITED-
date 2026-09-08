'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../../components/AdminLayout';

type Project = { id: string; name: string; project_reference: string };
type Allocation = { 
  id: number; 
  project: string; 
  project_name: string; 
  employee_name: string; 
  job_title_name: string; 
  project_role_name: string;
  assigned_date: string; 
  is_active: boolean 
};

export default function RoleAllocationsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/projects/'),
      fetch('http://127.0.0.1:8000/api/projects/role_allocations/')
    ]).then(async ([projectsResponse, allocationsResponse]) => {
      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        setProjects(data.results || data);
      }
      if (allocationsResponse.ok) {
        const data = await allocationsResponse.json();
        setAllocations(data.results || data);
      }
    });
  }, []);

  const href = projectId ? `/admin/projects/management/${projectId}/role-assignment` : '#';

  return (
    <AdminLayout 
      title="Role Allocations" 
      subtitle="Employee roles across all projects" 
      activePath="/admin/projects/role-assignments"
    >
      <div className="p-6 space-y-5">
        <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <select 
            value={projectId} 
            onChange={(event) => setProjectId(event.target.value)} 
            className="border rounded-lg px-3 py-2 min-w-64"
          >
            <option value="">Select a project for an action</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_reference} — {project.name}
              </option>
            ))}
          </select>
          <Link 
            href={href} 
            onClick={(event) => !projectId && event.preventDefault()} 
            className="px-4 py-2 border border-blue-600 text-blue-700 rounded-lg"
          >
            View
          </Link>
          <Link 
            href={href} 
            onClick={(event) => !projectId && event.preventDefault()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Add allocation
          </Link>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Job Title</th>
                <th className="p-4">Project Role</th>
                <th className="p-4">Assigned</th>
                <th className="p-4">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => (
                <tr key={allocation.id} className="border-t">
                  <td className="p-4">{allocation.project_name}</td>
                  <td className="p-4">{allocation.employee_name}</td>
                  <td className="p-4">{allocation.job_title_name || '—'}</td>
                  <td className="p-4">
                    {allocation.project_role_name ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {allocation.project_role_name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-4">{allocation.assigned_date}</td>
                  <td className="p-4">
                    {allocation.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/projects/management/${allocation.project}/role-assignment`} className="text-blue-600">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
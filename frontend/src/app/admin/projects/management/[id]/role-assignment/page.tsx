'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminLayout } from '../../../../components/AdminLayout';

const API = 'http://127.0.0.1:8000/api';

type Employee = { id: number; full_name: string; job_title?: number; job_title_name?: string };
type JobTitle = { id: number; title: string };
type ProjectRole = { id: number; name: string; description: string };
type Assignment = { 
  id: number; 
  employee_name: string; 
  job_title_name: string; 
  project_role_name: string;
  assigned_date: string; 
  is_active: boolean 
};

const listFrom = <T,>(data: unknown, namedKey?: string): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;
    if (Array.isArray(payload.results)) return payload.results as T[];
    if (namedKey && Array.isArray(payload[namedKey])) return payload[namedKey] as T[];
  }
  return [];
};

export default function RoleAssignmentPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    employee: '', 
    job_title: '', 
    project_role: '' 
  });

  const load = async () => {
    const [assignmentResponse, employeeResponse, jobTitleResponse, projectRoleResponse] = await Promise.all([
      fetch(`${API}/projects/role_allocations/?project=${projectId}`),
      fetch(`${API}/employees/employees/?status=available`),
      fetch(`${API}/employees/job-titles/`),
      fetch(`${API}/projects/roles/`)
    ]);
    
    if (assignmentResponse.ok) {
      setAssignments(listFrom<Assignment>(await assignmentResponse.json(), 'assignments'));
    }
    if (employeeResponse.ok) {
      setEmployees(listFrom<Employee>(await employeeResponse.json(), 'employees'));
    }
    if (jobTitleResponse.ok) {
      setJobTitles(listFrom<JobTitle>(await jobTitleResponse.json(), 'job_titles'));
    }
    if (projectRoleResponse.ok) {
      setProjectRoles(listFrom<ProjectRole>(await projectRoleResponse.json()));
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    
    const response = await fetch(`${API}/projects/${projectId}/assign_employee/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...form, 
        project: projectId 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      setError(errorData.error || 'Could not assign this employee.');
      return;
    }
    
    setForm({ employee: '', job_title: '', project_role: '' });
    load();
  };

  return (
    <AdminLayout 
      title="Project Role Assignment" 
      subtitle="Assign available employees and responsibilities to this project" 
      activePath="/admin/projects"
    >
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href={`/admin/projects/management/${projectId}`} className="text-sm text-blue-600 hover:underline">
            ← Project Monitoring
          </Link>
          <Link href={`/admin/projects/management/${projectId}/casual-work`} className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg">
            Casual Workers & Payment
          </Link>
        </div>

        <form onSubmit={assign} className="bg-white border rounded-xl p-6 grid md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-sm block mb-1">Available employee</label>
            <select 
              required 
              value={form.employee} 
              onChange={(e) => {
                const selectedEmployee = employees.find(emp => emp.id === parseInt(e.target.value));
                console.log('Selected employee:', selectedEmployee);
                console.log('Job title from employee:', selectedEmployee?.job_title);
                console.log('Job title name from employee:', selectedEmployee?.job_title_name);
                
                // Try to find matching job title by name
                const matchingJobTitle = jobTitles.find(jt => 
                  jt.title === selectedEmployee?.job_title_name
                );
                
                setForm({ 
                  ...form, 
                  employee: e.target.value,
                  job_title: (selectedEmployee?.job_title?.toString() || matchingJobTitle?.id?.toString() || '')
                });
              }} 
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select available employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Job Title</label>
            <select 
              value={form.job_title} 
              onChange={(e) => setForm({ ...form, job_title: e.target.value })} 
              className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              disabled
            >
              <option value="">Select employee first</option>
              {jobTitles.map((jobTitle) => (
                <option key={jobTitle.id} value={jobTitle.id}>
                  {jobTitle.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {form.job_title ? 
                `Auto-filled: ${employees.find(e => e.id === parseInt(form.employee))?.job_title_name || 'Unknown'}` : 
                'Auto-filled from employee profile'
              }
            </p>
          </div>

          <div>
            <label className="text-sm block mb-1">Project Role</label>
            <select 
              value={form.project_role} 
              onChange={(e) => setForm({ ...form, project_role: e.target.value })} 
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">No specific project role</option>
              {projectRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Assign</button>

          {error && <p className="text-sm text-red-700 md:col-span-4">{error}</p>}
        </form>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-5 border-b font-semibold">Assigned team</div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Job Title</th>
                <th className="p-4">Project Role</th>
                <th className="p-4">Assigned Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-t">
                  <td className="p-4">{assignment.employee_name}</td>
                  <td className="p-4">{assignment.job_title_name || '—'}</td>
                  <td className="p-4">
                    {assignment.project_role_name ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {assignment.project_role_name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-4">{assignment.assigned_date}</td>
                  <td className="p-4">
                    {assignment.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>
                    )}
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
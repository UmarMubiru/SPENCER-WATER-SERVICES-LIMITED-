'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';
import DashboardCard from '../../../../components/admin/ui/DashboardCard';
import StatusBadge from '../../../../components/admin/ui/StatusBadge';
import { FolderTree, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  project_reference: string;
  name: string;
  status: string;
  completion_percentage: number;
  planned_end_date: string;
  service_line: string;
  created_at: string;
  planned_start_date: string;
  is_archived: boolean;
  approved_by_name?: string;
  approved_at?: string;
  approval_notes?: string;
}

export default function ProjectsDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', icon: FolderTree, tint: 'from-blue-600 to-blue-700' },
    { label: 'Pending Approval', value: '0', icon: AlertCircle, tint: 'from-blue-400 to-blue-600' },
    { label: 'In Progress', value: '0', icon: Clock, tint: 'from-sky-500 to-blue-600' },
    { label: 'Completed', value: '0', icon: CheckCircle, tint: 'from-blue-800 to-blue-950' },
  ]);
  const [filters, setFilters] = useState({
    status: '',
    serviceLine: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.serviceLine) {
      filtered = filtered.filter(project => project.service_line === filters.serviceLine);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(project => new Date(project.created_at) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(project => new Date(project.created_at) <= new Date(filters.dateTo));
    }

    setFilteredProjects(filtered);
  };

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/?show_archived=${showArchived}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);

        // Calculate stats
        const total = data.length;
        const pendingApproval = data.filter((p: Project) => p.status === 'pending_approval').length;
        const inProgress = data.filter((p: Project) => p.status === 'in_progress').length;
        const completed = data.filter((p: Project) => p.status === 'completed').length;

        setStats([
          { label: 'Total Projects', value: total.toString(), icon: FolderTree, tint: 'from-blue-600 to-blue-700' },
          { label: 'Pending Approval', value: pendingApproval.toString(), icon: AlertCircle, tint: 'from-blue-400 to-blue-600' },
          { label: 'In Progress', value: inProgress.toString(), icon: Clock, tint: 'from-sky-500 to-blue-600' },
          { label: 'Completed', value: completed.toString(), icon: CheckCircle, tint: 'from-blue-800 to-blue-950' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this project?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/archive/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchProjects();
      } else {
        alert('Error archiving project');
      }
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Error archiving project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProjects();
      } else {
        alert('Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  return (
    <AdminLayout
      title="Project Management"
      subtitle="Track projects, milestones, and team assignments"
      activePath="/admin/projects/dashboard"
    >
      <div className="space-y-4 p-5 md:p-6">
        {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <DashboardCard
                  key={index}
                  label={stat.label}
                  value={stat.value}
                  icon={stat.icon}
                  tint={stat.tint}
                />
              ))}
            </div>

            {/* Projects Table */}
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
              <div className="border-b border-blue-100 px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900 text-base">Active Projects</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm ${showArchived ? 'bg-blue-50 border-blue-300 text-blue-700 border' : 'bg-white border border-blue-200 hover:bg-blue-50 text-blue-900'}`}
                    >
                      {showArchived ? 'Hide Archived' : 'Show Archived'}
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Service Line</label>
                    <select
                      value={filters.serviceLine}
                      onChange={(e) => setFilters(prev => ({ ...prev, serviceLine: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">All Service Lines</option>
                      {[...new Set(projects.map(project => project.service_line))].map(line => (
                        <option key={line} value={line}>{line}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Date To</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="p-6 text-center text-blue-400 text-sm">Loading projects...</div>
              ) : filteredProjects.length === 0 ? (
                <div className="p-6 text-center text-blue-400 text-sm">No projects found matching your filters.</div>
              ) : (
                <>
                  <div className="border-b border-blue-100 px-4 py-2.5 flex items-center justify-between bg-gray-50">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages} ({filteredProjects.length} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="overflow-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Reference</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Project Name</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Service</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Status</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Progress</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Deadline</th>
                          <th className="px-4 py-3 text-left text-blue-700 text-xs">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProjects.map((project) => (
                        <tr key={project.id} className="border-t border-blue-50">
                          <td className="px-4 py-3 text-blue-900 text-sm">{project.project_reference}</td>
                          <td className="px-4 py-3 text-blue-900 text-sm">{project.name}</td>
                          <td className="px-4 py-3 text-blue-900 text-sm">{project.service_line.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={project.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-blue-100 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
                              </div>
                              <span className="text-xs font-medium text-blue-900">{project.completion_percentage}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-blue-900 text-sm">{project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : 'Not set'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Link href={`/admin/projects/details/${project.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                              {showArchived ? (
                                <button
                                  onClick={() => handleDelete(project.id)}
                                  className="text-red-600 hover:underline text-sm"
                                >
                                  Delete
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleArchive(project.id)}
                                  className="text-blue-600 hover:underline text-sm"
                                >
                                  Archive
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          </div>
    </AdminLayout>
  );
}

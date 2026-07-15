'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import Link from 'next/link';

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
}

export default function ProjectsDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Projects', value: '0', change: 'Loading...', color: 'blue' },
    { label: 'In Progress', value: '0', change: 'Loading...', color: 'green' },
    { label: 'Completed', value: '0', change: 'Loading...', color: 'green' },
    { label: 'Delayed', value: '0', change: 'Loading...', color: 'red' },
  ]);
  const [filters, setFilters] = useState({
    status: '',
    serviceLine: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        
        // Calculate stats
        const total = data.length;
        const inProgress = data.filter((p: Project) => p.status === 'in_progress').length;
        const completed = data.filter((p: Project) => p.status === 'completed').length;
        const delayed = data.filter((p: Project) => p.status === 'on_hold').length;
        
        setStats([
          { label: 'Total Projects', value: total.toString(), change: `${total} active projects`, color: 'blue' },
          { label: 'In Progress', value: inProgress.toString(), change: 'Currently active', color: 'green' },
          { label: 'Completed', value: completed.toString(), change: 'Successfully delivered', color: 'green' },
          { label: 'On Hold', value: delayed.toString(), change: 'Needs attention', color: 'red' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchProjects(); // Refresh the list
      } else {
        alert('Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Project Management"
          subtitle="Track projects, milestones, and team assignments"
          onSearch={(q) => console.log('Search projects:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div 
                  key={index} 
                  className={`${colors.bg} rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => {
                    // Click handler for cards
                    if (stat.label === 'In Progress') {
                      setFilters(prev => ({ ...prev, status: 'in_progress' }));
                    } else if (stat.label === 'Completed') {
                      setFilters(prev => ({ ...prev, status: 'completed' }));
                    } else if (stat.label === 'On Hold') {
                      setFilters(prev => ({ ...prev, status: 'on_hold' }));
                    } else {
                      // Reset filters for other cards
                      setFilters({ status: '', serviceLine: '', dateFrom: '', dateTo: '' });
                    }
                  }}
                >
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
                <Link href="/admin/projects/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + New Project
                </Link>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Line</label>
                  <select
                    value={filters.serviceLine}
                    onChange={(e) => setFilters(prev => ({ ...prev, serviceLine: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Service Lines</option>
                    {[...new Set(projects.map(project => project.service_line))].map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No projects found matching your filters.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Reference</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Project Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Service</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Progress</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Deadline</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{project.project_reference}</td>
                      <td className="py-4 px-6 text-gray-700">{project.name}</td>
                      <td className="py-4 px-6 text-gray-700">{project.service_line.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'not_started' ? 'bg-gray-100 text-gray-700' :
                          project.status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{project.completion_percentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : 'Not set'}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <Link href={`/admin/projects/details/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium">View</Link>
                          <Link href={`/admin/projects/edit/${project.id}`} className="text-green-600 hover:text-green-800 font-medium">Edit</Link>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

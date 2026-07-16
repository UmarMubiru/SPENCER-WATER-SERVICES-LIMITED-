'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  project_reference: string;
  name: string;
  service_line: string;
  scope_description: string;
  site_location: string;
  contract_value: number;
  status: string;
  completion_percentage: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_completion_date: string;
  created_at: string;
  updated_at: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  target_date: string;
  status: string;
  order: number;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchProjectDetails();
    fetchMilestones();
  }, [resolvedParams.id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${resolvedParams.id}/`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        setError('Failed to load project details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/milestones/?project=${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setMilestones(data);
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'progress', label: 'Progress' },
    { id: 'resources', label: 'Resources' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'documents', label: 'Documents' },
  ];

  if (loading) {
    return (
      <AdminLayout
        title="Loading..."
        subtitle="Project Details"
        activePath="/admin/projects/details"
        onSearch={() => {}}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !project) {
    return (
      <AdminLayout
        title="Error"
        subtitle="Project Details"
        activePath="/admin/projects/details"
        onSearch={() => {}}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error || 'Project not found'}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={project.name}
      subtitle={`Reference: ${project.project_reference}`}
      activePath="/admin/projects/details"
      onSearch={(q) => console.log('Search:', q)}
    >
        <div className="p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Project Reference</h3>
                    <p className="text-lg font-semibold text-gray-900">{project.project_reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Service Line</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {project.service_line.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'not_started' ? 'bg-gray-100 text-gray-700' :
                      project.status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Completion</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{project.completion_percentage}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Planned Start Date</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {project.planned_start_date ? new Date(project.planned_start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Planned End Date</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Contract Value</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      UGX {project.contract_value?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Site Location</h3>
                    <p className="text-lg font-semibold text-gray-900">{project.site_location || 'Not specified'}</p>
                  </div>
                </div>

                {project.scope_description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Scope Description</h3>
                    <p className="text-gray-900">{project.scope_description}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/projects/edit/${project.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                  >
                    Edit Project
                  </Link>
                  <button
                    onClick={() => router.push('/admin/projects/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    + Add Milestone
                  </button>
                </div>
                {milestones.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No milestones defined yet.</div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              milestone.status === 'blocked' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {milestone.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              Target: {new Date(milestone.target_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="text-center text-gray-500 py-8">
                Progress tracking features coming soon.
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="text-center text-gray-500 py-8">
                Resource management features coming soon.
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="text-center text-gray-500 py-8">
                Project gallery features coming soon.
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="text-center text-gray-500 py-8">
                Document management features coming soon.
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
}

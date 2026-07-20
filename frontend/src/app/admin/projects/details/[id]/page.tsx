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
  is_archived: boolean;
}

interface FieldHistory {
  id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by_name: string;
  changed_at: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  target_date: string;
  status: string;
  order: number;
}

interface ResourceSummary {
  company_tools: {
    tool_name: string;
    category: string;
    total_allocated: number;
  }[];
  total_money: number;
  money_allocations: {
    id: string;
    money_amount: number;
    money_purpose: string;
    remaining_amount: number;
  }[];
}

interface ProjectDocument {
  id: string;
  document_type: string;
  caption: string;
  file: string;
  uploaded_at: string;
}

interface ActivityImage {
  id: string;
  image: string;
  caption: string;
  uploaded_at: string;
  activity_name: string;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [activityImages, setActivityImages] = useState<ActivityImage[]>([]);
  const [resourceSummary, setResourceSummary] = useState<ResourceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchProjectDetails();
    fetchDocuments();
    fetchActivityImages();
    fetchResourceSummary();
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

  const fetchResourceSummary = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${resolvedParams.id}/resources_summary/`);
      if (response.ok) {
        const data = await response.json();
        setResourceSummary(data);
      }
    } catch (err) {
      console.error('Error fetching resource summary:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/documents/?project=${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchActivityImages = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${resolvedParams.id}/activity_images/`);
      if (response.ok) {
        const data = await response.json();
        setActivityImages(data);
      }
    } catch (err) {
      console.error('Error fetching activity images:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
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
                    href={`/admin/projects/${project.project_reference}/schedule`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                  >
                    Update Activities
                  </Link>
                  {project.is_archived && (
                    <button
                      onClick={async () => {
                        if (confirm('Unarchive this project? It will be restored to the active list.')) {
                          try {
                            const response = await fetch(`http://127.0.0.1:8000/api/projects/${project.id}/unarchive/`, {
                              method: 'POST',
                            });
                            if (response.ok) {
                              router.push('/admin/projects/dashboard');
                            } else {
                              alert('Error unarchiving project');
                            }
                          } catch (error) {
                            alert('Error unarchiving project');
                          }
                        }
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Unarchive Project
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/admin/projects/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Progress</h3>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-2xl font-bold text-gray-900">{project.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${project.completion_percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Planned Start</p>
                      <p className="font-semibold text-gray-900">
                        {project.planned_start_date ? new Date(project.planned_start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Planned End</p>
                      <p className="font-semibold text-gray-900">
                        {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Resource Summary</h3>
                {!resourceSummary ? (
                  <div className="text-center text-gray-500 py-8">Loading resources...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Company Tools */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-4">Company Tools</h4>
                      {resourceSummary.company_tools.length === 0 ? (
                        <div className="text-gray-500">No company tools allocated.</div>
                      ) : (
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resourceSummary.company_tools.map((tool, index) => (
                              <tr key={index} className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-900">{tool.tool_name}</td>
                                <td className="px-4 py-3 text-gray-600">{tool.category || 'N/A'}</td>
                                <td className="px-4 py-3 text-right text-gray-900">{tool.total_allocated}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Money */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-4">Money Allocations</h4>
                      <div className="mb-4">
                        <span className="text-sm text-gray-600">Total Money: </span>
                        <span className="text-lg font-semibold text-gray-900">UGX {resourceSummary.total_money.toLocaleString()}</span>
                      </div>
                      {resourceSummary.money_allocations.length === 0 ? (
                        <div className="text-gray-500">No money allocations.</div>
                      ) : (
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Purpose</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Allocated</th>
                              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resourceSummary.money_allocations.map((allocation) => (
                              <tr key={allocation.id} className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-900">{allocation.money_purpose || 'General'}</td>
                                <td className="px-4 py-3 text-right text-gray-900">UGX {allocation.money_amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-900">UGX {allocation.remaining_amount?.toLocaleString() || '0'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Gallery</h3>
                {activityImages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No activity images uploaded yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activityImages.map((img) => (
                      <div key={img.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={`http://127.0.0.1:8000${img.image}`} 
                          alt={img.caption || 'Activity image'} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900">{img.activity_name || 'Activity'}</p>
                          <p className="text-sm text-gray-700">{img.caption || 'No caption'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(img.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Documents</h3>
                {documents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No documents uploaded yet.</div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{doc.caption || 'Document'}</p>
                          <p className="text-sm text-gray-600">
                            Type: {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <a 
                          href={`http://127.0.0.1:8000${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  project_reference: string;
  name: string;
  service_line: string;
  status: string;
  completion_percentage: number;
  planned_start_date: string;
  actual_start_date: string | null;
  planned_end_date: string;
  actual_end_date: string | null;
  contract_value: number;
  site_location: string;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  planned_date: string;
  actual_date: string | null;
  status: string;
}

export default function CustomerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/');

      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMilestones = async (projectId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/milestones/`);

      if (response.ok) {
        const data = await response.json();
        setMilestones(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    loadProjectMilestones(project.id);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMilestoneStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'delayed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/portal/dashboard" className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900">My Projects</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProject ? (
          /* Project Detail View */
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-4 text-blue-600 hover:text-blue-700"
            >
              ← Back to Projects
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{selectedProject.project_reference}</h2>
                <p className="text-sm text-gray-600">{selectedProject.name}</p>
              </div>

              <div className="px-6 py-6">
                {/* Project Status and Progress */}
                <div className="flex justify-between items-center mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{selectedProject.completion_percentage}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${selectedProject.completion_percentage}%` }}
                  />
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Service</div>
                    <div className="font-medium text-gray-900">{selectedProject.service_line.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium text-gray-900">{selectedProject.site_location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Contract Value</div>
                    <div className="font-medium text-gray-900">{formatCurrency(selectedProject.contract_value)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Planned Start</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedProject.planned_start_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Actual Start</div>
                    <div className="font-medium text-gray-900">
                      {selectedProject.actual_start_date
                        ? new Date(selectedProject.actual_start_date).toLocaleDateString()
                        : 'Not started'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Planned End</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedProject.planned_end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
              </div>
              <div className="px-6 py-6">
                {milestones.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No milestones defined for this project yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                            milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                            milestone.status === 'delayed' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {milestone.status === 'completed' ? '✓' : index + 1}
                          </div>
                          {index < milestones.length - 1 && (
                            <div className="w-0.5 h-16 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <span>Planned: {new Date(milestone.planned_date).toLocaleDateString()}</span>
                            {milestone.actual_date && (
                              <span className="ml-4">Actual: {new Date(milestone.actual_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Projects List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Projects</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No projects found. Projects will appear here after your quotations are accepted.
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{project.project_reference}</div>
                        <div className="text-sm text-gray-600">{project.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{project.site_location}</div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{project.completion_percentage}%</div>
                          <div className="text-xs text-gray-600">Complete</div>
                        </div>
                        <div className="w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${project.completion_percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

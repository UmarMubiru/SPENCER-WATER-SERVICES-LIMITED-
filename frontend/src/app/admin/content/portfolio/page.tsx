'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  client_name: string;
  location: string;
  completion_date: string;
  project_type: string;
  cover_image?: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    featured: '',
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
      filtered = filtered.filter(p => 
        filters.status === 'active' ? p.is_active : !p.is_active
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(p => p.project_type === filters.type);
    }
    
    if (filters.featured) {
      filtered = filtered.filter(p => 
        filters.featured === 'featured' ? p.is_featured : !p.is_featured
      );
    }
    
    setFilteredProjects(filtered);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/content/portfolio/');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data.sort((a: Project, b: Project) => a.display_order - b.display_order) : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/portfolio/${id}/`, {
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

  const handleToggleFeatured = async (project: Project) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/portfolio/${project.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !project.is_featured }),
      });
      
      if (response.ok) {
        fetchProjects();
      } else {
        alert('Error updating project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const handleToggleActive = async (project: Project) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/content/portfolio/${project.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !project.is_active }),
      });
      
      if (response.ok) {
        fetchProjects();
      } else {
        alert('Error updating project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    }
  };

  const openDetailsModal = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const stats = [
    { label: 'Total Projects', value: projects.length, color: 'blue' },
    { label: 'Featured', value: projects.filter(p => p.is_featured).length, color: 'purple' },
    { label: 'Active', value: projects.filter(p => p.is_active).length, color: 'green' },
    { label: 'Inactive', value: projects.filter(p => !p.is_active).length, color: 'gray' },
  ];

  const projectTypes = [...new Set(projects.map(p => p.project_type))];

  return (
    <AdminLayout
      title="Portfolio Management"
      subtitle="Manage completed projects with images and write-ups"
      activePath="/admin/content/portfolio"
      onSearch={(q) => console.log('Search projects:', q)}
    >
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', valueColor: 'text-green-700' },
                gray: { bg: 'bg-gray-50', valueColor: 'text-gray-700' },
                purple: { bg: 'bg-purple-50', valueColor: 'text-purple-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Projects Grid */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Projects</h2>
                <Link
                  href="/admin/content/portfolio/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Project
                </Link>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                  <select
                    value={filters.featured}
                    onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="featured">Featured</option>
                    <option value="not-featured">Not Featured</option>
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No projects found matching your filters.</div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video bg-gray-100">
                        {project.cover_image ? (
                          <img
                            src={project.cover_image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No cover image
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {project.is_featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{project.client_name}</span>
                          <span>•</span>
                          <span>{project.location}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailsModal(project)}
                            className="flex-1 px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(project)}
                            className="flex-1 px-3 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 text-sm font-medium"
                          >
                            {project.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Details Modal */}
      {showDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Title</p>
                <p className="text-lg font-semibold text-gray-900">{selectedProject.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-gray-700 mt-1">{selectedProject.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Client</p>
                  <p className="text-gray-700">{selectedProject.client_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-700">{selectedProject.location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completion Date</p>
                  <p className="text-gray-700">
                    {selectedProject.completion_date 
                      ? new Date(selectedProject.completion_date).toLocaleDateString() 
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Project Type</p>
                  <p className="text-gray-700">{selectedProject.project_type}</p>
                </div>
              </div>
              
              {selectedProject.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Project Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProject.images.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleToggleFeatured(selectedProject);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {selectedProject.is_featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => {
                    handleToggleActive(selectedProject);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {selectedProject.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

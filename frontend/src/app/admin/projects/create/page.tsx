'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    project_reference: '',
    name: '',
    service_line: 'borehole_drilling',
    scope_description: '',
    site_location: '',
    contract_value: '',
    planned_start_date: '',
    planned_end_date: '',
    status: 'not_started',
    completion_percentage: 0,
    is_portfolio_candidate: false,
    latitude: '',
    longitude: '',
    public_description: '',
    cover_image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  
  // Employee assignment state
  const [technicalEmployees, setTechnicalEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [clerkOfWorks, setClerkOfWorks] = useState<number | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    fetchTechnicalEmployees();
  }, []);

  const fetchTechnicalEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/?department=technical&status=available');
      if (response.ok) {
        const data = await response.json();
        setTechnicalEmployees(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch technical employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const serviceOptions = [
    { value: 'borehole_drilling', label: 'Borehole Drilling' },
    { value: 'solar_pump_installation', label: 'Solar Pump Installation' },
    { value: 'solar_power_taps', label: 'Solar Power Taps' },
    { value: 'water_pipe_laying', label: 'Water Pipe Laying' },
    { value: 'water_treatment', label: 'Water Treatment' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const assignEmployeesToProject = async (projectId: number) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Get the Clerk of Works role ID
    const clerkOfWorksResponse = await fetch('http://127.0.0.1:8000/api/projects/roles/');
    const clerkOfWorksData = await clerkOfWorksResponse.json();
    const clerkOfWorksRole = clerkOfWorksData.find((role: any) => role.name === 'Clerk of Works');

    for (const employeeId of selectedEmployees) {
      const isClerkOfWorks = employeeId === clerkOfWorks;
      const projectRoleId = isClerkOfWorks ? clerkOfWorksRole?.id : null;

      await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/assign_employee/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employee: employeeId,
          project_role: projectRoleId,
        }),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let coverImageUrl = '';

      // Upload cover image if provided
      if (coverImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', coverImageFile);
        imageFormData.append('folder', 'projects');

        const imageResponse = await fetch('http://127.0.0.1:8000/api/content/media/', {
          method: 'POST',
          headers: {},
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          coverImageUrl = imageData.url || imageData.image_url;
        }
      }

      const response = await fetch('http://127.0.0.1:8000/api/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contract_value: parseFloat(formData.contract_value) || 0,
          completion_percentage: parseInt(formData.completion_percentage.toString()) || 0,
          cover_image_url: coverImageUrl, // Include uploaded image URL
          public_description: formData.public_description, // Include public description
        }),
      });

      if (response.ok) {
        const projectData = await response.json();
        
        // Assign employees to the project
        if (selectedEmployees.length > 0) {
          await assignEmployeesToProject(projectData.id);
        }
        
        router.push('/admin/projects/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create project');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AdminLayout
      title="Create New Project"
      subtitle="Fill in the details to create a new project"
      activePath="/admin/projects"
    >
      <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8 max-w-6xl mx-auto">
        <div className="rounded-xl border border-blue-100 bg-white overflow-hidden">
          <div className="p-6 border-b border-blue-100">
            <h2 className="font-semibold text-blue-900">Project Information</h2>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 mb-4 mx-6 mt-6 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Reference */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Project Reference *
                </label>
                <input
                  type="text"
                  name="project_reference"
                  value={formData.project_reference}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., PRJ-2026-001"
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter project name"
                />
              </div>

              {/* Service Line */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Service Line *
                </label>
                <select
                  name="service_line"
                  value={formData.service_line}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {serviceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Site Location */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Site Location
                </label>
                <input
                  type="text"
                  name="site_location"
                  value={formData.site_location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter site location"
                />
              </div>

              {/* Contract Value */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Contract Value (UGX)
                </label>
                <input
                  type="number"
                  name="contract_value"
                  value={formData.contract_value}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              {/* Planned Start Date */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Planned Start Date
                </label>
                <input
                  type="date"
                  name="planned_start_date"
                  value={formData.planned_start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Planned End Date */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Planned End Date
                </label>
                <input
                  type="date"
                  name="planned_end_date"
                  value={formData.planned_end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Completion Percentage */}
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Completion Percentage (%)
                </label>
                <input
                  type="number"
                  name="completion_percentage"
                  value={formData.completion_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Latitude</label>
                <input type="number" step="0.000001" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg" placeholder="e.g., 0.347596" />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">Longitude</label>
                <input type="number" step="0.000001" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 rounded-lg" placeholder="e.g., 32.582520" />
              </div>
            </div>

            <label className="mt-6 flex items-center gap-3 text-sm font-medium text-blue-900">
              <input type="checkbox" checked={formData.is_portfolio_candidate} onChange={(event) => setFormData({ ...formData, is_portfolio_candidate: event.target.checked })} />
              Show this project as a public project card
            </label>

            {/* Cover Image Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Featured Image (Cover Image)
              </label>
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-6">
                {coverImagePreview ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview}
                      alt="Cover image preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageFile(null);
                        setCoverImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverImage"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload Cover Image
                    </label>
                    <p className="mt-2 text-sm text-blue-400">This image will be displayed on the project card</p>
                  </div>
                )}
              </div>
            </div>

            {/* Public Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Public Description (for project card)
              </label>
              <textarea
                name="public_description"
                value={formData.public_description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Brief description for the public project card..."
              />
            </div>

            {/* Scope Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Scope Description
              </label>
              <textarea
                name="scope_description"
                value={formData.scope_description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Describe the project scope and objectives..."
              />
            </div>

            {/* Employee Assignment Section */}
            <div className="mt-8 border-t border-blue-200 pt-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Assign Technical Team</h3>
              
              {loadingEmployees ? (
                <p className="text-sm text-blue-600">Loading technical employees...</p>
              ) : technicalEmployees.length === 0 ? (
                <p className="text-sm text-blue-600">No available technical employees found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {technicalEmployees.map((employee) => (
                      <div key={employee.id} className="border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`employee-${employee.id}`}
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmployees([...selectedEmployees, employee.id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                                if (clerkOfWorks === employee.id) {
                                  setClerkOfWorks(null);
                                }
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={`employee-${employee.id}`} className="font-medium text-blue-900 cursor-pointer">
                              {employee.full_name}
                            </label>
                            <p className="text-sm text-blue-600">{employee.job_title_name || 'No job title'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Clerk of Works Selection */}
                  {selectedEmployees.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Select Clerk of Works (from selected team members)
                      </label>
                      <select
                        value={clerkOfWorks || ''}
                        onChange={(e) => setClerkOfWorks(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">-- Select Clerk of Works --</option>
                        {selectedEmployees.map((employeeId) => {
                          const employee = technicalEmployees.find((e) => e.id === employeeId);
                          return (
                            <option key={employeeId} value={employeeId}>
                              {employee?.full_name} ({employee?.job_title_name || 'No job title'})
                            </option>
                          );
                        })}
                      </select>
                      <p className="mt-2 text-xs text-blue-600">
                        One team member should be designated as Clerk of Works for project coordination.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/projects/dashboard')}
                className="px-6 py-2 border border-blue-200 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
  is_portfolio_candidate: boolean;
  priority: string;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_reference: '',
    name: '',
    service_line: '',
    scope_description: '',
    site_location: '',
    contract_value: 0,
    status: 'not_started',
    completion_percentage: 0,
    planned_start_date: '',
    planned_end_date: '',
    actual_start_date: '',
    actual_completion_date: '',
    is_portfolio_candidate: false,
    priority: 'medium',
  });

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${params.id}/`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          project_reference: data.project_reference || '',
          name: data.name || '',
          service_line: data.service_line || '',
          scope_description: data.scope_description || '',
          site_location: data.site_location || '',
          contract_value: data.contract_value || 0,
          status: data.status || 'not_started',
          completion_percentage: data.completion_percentage || 0,
          planned_start_date: data.planned_start_date || '',
          planned_end_date: data.planned_end_date || '',
          actual_start_date: data.actual_start_date || '',
          actual_completion_date: data.actual_completion_date || '',
          is_portfolio_candidate: data.is_portfolio_candidate || false,
          priority: data.priority || 'medium',
        });
      } else {
        alert('Project not found');
        router.push('/admin/projects/dashboard');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${params.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/admin/projects/details/${params.id}`);
      } else {
        const error = await response.json();
        alert('Error updating project: ' + JSON.stringify(error));
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Edit Project"
          subtitle="Update project details"
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Edit Project</h2>
                <Link href={`/admin/projects/details/${params.id}`} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </Link>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Reference</label>
                  <input
                    type="text"
                    name="project_reference"
                    value={formData.project_reference}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Line</label>
                  <select
                    name="service_line"
                    value={formData.service_line}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select service line</option>
                    <option value="water_supply">Water Supply</option>
                    <option value="irrigation">Irrigation</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="construction">Construction</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Location</label>
                  <input
                    type="text"
                    name="site_location"
                    value={formData.site_location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Value</label>
                  <input
                    type="number"
                    name="contract_value"
                    value={formData.contract_value}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Percentage</label>
                  <input
                    type="number"
                    name="completion_percentage"
                    value={formData.completion_percentage}
                    onChange={handleChange}
                    required
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start Date</label>
                  <input
                    type="date"
                    name="planned_start_date"
                    value={formData.planned_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned End Date</label>
                  <input
                    type="date"
                    name="planned_end_date"
                    value={formData.planned_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Start Date</label>
                  <input
                    type="date"
                    name="actual_start_date"
                    value={formData.actual_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Completion Date</label>
                  <input
                    type="date"
                    name="actual_completion_date"
                    value={formData.actual_completion_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center md:col-span-2">
                  <input
                    type="checkbox"
                    name="is_portfolio_candidate"
                    id="is_portfolio_candidate"
                    checked={formData.is_portfolio_candidate}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_portfolio_candidate" className="ml-2 text-sm font-medium text-gray-700">Portfolio Candidate</label>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope Description</label>
                <textarea
                  name="scope_description"
                  value={formData.scope_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Link
                  href={`/admin/projects/details/${params.id}`}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {submitting ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

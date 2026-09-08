'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../../components/Sidebar';
import { Topbar } from '../../../../components/Topbar';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ProjectActivity {
  id: string;
  project: string;
  project_name: string;
  activity_name: string;
  order: number;
  start_date: string;
  end_date: string;
  progress: number;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  resources_count: number;
  images_count: number;
}

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string; activityId: string }>();
  const [projectId, setProjectId] = useState<string>('');
  const [activityId, setActivityId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    activity_name: '',
    start_date: '',
    end_date: '',
    progress: 0,
    notes: '',
    status: 'in_progress',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const { projectId: projectIdValue, activityId: activityIdValue } = params;
        setProjectId(projectIdValue);
        setActivityId(activityIdValue);

        console.log('Loading activity:', activityIdValue);
        const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/${activityIdValue}/`);
        console.log('Activity response status:', response.status);
        if (response.ok) {
          const data: ProjectActivity = await response.json();
          console.log('Activity data:', data);
          setFormData({
            activity_name: data.activity_name,
            start_date: data.start_date,
            end_date: data.end_date,
            progress: data.progress,
            notes: data.notes,
            status: data.status,
          });
        } else {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setError('Failed to load activity');
        }
      } catch (err) {
        console.error('Error loading activity:', err);
        setError('Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/${activityId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project: projectId,
        }),
      });

      if (response.ok) {
        // Refresh the project details page by navigating with a timestamp to force refresh
        router.push(`/admin/projects/details/${projectId}?tab=activity_scheduling&t=${Date.now()}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || JSON.stringify(errorData) || 'Failed to update activity');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const statusOptions = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Edit Activity" subtitle="Update project activity" onSearch={(q) => console.log('Search:', q)} />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/projects" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Edit Activity"
            subtitle="Update project activity"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Activity Information</h2>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
                <input
                  type="text"
                  name="activity_name"
                  value={formData.activity_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Link
                  href={`/admin/projects/details/${projectId}?tab=activity_scheduling`}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
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

interface Project {
  id: string;
  name: string;
  status: string;
  completion_percentage: number;
  computed_progress?: number;
}

export default function ProjectActivitiesPage() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    project: '',
    activity_name: '',
    start_date: '',
    end_date: '',
    progress: 0,
    notes: '',
    status: 'in_progress',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    progress: 0,
    status: 'in_progress',
  });
  const [project, setProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [projectEditForm, setProjectEditForm] = useState({
    completion_percentage: 0,
    status: 'in_progress',
  });

  const loadActivities = async (id: string) => {
    const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${id}`);
    if (response.ok) {
      const data = await response.json();
      setActivities(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
    }
  };

  const loadProject = async (id: string) => {
    const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}/`);
    if (response.ok) {
      const data = await response.json();
      setProject(data);
      const progressValue = data.computed_progress !== undefined && data.computed_progress !== null ? data.computed_progress : (data.completion_percentage || 0);
      setProjectEditForm({
        completion_percentage: isNaN(progressValue) ? 0 : progressValue,
        status: data.status || 'in_progress',
      });
    }
  };

  useEffect(() => {
    try {
      const projectIdValue = params.projectId;
      setProjectId(projectIdValue);
      setFormData((current) => ({ ...current, project: projectIdValue }));
      loadActivities(projectIdValue);
      loadProject(projectIdValue);
    } catch (err) {
      setError('Failed to initialize form');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/activities/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ project: projectId, activity_name: '', start_date: '', end_date: '', progress: 0, notes: '', status: 'in_progress' });
        await loadActivities(projectId);
        await loadProject(projectId); // Reload project to get updated computed progress with new activity
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create activity');
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

  const handleEditActivity = (activity: ProjectActivity) => {
    setEditingActivity(activity.id);
    setEditForm({
      progress: activity.progress,
      status: activity.status,
    });
  };

  const handleUpdateActivity = async (activityId: string) => {
    try {
      console.log('Updating activity:', activityId, 'with data:', editForm);
      
      // First get the full activity data
      const getActivityResponse = await fetch(`http://127.0.0.1:8000/api/projects/activities/${activityId}/`);
      if (!getActivityResponse.ok) {
        throw new Error('Failed to fetch activity data');
      }
      const activityData = await getActivityResponse.json();
      
      // Update only the fields we want to change
      const updateData = {
        ...activityData,
        progress: editForm.progress,
        status: editForm.status,
      };
      
      const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/${activityId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setEditingActivity(null);
        await loadActivities(projectId);
        await loadProject(projectId); // Reload project to get updated computed progress
      } else {
        const errorText = await response.text();
        console.error('Activity update error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        setError(errorData.detail || 'Failed to update activity');
      }
    } catch (err) {
      console.error('Network error updating activity:', err);
      setError('Network error. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditForm({ progress: 0, status: 'in_progress' });
  };

  const handleEditProject = () => {
    setEditingProject(true);
  };

  const handleUpdateProject = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectEditForm),
      });

      if (response.ok) {
        setEditingProject(false);
        await loadProject(projectId);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update project');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleCancelProjectEdit = () => {
    setEditingProject(false);
    if (project) {
      setProjectEditForm({
        completion_percentage: project.completion_percentage || 0,
        status: project.status || 'in_progress',
      });
    }
  };

  const statusOptions = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  const projectStatusOptions = [
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar activePath="/admin/projects" />
        <div className="flex-1 ml-64">
          <Topbar title="Add Activity" subtitle="Create a new project activity" onSearch={(q) => console.log('Search:', q)} />
          <div className="p-6">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar activePath="/admin/projects" />
      <div className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <Topbar
            title="Add Activity"
            subtitle="Create a new project activity"
            onSearch={(q) => console.log('Search:', q)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Project Progress Section */}
          {project && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Project Progress</h2>
                  <p className="text-sm text-gray-500">Overall progress is automatically calculated from activity completion</p>
                </div>
                {!editingProject ? (
                  <button
                    onClick={handleEditProject}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit Status
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProject}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelProjectEdit}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Percentage</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(project.computed_progress !== undefined && project.computed_progress !== null && !isNaN(project.computed_progress)) ? project.computed_progress : (project.completion_percentage || 0)}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(project.computed_progress !== undefined && project.computed_progress !== null && !isNaN(project.computed_progress)) ? project.computed_progress : (project.completion_percentage || 0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from {activities.length} activities</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {editingProject ? (
                    <select
                      value={projectEditForm.status}
                      onChange={(e) => setProjectEditForm({ ...projectEditForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {projectStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {project.status.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div><h2 className="text-lg font-semibold text-gray-900">Project Activities</h2><p className="text-sm text-gray-500">All activities for this project, including projects with none yet.</p></div>
              <Link href={`/admin/projects/management/${projectId}`} className="text-sm text-blue-600 hover:underline">Project Monitoring</Link>
            </div>
            {activities.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No activities yet. Create the first activity below.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="p-4">Activity</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.id} className="border-t">
                        <td className="p-4 font-medium">{activity.activity_name}</td>
                        <td className="p-4">{activity.start_date} — {activity.end_date}</td>
                        <td className="p-4">
                          {editingActivity === activity.id ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={isNaN(editForm.progress) ? 0 : editForm.progress}
                              onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) || 0 })}
                              className="w-20 border border-gray-300 rounded px-2 py-1"
                            />
                          ) : (
                            `${activity.progress}%`
                          )}
                        </td>
                        <td className="p-4">
                          {editingActivity === activity.id ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              className="border border-gray-300 rounded px-2 py-1"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          ) : (
                            activity.status.replace('_', ' ')
                          )}
                        </td>
                        <td className="p-4">
                          {editingActivity === activity.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateActivity(activity.id)}
                                className="text-green-600 hover:underline text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:underline text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  href={`/admin/projects/details/${projectId}`}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

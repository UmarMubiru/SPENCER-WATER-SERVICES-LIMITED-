'use client';

import React, { useState, useEffect, use } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../../../components/admin/ui/StatusBadge';

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
  cover_image?: string;
  cover_image_url?: string;
  public_description?: string;
  is_published?: boolean;
  is_portfolio_candidate?: boolean;
  latitude?: string;
  longitude?: string;
  approved_by_name?: string;
  approved_at?: string;
  approval_notes?: string;
}

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department_name: string;
  job_title_name: string;
  employment_type_name: string;
  status: string;
}

interface Assignment {
  id: number;
  employee_name: string;
  employee_department: string;
  employee_job_title: string;
  job_title_name: string;
  job_title_department: string;
  project_role_name: string;
  assigned_date: string;
  end_date: string;
  is_active: boolean;
}

interface JobTitle {
  id: number;
  title: string;
  description: string;
  department: number | null;
  department_name: string;
}

interface CasualWorker {
  id: number;
  full_name: string;
  phone: string;
  next_of_kin: string;
  payment_type: 'piece_rate' | 'daily_rate';
  piece_rate: number | string;
  daily_rate: number | string;
  is_active: boolean;
}

interface ProjectRole {
  id: number;
  name: string;
  description: string;
}

interface CasualWorkerAttendance {
  id: number;
  casual_worker: number;
  casual_worker_name: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | string | null;
  pieces_completed: number | string;
  daily_wage: number | string | null;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  target_date: string;
  status: string;
  order: number;
}

interface ActivityImage {
  id: string;
  activity: string;
  activity_name: string;
  image: string;
  caption: string;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
}

interface ProjectDocument {
  id: string;
  project: string;
  file: string;
  document_type: string;
  caption: string;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
}

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

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const projectId = unwrappedParams.id;
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [casualWorkers, setCasualWorkers] = useState<CasualWorker[]>([]);
  const [casualAttendance, setCasualAttendance] = useState<CasualWorkerAttendance[]>([]);
  const [galleryImages, setGalleryImages] = useState<ActivityImage[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [selectedProjectRole, setSelectedProjectRole] = useState('');
  const [assignmentStartDate, setAssignmentStartDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/activity_images/?activity__project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setGalleryImages(data);
      }
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      console.log('Fetching activities for project:', projectId);
      const response = await fetch(`http://127.0.0.1:8000/api/projects/activities/?project=${projectId}`);
      console.log('Activities response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Activities data:', data);
        const activitiesArray = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setActivities(activitiesArray);
      } else {
        console.error('Error fetching activities:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setActivities([]); // Set empty array on error to prevent 500
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]); // Set empty array on error to prevent 500
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/activity_images/${imageId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchGalleryImages();
      } else {
        alert('Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Error deleting image');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/documents/?project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/documents/${documentId}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments();
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Error deleting document');
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProject = async () => {
    try {
      let coverImageUrl = editForm.cover_image_url || project?.cover_image_url || '';

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

      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          cover_image_url: coverImageUrl,
        }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProject(updatedProject);
        setIsEditing(false);
        setCoverImageFile(null);
        setCoverImagePreview('');
        fetchProjectDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Error updating project');
    }
  };

  const handleApproveProject = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_notes: approvalNotes }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Project ${data.project_reference} approved successfully!`);
        setApprovalNotes('');
        fetchProjectDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.detail || 'Failed to approve project');
      }
    } catch (err) {
      console.error('Error approving project:', err);
      alert('Error approving project');
    }
  };

  const handleEditClick = () => {
    if (!project) return;
    setEditForm({
      status: project?.status,
      completion_percentage: project?.completion_percentage,
      planned_start_date: project?.planned_start_date,
      planned_end_date: project?.planned_end_date,
      contract_value: project?.contract_value,
      site_location: project?.site_location,
      scope_description: project?.scope_description,
      public_description: project?.public_description,
      cover_image_url: project?.cover_image_url,
      latitude: project?.latitude,
      longitude: project?.longitude,
      is_published: project?.is_published,
      is_portfolio_candidate: project?.is_portfolio_candidate,
    });
    setCoverImagePreview(project?.cover_image_url || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchMilestones();
    fetchAssignments();
    fetchJobTitles();
    fetchProjectRoles();
    fetchCasualWorkers();
    fetchCasualAttendance();
    fetchGalleryImages();
    fetchDocuments();
    fetchActivities();
  }, [projectId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      // Refresh project details when switching tabs to get latest completion percentage
      fetchProjectDetails();
    }
  }, []);

  useEffect(() => {
    const scheduleNewDayRefresh = () => {
      const now = new Date();
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 1, 0);
      return window.setTimeout(() => {
        fetchCasualAttendance();
        scheduleNewDayRefresh();
      }, nextDay.getTime() - now.getTime());
    };

    const timer = scheduleNewDayRefresh();
    return () => window.clearTimeout(timer);
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project || data);
        setAvailableEmployees(data.available_employees || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load project details:', errorData);
        setError(`Failed to load project details: ${errorData.detail || errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error loading project details:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/role_allocations/?project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchJobTitles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/job-titles/');
      if (response.ok) {
        const data = await response.json();
        setJobTitles(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching job titles:', err);
    }
  };

  const fetchProjectRoles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/roles/');
      if (response.ok) {
        const data = await response.json();
        setProjectRoles(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching project roles:', err);
    }
  };

  const fetchCasualWorkers = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/casual_workers/?project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setCasualWorkers(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching casual workers:', err);
    }
  };

  const fetchCasualAttendance = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/casual_attendance/?project=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setCasualAttendance(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching casual attendance:', err);
    }
  };

  const handleClockIn = async (workerId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/casual_attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casual_worker: workerId,
          clock_in: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        fetchCasualAttendance();
      } else {
        alert('Failed to clock in');
      }
    } catch (err) {
      console.error('Error clocking in:', err);
      alert('Error clocking in');
    }
  };

  const handleClockOut = async (attendanceId: number, paymentType: CasualWorker['payment_type']) => {
    let piecesCompleted: string | null = null;
    if (paymentType === 'piece_rate') {
      piecesCompleted = window.prompt('How many pieces did this worker complete today?');
      if (piecesCompleted === null) return;
      if (piecesCompleted.trim() === '' || Number.isNaN(Number(piecesCompleted)) || Number(piecesCompleted) < 0) {
        alert('Enter a valid number of completed pieces.');
        return;
      }
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/casual_attendance/${attendanceId}/clock_out/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: piecesCompleted === null ? undefined : JSON.stringify({ pieces_completed: piecesCompleted }),
      });

      if (response.ok) {
        fetchCasualAttendance();
      } else {
        alert('Failed to clock out');
      }
    } catch (err) {
      console.error('Error clocking out:', err);
      alert('Error clocking out');
    }
  };

  const handleAssignEmployee = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/assign_employee/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee: selectedEmployee,
          job_title: selectedJobTitle,
          project_role: selectedProjectRole,
          assigned_date: assignmentStartDate,
        }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedEmployee('');
        setSelectedJobTitle('');
        setSelectedProjectRole('');
        setAssignmentStartDate('');
        fetchAssignments();
        fetchProjectDetails(); // Refresh to update available employees
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to assign employee');
      }
    } catch (err) {
      console.error('Error assigning employee:', err);
      alert('Error assigning employee');
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/milestones/?project=${projectId}`);
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
    { id: 'gallery', label: 'Gallery' },
    { id: 'documents', label: 'Documents' },
  ];

  const todaysCasualPay = casualAttendance
    .filter((attendance) => new Date(attendance.clock_in).toDateString() === new Date().toDateString())
    .reduce((total, attendance) => total + Number(attendance.daily_wage || 0), 0);

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
        <div className="min-h-[calc(100vh-4rem)] space-y-8 p-8 max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-2">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-600 hover:bg-blue-50 hover:text-blue-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between gap-4 items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div><p className="text-sm text-blue-100">Project overview</p><h2 className="text-2xl font-semibold">{project.name}</h2><p className="text-sm text-blue-100 mt-1">{project.project_reference}</p></div>
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Update
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Update Section - Always Visible */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Project Status</label>
                      <select
                        value={editForm.status || project.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      >
                        <option value="pending_approval">Pending Approval</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <button
                      onClick={handleUpdateProject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium self-end"
                    >
                      Save Status
                    </button>
                  </div>
                </div>

                {/* Approval Section for Pending Projects */}
                {project.status === 'pending_approval' && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="font-semibold text-blue-900 mb-3">Project Approval Required</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      This project was automatically created from an accepted quotation. Review the details and approve to begin project setup.
                    </p>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Approval Notes</label>
                      <textarea
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add any notes about this approval..."
                      />
                    </div>
                    <button
                      onClick={handleApproveProject}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Approve Project
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 [&>div]:rounded-xl [&>div]:border [&>div]:border-blue-100 [&>div]:bg-blue-50 [&>div]:p-4">
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Project Reference</h3>
                    <p className="text-lg font-semibold text-blue-900">{project.project_reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Service Line</h3>
                    <p className="text-lg font-semibold text-blue-900">
                      {project.service_line.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Status</h3>
                    {isEditing ? (
                      <select
                        value={editForm.status || project.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending_approval">Pending Approval</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <StatusBadge status={project.status} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Completion</h3>
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.completion_percentage ?? project.completion_percentage}
                          onChange={(e) => setEditForm({ ...editForm, completion_percentage: parseInt(e.target.value) })}
                          className="w-20 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-blue-600">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-blue-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${project.completion_percentage}%` }}></div>
                        </div>
                        <span className="text-lg font-semibold text-blue-900">{project.completion_percentage}%</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Planned Start Date</h3>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.planned_start_date || project.planned_start_date || ''}
                        onChange={(e) => setEditForm({ ...editForm, planned_start_date: e.target.value })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-blue-900">
                        {project.planned_start_date ? new Date(project.planned_start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Planned End Date</h3>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.planned_end_date || project.planned_end_date || ''}
                        onChange={(e) => setEditForm({ ...editForm, planned_end_date: e.target.value })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-blue-900">
                        {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Contract Value</h3>
                    {isEditing ? (
                      <input
                        type="number"
                        value={(editForm.contract_value ?? project.contract_value) || 0}
                        onChange={(e) => setEditForm({ ...editForm, contract_value: parseFloat(e.target.value) })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-blue-900">
                        UGX {project.contract_value?.toLocaleString() || '0'}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Site Location</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.site_location || project.site_location || ''}
                        onChange={(e) => setEditForm({ ...editForm, site_location: e.target.value })}
                        className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-blue-900">{project.site_location || 'Not specified'}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Scope Description</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.scope_description || project.scope_description || ''}
                      onChange={(e) => setEditForm({ ...editForm, scope_description: e.target.value })}
                      rows={4}
                      className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  ) : (
                    <p className="text-blue-900">{project.scope_description || 'No description provided'}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Featured Image (Cover Image)</h3>
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
                              setEditForm({ ...editForm, cover_image: '' });
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
                            id="editCoverImage"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="editCoverImage"
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
                )}

                {isEditing && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Public Description (for project card)</h3>
                    <textarea
                      value={editForm.public_description || project.public_description || ''}
                      onChange={(e) => setEditForm({ ...editForm, public_description: e.target.value })}
                      rows={3}
                      className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      placeholder="Brief description for the public project card..."
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Map Coordinates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-blue-400 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={editForm.latitude || project.latitude || ''}
                          onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                          placeholder="e.g., 0.347596"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-400 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={editForm.longitude || project.longitude || ''}
                          onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })}
                          className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                          placeholder="e.g., 32.582520"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">Publication Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_published ?? project.is_published ?? false}
                          onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                          className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-900">Publish this project (show on public website)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_portfolio_candidate ?? project.is_portfolio_candidate ?? false}
                          onChange={(e) => setEditForm({ ...editForm, is_portfolio_candidate: e.target.checked })}
                          className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-900">Show as portfolio candidate (eligible for project cards)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-5 border-t border-blue-100">
                  <Link
                    href={`/admin/projects/edit/${project.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
                  >
                    Full Edit
                  </Link>
                  <button
                    onClick={() => router.push('/admin/projects/dashboard')}
                    className="px-6 py-3 border border-blue-200 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activity_scheduling' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-blue-900">Activity Scheduling</h3>
                  <Link
                    href={`/admin/projects/activities/${projectId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Activity
                  </Link>
                </div>
                {activities && activities.length === 0 ? (
                  <div className="text-center text-blue-400 py-8 border border-blue-100 rounded-lg">
                    No activities scheduled for this project.
                    <Link href={`/admin/projects/activities/${projectId}`} className="text-blue-600 hover:underline ml-2">
                      Add your first activity →
                    </Link>
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Activity Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Start Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-100">
                        {activities.map((activity) => (
                          <tr key={activity.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-900">{activity.activity_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-600">{new Date(activity.start_date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-600">{new Date(activity.end_date).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-600">{activity.progress}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={activity.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/admin/projects/activities/${projectId}/${activity.id}`} className="text-blue-600 hover:text-blue-900">
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-blue-400 py-8 border border-blue-100 rounded-lg">
                    Loading activities...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'role_assignment' && (
              <div className="space-y-8">
                {/* Assigned Employees Panel */}
                <div className="border border-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-blue-900">Assigned Employees</h3>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Assign Employee
                    </button>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-center text-blue-400 py-8 border border-blue-100 rounded-lg">
                      No employees currently assigned to this project.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">
                        <div className="col-span-3">Employee</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-2">Department</div>
                        <div className="col-span-2">Job Title</div>
                        <div className="col-span-2">Assigned Date</div>
                        <div className="col-span-1">Status</div>
                      </div>
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="border border-blue-100 rounded-lg p-4 flex items-center">
                          <div className="col-span-3 flex-1">
                            <h5 className="font-semibold text-blue-900">{assignment.employee_name}</h5>
                          </div>
                          <div className="col-span-2 flex-1">
                            <p className="text-sm text-blue-600">{assignment.project_role_name || '—'}</p>
                          </div>
                          <div className="col-span-2 flex-1">
                            <p className="text-sm text-blue-600">{assignment.employee_department}</p>
                          </div>
                          <div className="col-span-2 flex-1">
                            <p className="text-sm text-blue-600">{assignment.job_title_name || assignment.employee_job_title}</p>
                          </div>
                          <div className="col-span-2 flex-1">
                            <p className="text-sm text-blue-600">{new Date(assignment.assigned_date).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-1 flex-1">
                            <div className="flex items-center gap-2">
                              {assignment.is_active ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Casual Workers Panel */}
                <div className="border border-blue-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-blue-900">Casual Workers</h3>
                    <Link href={`/admin/projects/casual-workers/create?project=${projectId}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      + Add Casual Worker
                    </Link>
                  </div>
                  {casualWorkers.length === 0 ? (
                    <div className="text-center text-blue-400 py-8 border border-blue-100 rounded-lg">
                      No casual workers assigned to this project.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-blue-100">
                        <thead className="bg-blue-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Next of Kin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Payment Basis</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Today's Output</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Today's Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-blue-100">
                          {casualWorkers.map((worker) => {
                            const todayAttendance = casualAttendance.find(
                              (a) => a.casual_worker === worker.id &&
                              new Date(a.clock_in).toDateString() === new Date().toDateString()
                            );
                            return (
                              <tr key={worker.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {worker.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {worker.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {worker.next_of_kin || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {worker.payment_type === 'piece_rate' ? 'Piece rate' : 'Daily rate'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  UGX {Number(worker.payment_type === 'piece_rate' ? worker.piece_rate : worker.daily_rate).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {worker.payment_type === 'piece_rate'
                                    ? (todayAttendance?.pieces_completed != null ? `${Number(todayAttendance.pieces_completed).toLocaleString()} pieces` : '-')
                                    : (todayAttendance?.clock_out ? 'Full day' : '-')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  {todayAttendance?.daily_wage != null
                                    ? `UGX ${Number(todayAttendance.daily_wage).toLocaleString()}`
                                    : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                                  <div className="flex gap-2">
                                    {todayAttendance && !todayAttendance.clock_out ? (
                                      <button
                                        onClick={() => handleClockOut(todayAttendance.id, worker.payment_type)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                      >
                                        Clock Out
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleClockIn(worker.id)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                                      >
                                        Clock In
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-right text-sm font-semibold text-blue-900">
                              Total pay for today
                            </td>
                            <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                              UGX {todaysCasualPay.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Assignment Modal */}
                {showAssignModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-blue-900">Assign Employee</h3>
                        <button
                          onClick={() => setShowAssignModal(false)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleAssignEmployee(); }}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">Employee</label>
                            <select
                              value={selectedEmployee}
                              onChange={(e) => setSelectedEmployee(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select employee</option>
                              {availableEmployees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.full_name} - {employee.job_title_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">Job Title</label>
                            <select
                              value={selectedJobTitle}
                              onChange={(e) => setSelectedJobTitle(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select job title</option>
                              {jobTitles.map((job) => (
                                <option key={job.id} value={job.id}>
                                  {job.title} {job.department_name ? `(${job.department_name})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={assignmentStartDate}
                              onChange={(e) => setAssignmentStartDate(e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">Project Role</label>
                            <select
                              value={selectedProjectRole}
                              onChange={(e) => setSelectedProjectRole(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">No specific project role</option>
                              {projectRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowAssignModal(false)}
                            className="flex-1 px-4 py-2 border border-blue-200 text-blue-900 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-blue-900">Resources</h3>
                  <Link
                    href={`/admin/projects/resources/${projectId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View / Request Resources
                  </Link>
                </div>
                <div className="text-center text-blue-400 py-8">
                  <Link href={`/admin/projects/resources/${projectId}`} className="text-blue-600 hover:underline">
                    Manage Resources →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-blue-900">Gallery</h3>
                  <Link
                    href={`/admin/projects/gallery/${projectId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Upload Image
                  </Link>
                </div>
                {galleryImages.length === 0 ? (
                  <div className="text-center text-blue-400 py-8">
                    <p>No images uploaded yet</p>
                    <Link href={`/admin/projects/gallery/${projectId}`} className="text-blue-600 hover:underline mt-2 inline-block">
                      Upload your first image →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {galleryImages.map((image) => (
                      <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="relative aspect-square bg-blue-50">
                          <img
                            src={image.image}
                            alt={image.caption || 'Activity image'}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleDeleteImage(image.id)}
                            className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md transition-colors"
                            title="Delete image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm mb-1 text-blue-900">{image.activity_name}</p>
                          {image.caption && (
                            <p className="text-blue-600 text-xs mb-1">{image.caption}</p>
                          )}
                          <p className="text-blue-400 text-xs">
                            {new Date(image.uploaded_at).toLocaleDateString()}
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-blue-900">Documents</h3>
                  <Link
                    href={`/admin/projects/documents/${projectId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Upload Document
                  </Link>
                </div>
                {documents.length === 0 ? (
                  <div className="text-center text-blue-400 py-8">
                    <p>No documents uploaded yet</p>
                    <Link href={`/admin/projects/documents/${projectId}`} className="text-blue-600 hover:underline mt-2 inline-block">
                      Upload your first document →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Caption</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">File</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Uploaded By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Uploaded At</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-100">
                        {documents.map((document) => (
                          <tr key={document.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs ${
                                document.document_type === 'site_photo' ? 'bg-blue-100 text-blue-800' :
                                document.document_type === 'completion_report' ? 'bg-blue-100 text-blue-800' :
                                document.document_type === 'client_signoff' ? 'bg-blue-100 text-blue-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {document.document_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-900">{document.caption || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <a
                                href={document.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Download
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-900">{document.uploaded_by_name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-blue-900">{new Date(document.uploaded_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleDeleteDocument(document.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
}

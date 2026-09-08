'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Users, Briefcase } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  description: string;
  department_head: number | null;
  department_head_name: string;
  is_active: boolean;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  full_name: string;
  department: number | null;
  department_name: string;
}

interface JobTitle {
  id: number;
  title: string;
  description: string;
  department: number | null;
  department_name: string;
  department_is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showJobTitleModal, setShowJobTitleModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [activeTab, setActiveTab] = useState<'departments' | 'jobTitles'>('departments');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department_head: '',
  });
  const [jobTitleFormData, setJobTitleFormData] = useState({
    title: '',
    description: '',
    department: '',
  });

  useEffect(() => {
    fetchDepartments();
    fetchJobTitles();
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/employees/');
      if (response.ok) {
        const data = await response.json();
        const employeesData = data.results || data;
        console.log('Fetched employees:', employeesData);
        setEmployees(employeesData);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  }

  async function fetchJobTitles() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/job-titles/');
      if (response.ok) {
        const data = await response.json();
        setJobTitles(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching job titles:', err);
    }
  }

  async function fetchDepartments() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/departments/');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.results || data);
      } else {
        setError('Failed to load departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/departments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          department_head: formData.department_head ? parseInt(formData.department_head) : null,
        }),
      });

      if (response.ok) {
        setShowDepartmentModal(false);
        setFormData({ name: '', description: '', department_head: '' });
        setEditingDepartment(null);
        fetchDepartments();
      } else {
        const errorData = await response.json();
        setError(errorData.name || errorData.detail || 'Failed to create department');
      }
    } catch (err) {
      console.error('Error creating department:', err);
      setError('Network error');
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/departments/${editingDepartment.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          department_head: formData.department_head ? parseInt(formData.department_head) : null,
        }),
      });

      if (response.ok) {
        setShowDepartmentModal(false);
        setFormData({ name: '', description: '', department_head: '' });
        setEditingDepartment(null);
        fetchDepartments();
      } else {
        const errorData = await response.json();
        setError(errorData.name || errorData.detail || 'Failed to update department');
      }
    } catch (err) {
      console.error('Error updating department:', err);
      setError('Network error');
    }
  };

  const openEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      department_head: dept.department_head?.toString() || '',
    });
    setShowDepartmentModal(true);
  };

  const handleCreateJobTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/employees/job-titles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobTitleFormData,
          department: jobTitleFormData.department ? parseInt(jobTitleFormData.department) : null,
        }),
      });

      if (response.ok) {
        setShowJobTitleModal(false);
        setJobTitleFormData({ title: '', description: '', department: '' });
        setEditingJobTitle(null);
        fetchJobTitles();
      } else {
        const errorData = await response.json();
        setError(errorData.title || errorData.detail || 'Failed to create job title');
      }
    } catch (err) {
      console.error('Error creating job title:', err);
      setError('Network error');
    }
  };

  const handleEditJobTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJobTitle) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/job-titles/${editingJobTitle.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitleFormData.title,
          description: jobTitleFormData.description,
          department: jobTitleFormData.department ? parseInt(jobTitleFormData.department) : null,
        }),
      });

      if (response.ok) {
        setShowJobTitleModal(false);
        setJobTitleFormData({ title: '', description: '', department: '' });
        setEditingJobTitle(null);
        fetchJobTitles();
      } else {
        const errorData = await response.json();
        setError(errorData.title || errorData.detail || 'Failed to update job title');
      }
    } catch (err) {
      console.error('Error updating job title:', err);
      setError('Network error');
    }
  };

  const openEditJobTitle = (job: JobTitle) => {
    setEditingJobTitle(job);
    setJobTitleFormData({
      title: job.title,
      description: job.description,
      department: job.department?.toString() || '',
    });
    setShowJobTitleModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/departments/${id}/`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDepartments();
      } else {
        alert('Failed to delete department');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      alert('Network error');
    }
  };

  const handleDeleteJobTitle = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/job-titles/${id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        fetchJobTitles();
      } else {
        alert('Failed to delete job title');
      }
    } catch (err) {
      console.error('Error deleting job title:', err);
      alert('Network error');
    }
  };

  const paginatedDepartments = departments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedJobTitles = jobTitles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = activeTab === 'departments' 
    ? Math.ceil(departments.length / itemsPerPage)
    : Math.ceil(jobTitles.length / itemsPerPage);

  const currentData = activeTab === 'departments' ? paginatedDepartments : paginatedJobTitles;
  const departmentMembers = editingDepartment
    ? employees.filter((employee) => employee.department === editingDepartment.id)
    : [];

  return (
    <AdminLayout title="Departments & Job Titles" subtitle="Manage organizational structure" activePath="/admin/user-management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/user-management" className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User Management
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingDepartment(null);
                setFormData({ name: '', description: '', department_head: '' });
                setShowDepartmentModal(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Department
            </button>
            <button
              onClick={() => {
                setEditingJobTitle(null);
                setJobTitleFormData({ title: '', description: '', department: '' });
                setShowJobTitleModal(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Briefcase className="w-4 h-4" />
              Add Job Title
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('departments'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'departments' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => { setActiveTab('jobTitles'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'jobTitles' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Job Titles ({jobTitles.length})
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              {activeTab === 'departments' ? 'Departments' : 'Job Titles'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({activeTab === 'departments' ? departments.length : jobTitles.length} total)
              </span>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">Loading...</div>
          ) : currentData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {activeTab === 'departments' ? 'No departments found' : 'No job titles found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {activeTab === 'departments' ? (
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Head</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeTab === 'departments' ? (
                    paginatedDepartments.map((dept) => (
                      <tr key={dept.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{dept.description || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{dept.department_head_name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {dept.employee_count}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${dept.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {dept.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            <button onClick={() => openEditDepartment(dept)} className="p-1 text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(dept.id)} className="p-1 text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    paginatedJobTitles.map((job) => (
                      <tr key={job.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{job.description || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{job.department_name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${job.department_is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {job.department_is_active ? 'Active' : 'Inactive Dept'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex gap-2">
                            <button onClick={() => openEditJobTitle(job)} className="p-1 text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteJobTitle(job.id)} className="p-1 text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department Create/Edit Modal */}
        {showDepartmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingDepartment ? 'Edit Department' : 'Add Department'}
                </h3>
                <button
                  onClick={() => {
                    setShowDepartmentModal(false);
                    setEditingDepartment(null);
                    setFormData({ name: '', description: '', department_head: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingDepartment ? handleEditDepartment : handleCreateDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Technical, Human Resources"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Department description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
                  <select
                    value={formData.department_head}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_head: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select department head (optional)</option>
                    {departmentMembers.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                  {!editingDepartment && (
                    <p className="mt-1 text-xs text-gray-500">Create the department first, assign employees to it, then choose its head.</p>
                  )}
                  {editingDepartment && departmentMembers.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">No employees are assigned to this department yet.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDepartmentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Title Create/Edit Modal */}
        {showJobTitleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingJobTitle ? 'Edit Job Title' : 'Add Job Title'}
                </h3>
                <button
                  onClick={() => {
                    setShowJobTitleModal(false);
                    setEditingJobTitle(null);
                    setJobTitleFormData({ title: '', description: '', department: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingJobTitle ? handleEditJobTitle : handleCreateJobTitle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={jobTitleFormData.title}
                    onChange={(e) => setJobTitleFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Site Engineer, Project Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={jobTitleFormData.department}
                    onChange={(e) => setJobTitleFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">No Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={jobTitleFormData.description}
                    onChange={(e) => setJobTitleFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Job title description"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowJobTitleModal(false);
                      setEditingJobTitle(null);
                      setJobTitleFormData({ title: '', description: '', department: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingJobTitle ? 'Update Job Title' : 'Create Job Title'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

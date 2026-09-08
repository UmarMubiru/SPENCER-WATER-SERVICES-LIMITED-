'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminLayout';
import { ArrowLeft, Edit, Trash2, FolderTree, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ProjectRole {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface ProjectRoleAllocation {
  id: string;
  employee_name: string;
  project_name: string;
  job_title: string;
  is_team_lead: boolean;
  assigned_date: string;
  is_active: boolean;
}

export default function ProjectRoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;
  const [role, setRole] = useState<ProjectRole | null>(null);
  const [allocations, setAllocations] = useState<ProjectRoleAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchRoleDetails();
    fetchRoleAllocations();
  }, [roleId]);

  const fetchRoleDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/roles/${roleId}/`);
      if (response.ok) {
        const data = await response.json();
        setRole(data);
        setFormData({
          name: data.name,
          description: data.description
        });
      }
    } catch (error) {
      console.error('Error fetching role details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleAllocations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/role_allocations/');
      if (response.ok) {
        const data = await response.json();
        const results = data.results || data;
        // Filter allocations that use this role (via job_title)
        const roleAllocations = results.filter((alloc: any) => 
          alloc.job_title && alloc.job_title.toString() === roleId
        );
        setAllocations(roleAllocations);
      }
    } catch (error) {
      console.error('Error fetching role allocations:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/roles/${roleId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowEditModal(false);
        fetchRoleDetails();
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this role? This will affect all project assignments using this role.')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/roles/${roleId}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        window.location.href = '/admin/user-management/roles';
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Project Role Details" subtitle="Loading..." activePath="/admin/user-management/roles">
        <div className="p-8">
          <div className="text-center py-12 text-gray-500">Loading role details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!role) {
    return (
      <AdminLayout title="Project Role Details" subtitle="Role not found" activePath="/admin/user-management/roles">
        <div className="p-8">
          <div className="text-center py-12 text-gray-500">Role not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Project Role Details" subtitle={role.name} activePath="/admin/user-management/roles">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/user-management/roles" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
          </Link>
        </div>

        {/* Role Overview Card */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm mb-6">
          <div className="border-b border-blue-100 p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50">
                <FolderTree className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 text-lg">{role.name}</h3>
                <p className="text-sm text-blue-600">Project Role ID: {role.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Role
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Description</p>
                <p className="text-blue-900">{role.description || 'No description provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Created</p>
                <p className="text-blue-900">{new Date(role.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Assignments */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 p-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Project Assignments</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {allocations.length} active assignments
              </span>
            </div>
          </div>
          {allocations.length === 0 ? (
            <div className="p-6 text-center text-blue-400">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <p>No project assignments found for this role.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-5 py-3 text-left text-blue-700">Employee</th>
                    <th className="px-5 py-3 text-left text-blue-700">Project</th>
                    <th className="px-5 py-3 text-left text-blue-700">Clerk of Works</th>
                    <th className="px-5 py-3 text-left text-blue-700">Status</th>
                    <th className="px-5 py-3 text-left text-blue-700">Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => (
                    <tr key={allocation.id} className="border-t border-blue-50">
                      <td className="px-5 py-4 text-blue-900 font-medium">{allocation.employee_name}</td>
                      <td className="px-5 py-4 text-blue-900">{allocation.project_name}</td>
                      <td className="px-5 py-4 text-blue-900">
                        {allocation.is_team_lead ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Clerk of Works</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-blue-900">
                        {allocation.is_active ? (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Active</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-blue-900">{new Date(allocation.assigned_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Project Role</h3>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Role
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

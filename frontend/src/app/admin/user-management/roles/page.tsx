'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, FolderTree } from 'lucide-react';
import Link from 'next/link';

interface ProjectRole {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function RolesManagementPage() {
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<ProjectRole | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchProjectRoles();
  }, []);

  const fetchProjectRoles = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/roles/');
      if (response.ok) {
        const data = await response.json();
        setProjectRoles(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching project roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/projects/roles/${roleId}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchProjectRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingRole 
      ? `http://127.0.0.1:8000/api/projects/roles/${editingRole.id}/`
      : 'http://127.0.0.1:8000/api/projects/roles/';
    
    const method = editingRole ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchProjectRoles();
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const paginatedRoles = projectRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(projectRoles.length / itemsPerPage);

  return (
    <AdminLayout title="Project Roles" subtitle="Manage project assignment roles" activePath="/admin/user-management/roles">
      <div className="space-y-4">
        {/* Roles Table */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 px-4 py-2.5 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-blue-900 text-base">All Project Roles</h3>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Role
            </button>
          </div>
          {loading ? (
            <div className="p-6 text-center text-blue-400 text-sm">Loading roles...</div>
          ) : projectRoles.length === 0 ? (
            <div className="p-8 text-center text-blue-400">
              <FolderTree className="w-12 h-12 mx-auto mb-4 text-blue-200" />
              <p className="text-sm">No project roles found. Create your first role to get started.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-blue-100 px-4 py-2.5 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({projectRoles.length} total)
                </span>
                <div className="flex items-center gap-2">
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
              <div className="overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-3 text-left text-blue-700 text-xs">ID</th>
                      <th className="px-4 py-3 text-left text-blue-700 text-xs">Role Name</th>
                      <th className="px-4 py-3 text-left text-blue-700 text-xs">Description</th>
                      <th className="px-4 py-3 text-left text-blue-700 text-xs">Created</th>
                      <th className="px-4 py-3 text-left text-blue-700 text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className="border-t border-blue-50">
                        <td className="px-4 py-3 text-blue-900 text-sm">{role.id}</td>
                        <td className="px-4 py-3 text-blue-900 font-medium text-sm">{role.name}</td>
                        <td className="px-4 py-3 text-blue-900 text-sm">{role.description || 'No description'}</td>
                        <td className="px-4 py-3 text-blue-900 text-sm">{new Date(role.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <Link href={`/admin/user-management/roles/${role.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                            <button
                              onClick={() => handleDelete(role.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Project Role
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
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
                      placeholder="e.g., Site Manager"
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
                      placeholder="Describe the purpose of this role"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Project roles are used when assigning employees to projects. 
                      They define the employee's function within a specific project (e.g., Site Manager, Clerk of Works).
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Role
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

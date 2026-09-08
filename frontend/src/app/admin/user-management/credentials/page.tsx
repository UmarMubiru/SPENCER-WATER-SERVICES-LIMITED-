'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import DashboardCard from '../../../../components/admin/ui/DashboardCard';
import { Check, X, Eye, EyeOff, Copy, RefreshCw, Share2, UserX, UserCheck, Users, Building2, Shield, Search, MoreVertical, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Credential {
  id: string;
  username: string;
  temporary_password: string;
  status: string;
  employee_name: string;
  employee_department: string;
  employee_job_title: string;
  created_at: string;
}

export default function UserAccountsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    pending_approvals: 0,
    total_users: 0,
    total_departments: 0,
    total_project_roles: 0,
  });

  useEffect(() => {
    fetchCredentials();
    fetchStats();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const fetchStats = async () => {
    try {
      // Fetch pending credentials count
      const credResponse = await fetch('http://127.0.0.1:8000/api/employees/credentials/?status=pending');
      if (credResponse.ok) {
        const credData = await credResponse.json();
        setStats(prev => ({ ...prev, pending_approvals: (credData.results || credData).length }));
      }

      // Fetch departments count
      const deptResponse = await fetch('http://127.0.0.1:8000/api/employees/departments/');
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setStats(prev => ({ ...prev, total_departments: (deptData.results || deptData).length }));
      }

      // Fetch employees count
      const empResponse = await fetch('http://127.0.0.1:8000/api/employees/employees/');
      if (empResponse.ok) {
        const empData = await empResponse.json();
        setStats(prev => ({ ...prev, total_users: (empData.results || empData).length }));
      }

      // Fetch project roles count
      const projectRolesResponse = await fetch('http://127.0.0.1:8000/api/projects/roles/');
      if (projectRolesResponse.ok) {
        const projectRolesData = await projectRolesResponse.json();
        setStats(prev => ({ ...prev, total_project_roles: (projectRolesData.results || projectRolesData).length }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchCredentials = async () => {
    try {
      const url = filter === 'all' 
        ? 'http://127.0.0.1:8000/api/employees/credentials/'
        : `http://127.0.0.1:8000/api/employees/credentials/?status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCredentials(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(cred =>
    cred.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.employee_department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedCredentials = filteredCredentials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);

  const getFilterCount = (status: string) => {
    if (status === 'all') return credentials.length;
    return credentials.filter(c => c.status === status).length;
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/credentials/${id}/approve/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error approving credential:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/credentials/${id}/reject/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error rejecting credential:', error);
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/credentials/${id}/regenerate/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error regenerating password:', error);
    }
  };

  const handleShare = async (credential: Credential) => {
    const message = `Login credentials for ${credential.employee_name}:\nUsername: ${credential.username}\nPassword: ${credential.temporary_password}`;
    
    // WhatsApp share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = (credential: Credential) => {
    const subject = `Login Credentials for ${credential.employee_name}`;
    const body = `Login credentials for ${credential.employee_name}:\n\nUsername: ${credential.username}\nPassword: ${credential.temporary_password}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this account?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/credentials/${id}/disable/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm('Are you sure you want to reactivate this account?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/credentials/${id}/enable/`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchCredentials();
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
    }
  };

  const handleCopyCredentials = (credential: Credential) => {
    const credentialsText = `Username: ${credential.username}\nPassword: ${credential.temporary_password}`;
    navigator.clipboard.writeText(credentialsText);
    alert('Credentials copied to clipboard!');
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'disabled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AdminLayout title="User Accounts Management" subtitle="Manage user credentials and account access" activePath="/admin/user-management/credentials">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            label="Pending Approvals"
            value={stats.pending_approvals.toString()}
            description={stats.pending_approvals === 0 ? 'No accounts awaiting review' : `${stats.pending_approvals} awaiting review`}
            icon={Users}
            tint="from-amber-500 to-amber-600"
          />
          <DashboardCard
            label="Total Users"
            value={stats.total_users.toString()}
            description={`${stats.total_users} active accounts`}
            icon={Users}
            tint="from-blue-500 to-blue-600"
          />
          <DashboardCard
            label="Departments"
            value={stats.total_departments.toString()}
            description="Across the organization"
            icon={Building2}
            tint="from-blue-500 to-blue-600"
          />
          <DashboardCard
            label="Project Roles"
            value={stats.total_project_roles.toString()}
            description="Administrator · Technician"
            icon={Shield}
            tint="from-blue-500 to-blue-600"
          />
        </div>

        {/* Search and Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users, username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus size={16} />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            All ({getFilterCount('all')})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Pending ({getFilterCount('pending')})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Approved ({getFilterCount('approved')})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${filter === 'rejected' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Rejected ({getFilterCount('rejected')})
          </button>
        </div>

        {/* Credentials Table */}
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading credentials...</div>
        ) : filteredCredentials.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No accounts found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No accounts match your search criteria.' : filter === 'pending' ? 'All user account requests have been reviewed.' : 'No credentials found.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({filteredCredentials.length} total)
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Username</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCredentials.map((credential) => (
                    <tr key={credential.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{credential.employee_name}</p>
                          <p className="text-sm text-gray-500">{credential.employee_job_title}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{credential.username}</td>
                      <td className="py-4 px-6 text-gray-700">{credential.employee_department || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(credential.status)}`}>
                          {credential.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {new Date(credential.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionMenu(showActionMenu === credential.id ? null : credential.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                          {showActionMenu === credential.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              {credential.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => { handleApprove(credential.id); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Check size={16} className="text-green-600" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => { handleReject(credential.id); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <X size={16} className="text-red-600" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {credential.status === 'approved' && (
                                <>
                                  <button
                                    onClick={() => { handleCopyCredentials(credential); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Copy size={16} className="text-blue-600" />
                                    Copy Credentials
                                  </button>
                                  <button
                                    onClick={() => { handleRegenerate(credential.id); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <RefreshCw size={16} className="text-blue-600" />
                                    Reset Password
                                  </button>
                                  <button
                                    onClick={() => { handleShare(credential); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Share2 size={16} className="text-green-600" />
                                    Share via WhatsApp
                                  </button>
                                  <button
                                    onClick={() => { handleEmailShare(credential); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Copy size={16} className="text-blue-600" />
                                    Share via Email
                                  </button>
                                  <button
                                    onClick={() => { handleDeactivate(credential.id); setShowActionMenu(null); }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <UserX size={16} className="text-gray-600" />
                                    Disable Account
                                  </button>
                                </>
                              )}
                              {credential.status === 'disabled' && (
                                <button
                                  onClick={() => { handleReactivate(credential.id); setShowActionMenu(null); }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserCheck size={16} className="text-green-600" />
                                  Reactivate Account
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

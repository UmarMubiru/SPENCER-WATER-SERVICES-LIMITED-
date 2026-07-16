'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { UserDashboardCards } from '../components/UserDashboardCards';
import { UserFilters } from '../components/UserFilters';
import { UserTable } from '../components/UserTable';
import { CreateUserForm } from '../components/CreateUserForm';
import { userService } from '../services/userService';
import { User, CreateUser } from '../types/user';
import { useRouter } from 'next/navigation';

export default function UsersDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    administrators: 0,
    inactive_users: 0,
    new_this_month: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
      
      // Calculate stats from users data
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.is_active).length;
      const administrators = usersData.filter(u => u.role_name === 'Administrator').length;
      const inactiveUsers = usersData.filter(u => !u.is_active).length;
      
      setStats({
        total_users: totalUsers,
        active_users: activeUsers,
        administrators,
        inactive_users: inactiveUsers,
        new_this_month: 3, // This would come from backend
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set fallback data when API is unavailable
      setUsers([
        { id: 1, username: 'admin', email: 'admin@sws.com', first_name: 'Admin', last_name: 'User', full_name: 'Admin User', phone: '+256 700 123 456', role: 'Administrator', is_active: true, last_login: new Date().toISOString(), created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, username: 'james.tech', email: 'james.tech@sws.com', first_name: 'James', last_name: 'Technical', full_name: 'James Technical', phone: '+256 700 234 567', role: 'Technician', is_active: true, last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), created_at: '2023-02-15', updated_at: '2023-02-15' },
        { id: 3, username: 'hr.manager', email: 'hr.manager@sws.com', first_name: 'HR', last_name: 'Manager', full_name: 'HR Manager', phone: '+256 700 345 678', role: 'Human Resource', is_active: true, last_login: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), created_at: '2023-03-10', updated_at: '2023-03-10' },
        { id: 4, username: 'sarah.ops', email: 'sarah.ops@sws.com', first_name: 'Sarah', last_name: 'Operations', full_name: 'Sarah Operations', phone: '+256 700 456 789', role: 'Technician', is_active: false, last_login: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), created_at: '2023-04-20', updated_at: '2023-04-20' },
      ]);
      setStats({
        total_users: 24,
        active_users: 21,
        administrators: 6,
        inactive_users: 3,
        new_this_month: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const filtered = await userService.getUsers({
        search: query,
        role: selectedRole,
        status: selectedStatus,
      });
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);
    try {
      const filtered = await userService.getUsers({
        search: searchQuery,
        role,
        status: selectedStatus,
      });
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to filter by role:', error);
    }
  };

  const handleStatusChange = async (status: string) => {
    setSelectedStatus(status);
    try {
      const filtered = await userService.getUsers({
        search: searchQuery,
        role: selectedRole,
        status,
      });
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to filter by status:', error);
    }
  };

  const handleViewUser = (user: User) => {
    router.push(`/admin/users/details/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    router.push(`/admin/users/edit/${user.id}`);
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete ${user.full_name || user.username}? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(user.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Unable to delete this user. Only administrators can delete users.');
    }
  };

  const handleFiltersClick = () => {
    console.log('Open advanced filters');
    // TODO: Open advanced filters modal
  };

  const handleCreateUser = async (userData: CreateUser) => {
    const result = await userService.createUser(userData);
    await loadData();
    if (result.setup_url) {
      alert(`Invitation created. Mailgun is not configured yet, so use this development setup link:\n${result.setup_url}`);
    } else {
      alert('Account setup invitation sent successfully.');
    }
      setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Sidebar */}
      <Sidebar activePath="/admin/users/dashboard" />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Topbar */}
        <Topbar
          title="Users Management"
          subtitle="View and manage system user accounts"
          onSearch={handleSearch}
        />

        {/* Content */}
        <div className="p-6">
          {/* Dashboard Cards */}
          <UserDashboardCards stats={stats} />

          {/* Filters */}
          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            onFiltersClick={handleFiltersClick}
          />

          {/* Main Content Area with Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Table */}
            <div className="lg:col-span-2">
              <UserTable
                users={users}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Create User Form */}
              <CreateUserForm
                onSubmit={handleCreateUser}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '../../services/userService';
import { User } from '../../types/user';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const userData = await userService.getUser(Number(params.id));
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('User not found');
      router.push('/admin/users/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await userService.deleteUser(Number(params.id));
      router.push('/admin/users/dashboard');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Unable to delete this user. Only administrators can delete users.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/users/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/users/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  const displayName = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'User';

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/users/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="User Details"
          subtitle={`View and manage ${displayName}`}
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/users/edit/${user.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <Link
                    href="/admin/users/dashboard"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Username</p>
                  <p className="text-lg font-semibold text-gray-900">@{user.username}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user.first_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user.last_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <p className="text-lg font-semibold text-gray-900">{user.role_name || 'No Role'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{user.phone || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Login</p>
                  <p className="text-lg font-semibold text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                  <p className="text-lg font-semibold text-gray-900">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Updated At</p>
                  <p className="text-lg font-semibold text-gray-900">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

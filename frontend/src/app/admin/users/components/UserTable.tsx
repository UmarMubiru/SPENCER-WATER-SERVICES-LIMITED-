import React from 'react';
import { Eye, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Avatar } from '../../employees/components/Avatar';
import { StatusBadge } from '../../employees/components/StatusBadge';
import { User } from '../types/user';

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, onView, onEdit, onDelete }: UserTableProps) {
  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return 'Today';
    if (diffHours < 24) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Username</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Login</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const displayName = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'User';
                const roleName = user.role_name || 'No Role';

                return (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar name={displayName} size="md" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-700">@{user.username}</span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={roleName} />
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={user.is_active ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-700">{formatLastLogin(user.last_login)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More options"
                      >
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

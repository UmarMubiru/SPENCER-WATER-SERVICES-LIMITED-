import React from 'react';
import { Filter, Search } from 'lucide-react';

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onFiltersClick: () => void;
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onFiltersClick,
}: UserFiltersProps) {
  const roleOptions = ['All Roles', 'Administrator', 'Technician', 'Human Resource'];
  const statusOptions = ['All Status', 'Active', 'Inactive'];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
      <div className="flex flex-col md:flex-row gap-3 flex-1 w-full md:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email or username"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Role Dropdown */}
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role === 'All Roles' ? '' : role}>
              {role}
            </option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status === 'All Status' ? '' : status.toLowerCase()}>
              {status}
            </option>
          ))}
        </select>

        {/* Filters Button */}
        <button
          onClick={onFiltersClick}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Create User Button */}
      <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
        + Create User
      </button>
    </div>
  );
}

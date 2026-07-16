import React, { useEffect, useState } from 'react';
import { CreateUser } from '../types/user';

interface CreateUserFormProps {
  onSubmit: (user: CreateUser) => Promise<void>;
  onCancel: () => void;
}

export function CreateUserForm({ onSubmit, onCancel }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUser>({
    email: '',
    full_name: '',
    phone_number: '',
    role_id: 0,
    permission_ids: [],
  });
  const [roles, setRoles] = useState<Array<{ id: number; name: string; permissions: Array<{ id: number; module: string; description: string }> }>>([]);
  const [permissions, setPermissions] = useState<Array<{ id: number; module: string; description: string }>>([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [customRoleName, setCustomRoleName] = useState('');
  const [roleError, setRoleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    Promise.all([
      fetch('http://127.0.0.1:8000/api/roles/roles/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
      fetch('http://127.0.0.1:8000/api/roles/permissions/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    ])
      .then(async ([rolesResponse, permissionsResponse]) => {
        if (!rolesResponse.ok || !permissionsResponse.ok) throw new Error('Unable to load roles and permissions. Please sign in again as an Administrator.');
        return [await rolesResponse.json(), await permissionsResponse.json()];
      })
      .then(([data, permissionsData]) => {
        const availableRoles = Array.isArray(data) ? data : data.results || [];
        const availablePermissions = Array.isArray(permissionsData) ? permissionsData : permissionsData.results || [];
        setRoles(availableRoles);
        setPermissions(availablePermissions);
        if (availableRoles.length) setFormData((current) => ({ ...current, role_id: current.role_id || availableRoles[0].id }));
      })
      .catch((reason) => {
        setRoles([]);
        setRoleError(reason instanceof Error ? reason.message : 'Unable to load roles and permissions.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_id || formData.role_id === -1) {
      setSubmitError('Select an existing role, or create the new “Other” role first.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ ...formData, permission_ids: selectedPermissionIds });
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Unable to send the invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateUser, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedRole = roles.find((role) => role.id === formData.role_id);
  const isAdministrator = selectedRole?.name === 'Administrator';
  const selectedPermissionIds = isAdministrator ? permissions.map((permission) => permission.id) : formData.permission_ids;
  const groupedPermissions = permissions.reduce<Record<string, typeof permissions>>((groups, permission) => {
    (groups[permission.module] ||= []).push(permission);
    return groups;
  }, {});
  const togglePermission = (id: number) => setFormData((current) => ({ ...current, permission_ids: current.permission_ids.includes(id) ? current.permission_ids.filter((permissionId) => permissionId !== id) : [...current.permission_ids, id] }));

  const createCustomRole = async () => {
    const name = customRoleName.trim();
    if (!name) return setRoleError('Enter a name for the new role.');
    setIsCreatingRole(true);
    setRoleError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/roles/roles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name, description: `Custom ${name} role`, permission_ids: [] }),
      });
      const role = await response.json();
      if (!response.ok) throw new Error(role.detail || role.name?.[0] || 'Unable to create role.');
      setRoles((current) => [...current, { ...role, permissions: [] }]);
      setFormData((current) => ({ ...current, role_id: role.id }));
      setCustomRoleName('');
    } catch (reason) {
      setRoleError(reason instanceof Error ? reason.message : 'Unable to create role.');
    } finally {
      setIsCreatingRole(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            Personal Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number || ''}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                placeholder="+256 700 000 000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
            Access Assignment
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role_id}
                onChange={(e) => {
                  const roleId = Number(e.target.value);
                  const role = roles.find((item) => item.id === roleId);
                  handleChange('role_id', roleId);
                  if (role?.name === 'Administrator') setFormData((current) => ({ ...current, role_id: roleId, permission_ids: permissions.map((permission) => permission.id) }));
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={0}>Select a role</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                <option value={-1}>Other — create a new role</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Module access is controlled by this role's permissions.</p>
              {roleError && <p className="mt-1 text-xs text-red-700">{roleError}</p>}
            </div>
            {formData.role_id === -1 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">New role name</label>
                <div className="flex gap-2">
                  <input value={customRoleName} onChange={(e) => setCustomRoleName(e.target.value)} placeholder="e.g. Intern or Operations Manager" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2" />
                  <button type="button" onClick={createCustomRole} disabled={isCreatingRole} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{isCreatingRole ? 'Creating…' : 'Create role'}</button>
                </div>
                {roleError && <p className="mt-2 text-xs text-red-700">{roleError}</p>}
              </div>
            )}
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">Module permissions</p>
              <p className="mb-3 text-xs text-gray-500">Choose the sidebar modules and actions this individual may access. Administrators receive all permissions automatically.</p>
              <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module}><p className="mb-1 text-xs font-semibold uppercase text-gray-500">{module}</p>
                    {modulePermissions.map((permission) => <label key={permission.id} className="flex items-center gap-2 py-1 text-sm text-gray-700"><input type="checkbox" disabled={isAdministrator} checked={selectedPermissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} />{permission.description}</label>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending invitation…' : 'Send Account Setup Invitation'}
        </button>
      </form>
    </div>
  );
}

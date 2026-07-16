import React, { useEffect, useState } from 'react';

type Permission = { id: number; code: string; module: string; description: string };
type Role = { id: number; name: string; permissions: Permission[] };

interface PermissionManagerProps {
  role: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const apiHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export function PermissionManager({ role, onSave, onCancel }: PermissionManagerProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/roles/roles/', { headers: apiHeaders() }),
      fetch('http://127.0.0.1:8000/api/roles/permissions/', { headers: apiHeaders() }),
    ])
      .then(async ([rolesResponse, permissionsResponse]) => {
        if (!rolesResponse.ok || !permissionsResponse.ok) throw new Error('Unable to load role permissions.');
        const rolesData = await rolesResponse.json();
        const permissionsData = await permissionsResponse.json();
        const roles: Role[] = Array.isArray(rolesData) ? rolesData : rolesData.results || [];
        const allPermissions: Permission[] = Array.isArray(permissionsData) ? permissionsData : permissionsData.results || [];
        const matchingRole = roles.find((item) => item.name === role) || null;
        setSelectedRole(matchingRole);
        setPermissions(allPermissions);
        setSelectedIds((matchingRole?.permissions || []).map((permission) => permission.id));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load permissions.'));
  }, [role]);

  const togglePermission = (permissionId: number) => {
    setSelectedIds((current) => current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId]);
  };

  const save = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/roles/roles/${selectedRole.id}/`, {
        method: 'PATCH', headers: apiHeaders(), body: JSON.stringify({ permission_ids: selectedIds }),
      });
      if (!response.ok) throw new Error('Unable to save role permissions.');
      onSave?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
    (groups[permission.module] ||= []).push(permission);
    return groups;
  }, {});

  return (
    <div className="max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><h3 className="text-lg font-semibold text-gray-900">Role module permissions</h3><p className="text-sm text-gray-600">{role}: select exactly what everyone in this role may access.</p></div>
        <div className="flex gap-2"><button onClick={onCancel} className="rounded-lg border px-4 py-2">Cancel</button><button onClick={save} disabled={!selectedRole || saving} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save permissions'}</button></div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
        <section key={module} className="mb-4 rounded-xl border border-gray-200 p-4">
          <h4 className="mb-3 font-semibold text-gray-900">{module}</h4>
          <div className="grid gap-2 md:grid-cols-2">
            {modulePermissions.map((permission) => <label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-gray-50"><input type="checkbox" checked={selectedIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="mt-1" /><span><span className="block text-sm font-medium">{permission.description}</span><span className="text-xs text-gray-500">{permission.code}</span></span></label>)}
          </div>
        </section>
      ))}
    </div>
  );
}

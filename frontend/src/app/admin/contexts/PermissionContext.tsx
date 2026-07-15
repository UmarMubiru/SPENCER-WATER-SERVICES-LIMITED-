import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Permission {
  module: string;
  permission: 'view' | 'edit' | 'full' | 'none';
}

interface PermissionContextType {
  permissions: Permission[];
  userRole: string;
  loading: boolean;
  hasAccess: (module: string, requiredPermission?: 'view' | 'edit' | 'full') => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children, userId }: { children: ReactNode; userId?: number }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users/permissions/user_permissions/?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.map((p: any) => ({
          module: p.module,
          permission: p.permission
        })));
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [userId]);

  const hasAccess = (module: string, requiredPermission: 'view' | 'edit' | 'full' = 'view') => {
    const perm = permissions.find(p => p.module === module);
    if (!perm || perm.permission === 'none') return false;

    const permissionLevels = { none: 0, view: 1, edit: 2, full: 3 };
    return permissionLevels[perm.permission] >= permissionLevels[requiredPermission];
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  return (
    <PermissionContext.Provider value={{ permissions, userRole, loading, hasAccess, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}

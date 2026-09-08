import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { LayoutDashboard, Users, Building2, ClipboardList, Settings, BarChart3, ChevronRight, Package, Wrench, FileText, Briefcase, TrendingUp, Calendar, Shield, UserCheck, FolderTree, Key, Activity, DollarSign, FileText as FileIcon, Archive, History, Image as ImageIcon } from 'lucide-react';

interface SidebarProps {
  activePath: string;
  onNavigate?: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  permission: string | string[];
  module?: string | string[];
  icon?: any;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    permission: 'admin:dashboard',
    module: 'dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'User Management',
    href: '/admin/user-management',
    permission: 'admin:manage_users',
    module: 'users',
    icon: Settings,
    children: [
      { name: 'Pending Approvals', href: '/admin/user-management/credentials', permission: 'admin:manage_users', module: 'users', icon: UserCheck },
      { name: 'Departments & Job Titles', href: '/admin/user-management/departments', permission: 'admin:manage_users', module: 'users', icon: FolderTree },
      { name: 'Roles', href: '/admin/user-management/roles', permission: 'admin:manage_users', module: 'users', icon: Key },
    ]
  },
  {
    name: 'Employee Management',
    href: '/admin/employees',
    permission: 'hr:read',
    module: 'employees',
    icon: Users,
    children: [
      { name: 'All Employees', href: '/admin/employees', permission: 'hr:read', module: 'employees' },
      { name: 'Contracts Management', href: '/admin/employees/contracts', permission: 'hr:read', module: 'employees' },
    ]
  },
  {
    name: 'Customer Relations Management',
    href: '/admin/crm',
    permission: 'crm:read',
    module: ['crm', 'leads'],
    icon: Building2,
    children: [
      { name: 'Leads', href: '/admin/crm/leads', permission: 'crm:read', module: ['crm', 'leads'] },
      { name: 'Calendar', href: '/admin/crm/calendar', permission: 'crm:read', module: ['crm', 'leads'] },
      { name: 'Quotations', href: '/admin/crm/quotations', permission: 'crm:read', module: ['crm', 'leads'] },
    ]
  },
  {
    name: 'Project Management',
    href: '/admin/projects',
    permission: 'portfolio:read',
    module: 'projects',
    icon: FolderTree,
    children: [
      { name: 'All Projects', href: '/admin/projects/dashboard', permission: 'portfolio:read', module: 'projects' },
      { name: 'Activities', href: '/admin/projects/activities', permission: 'portfolio:read', module: 'projects' },
      { name: 'Resources', href: '/admin/projects/resources', permission: 'portfolio:read', module: 'projects' },
      { name: 'Casual Workers', href: '/admin/projects/casual-workers', permission: 'portfolio:read', module: 'projects' },
    ]
  },
  {
    name: 'Inventory Management',
    href: '/admin/inventory',
    permission: 'inventory:read',
    module: 'inventory',
    icon: Package,
    children: [
      { name: 'Dashboard', href: '/admin/inventory/dashboard', permission: 'inventory:read', module: 'inventory' },
      { name: 'Inventory Items', href: '/admin/inventory/items', permission: 'inventory:read', module: 'inventory' },
      { name: 'Categories', href: '/admin/inventory/categories', permission: 'inventory:read', module: 'inventory' },
      { name: 'Suppliers', href: '/admin/inventory/suppliers', permission: 'inventory:read', module: 'inventory' },
      { name: 'Material Requests', href: '/admin/inventory/requests', permission: 'inventory:read', module: 'inventory' },
      { name: 'Stock Movements', href: '/admin/inventory/movements', permission: 'inventory:read', module: 'inventory' },
      { name: 'Water Taps & Accessories Leads', href: '/admin/inventory/leads', permission: 'inventory:read', module: 'inventory' },
    ]
  },
  {
    name: 'Content Management',
    href: '/admin/content',
    permission: ['blog:read', 'testimonial:read'],
    module: 'content',
    icon: FileText,
    children: [
      { name: 'Website Pages', href: '/admin/content/pages', permission: 'portfolio:write', module: 'content' },
      { name: 'Website Content', href: '/admin/content/website-content', permission: 'portfolio:write', module: 'content' },
      { name: 'Media Library', href: '/admin/content/media', permission: 'portfolio:write', module: 'content' },
    ]
  },
  {
    name: 'Reports & Analytics',
    href: '/admin/reports',
    permission: 'admin:dashboard',
    module: 'reports',
    icon: BarChart3,
    children: [
      { name: 'Executive Overview', href: '/admin/reports/dashboard', permission: 'admin:dashboard', module: 'reports' },
      { name: 'Analytics', href: '/admin/reports/analytics', permission: 'admin:dashboard', module: 'reports' },
      { name: 'Reports', href: '/admin/reports/reports', permission: 'admin:dashboard', module: 'reports' },
      { name: 'Activity Center', href: '/admin/reports/activity', permission: 'admin:dashboard', module: 'reports' },
      { name: 'Insights & Trends', href: '/admin/reports/insights', permission: 'admin:dashboard', module: 'reports' },
    ]
  },
];

export function Sidebar({ activePath, onNavigate, isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showTopLevel, setShowTopLevel] = useState(true);

  useEffect(() => {
    setMounted(true);
    setProfilePicture(localStorage.getItem('profile_picture'));
  }, []);

  // Check if user has permission for a specific module
  const hasPermission = (permission: string | string[], module?: string | string[]) => {
    // Check module permissions first
    if (module && user?.department) {
      const modules = Array.isArray(module) ? module : [module];
      return modules.some((mod) => {
        const modulePerm = user.module_permissions?.[mod];
        return modulePerm === 'view' || modulePerm === 'edit' || modulePerm === 'full';
      });
    }

    // Fallback to legacy permission checking
    if (user?.permissions) {
      const permissions = Array.isArray(permission) ? permission : [permission];
      return permissions.some(perm => user.permissions?.includes(perm));
    }

    // Default to showing all items if no permissions are set
    return true;
  };

  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => 
    hasPermission(item.permission, item.module)
  ).map(item => ({
    ...item,
    children: item.children?.filter(child => 
      hasPermission(child.permission, child.module)
    )
  }));

  // Find active module
  const activeModule = filteredNavigationItems.find(item => {
    if (item.href && item.children && item.children.length > 0) {
      const path = activePath || '';
      return path.startsWith(item.href) && item.href !== '/admin/dashboard';
    }
    return false;
  });

  const isInModule = !!activeModule;

  useEffect(() => {
    setShowTopLevel(!isInModule);
  }, [isInModule]);
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: '#123B8C',
          width: '16rem'
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: '#f3f4f6' }}>
          <Link href="/" className="flex items-center justify-center flex-1">
            <img
              src="/sws-logo-current.png"
              alt="Spencer Water Services Logo"
              className="object-contain"
              width={180}
              height={120}
            />
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {showTopLevel ? (
            // Show top-level modules
            filteredNavigationItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = activePath === item.href;

              return (
                <div key={item.name}>
                  <Link
                    href={item.href || '#'}
                    onClick={() => {
                      if (hasChildren) {
                        // Don't navigate, just show module view
                      } else {
                        onNavigate?.(item.href || '');
                        onClose?.();
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm"
                    style={{
                      color: isActive ? '#123B8C' : 'white',
                      backgroundColor: isActive ? 'white' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.icon && <item.icon size={18} className="text-white" />}
                    <span className="font-medium">{item.name}</span>
                    {hasChildren && <ChevronRight size={16} className="ml-auto" />}
                    {isActive && !hasChildren && <span className="ml-auto">→</span>}
                  </Link>
                </div>
              );
            })
          ) : activeModule ? (
            // Show module children with back button
            <>
              <button
                onClick={() => setShowTopLevel(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm text-white hover:bg-white/10 mb-2"
              >
                <ChevronRight size={16} className="rotate-180" />
                <span className="font-medium">Back to Modules</span>
              </button>
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                  {activeModule.name}
                </p>
                {activeModule.children?.map((child) => {
                  const isActive = activePath === child.href;
                  return (
                    <Link
                      key={child.name}
                      href={child.href || '#'}
                      onClick={() => {
                        onNavigate?.(child.href || '');
                        onClose?.();
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm"
                      style={{
                        color: isActive ? '#123B8C' : 'white',
                        backgroundColor: isActive ? 'white' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span className="font-medium">{child.name}</span>
                      {isActive && <span className="ml-auto">→</span>}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            // Fallback to top-level
            filteredNavigationItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActive = activePath === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href || '#'}
                  onClick={() => {
                    onNavigate?.(item.href || '');
                    onClose?.();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm"
                  style={{
                    color: isActive ? '#123B8C' : 'white',
                    backgroundColor: isActive ? 'white' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.icon && <item.icon size={18} className="text-white" />}
                  <span className="font-medium">{item.name}</span>
                  {hasChildren && <ChevronRight size={16} className="ml-auto" />}
                  {isActive && !hasChildren && <span className="ml-auto">→</span>}
                </Link>
              );
            })
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <Link href="/admin/profile" className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
            {mounted && profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <span className="font-semibold text-white">
                  {user?.full_name?.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-white">
                {user?.full_name || user?.first_name || user?.username || 'User'}
              </p>
              <p className="text-xs truncate text-blue-100">
                {user?.job_title || user?.role || 'No Job Title'}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

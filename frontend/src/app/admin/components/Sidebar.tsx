import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';

interface SidebarProps {
  activePath: string;
  onNavigate?: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', permission: 'admin:dashboard' },
  { name: 'Employee Management', href: '/admin/employees/dashboard', permission: 'hr:read' },
  { name: 'Customer Management', href: '/admin/crm/dashboard', permission: 'crm:read' },
  { name: 'Project Management', href: '/admin/projects/dashboard', permission: 'portfolio:read' },
  { name: 'Tender Management', href: '/admin/tenders/dashboard', permission: 'tender:read' },
  { name: 'Inventory Management', href: '/admin/inventory/dashboard', permission: 'inventory:read' },
  { name: 'Content Dashboard', href: '/admin/content/dashboard', permission: ['blog:read', 'testimonial:read'] },
  { name: 'User Management', href: '/admin/users/dashboard', permission: 'admin:manage_users' },
  { name: 'Reports & Analytics', href: '/admin/reports/dashboard', permission: 'admin:dashboard' },
];

export function Sidebar({ activePath, onNavigate, isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setProfilePicture(localStorage.getItem('profile_picture'));
  }, []);
  
  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    const userPermissions = user?.permissions;
    if (!userPermissions?.length) {
      return false;
    }
    const requiredPermissions = Array.isArray(item.permission) ? item.permission : [item.permission];
    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  });
  
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
          {filteredNavigationItems.map((item) => {
            const isActive = activePath === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  onNavigate?.(item.href);
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
                <span className="font-medium">{item.name}</span>
                {isActive && <span className="ml-auto">→</span>}
              </Link>
            );
          })}
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
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-white">
                {user?.first_name || user?.username || 'User'}
              </p>
              <p className="text-xs truncate text-blue-100">
                {user?.role || 'No Role'}
              </p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

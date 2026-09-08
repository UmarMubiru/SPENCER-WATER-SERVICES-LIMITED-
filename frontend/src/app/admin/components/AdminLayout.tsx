'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  activePath: string;
  onSearch?: (query: string) => void;
}

export function AdminLayout({ children, title, subtitle, activePath, onSearch }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar
            activePath={activePath}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1 lg:ml-[16.25rem] transition-all duration-300 min-h-screen flex flex-col min-w-0">
            {/* Topbar - Fixed */}
            <div className="flex-shrink-0 sticky top-0 z-50">
              <Topbar
                title={title}
                subtitle={subtitle}
                onSearch={onSearch}
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isMenuOpen={isSidebarOpen}
              />
            </div>

            {/* Content */}
            <div className="admin-workspace flex-1 overflow-y-auto overflow-x-auto p-5 md:p-6 hide-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

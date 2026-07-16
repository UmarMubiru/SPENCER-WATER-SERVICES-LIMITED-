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
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Sidebar */}
        <Sidebar 
          activePath={activePath} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Topbar */}
        <Topbar
          title={title}
          subtitle={subtitle}
          onSearch={onSearch}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMenuOpen={isSidebarOpen}
        />

        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}

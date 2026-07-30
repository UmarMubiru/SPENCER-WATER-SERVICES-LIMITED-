'use client';

import { AuthProvider } from '../../contexts/AuthContext';
import AdminNavbar from '@/components/layout/AdminNavBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        {children}
      </div>
    </AuthProvider>
  );
}
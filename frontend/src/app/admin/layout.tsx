'use client';

import { AuthProvider } from '../../contexts/AuthContext';
import { AuthenticatedContentRequests } from './AuthenticatedContentRequests';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider><AuthenticatedContentRequests />{children}</AuthProvider>;
}

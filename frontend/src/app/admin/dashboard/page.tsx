'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../components/AdminLayout';
import { operations, quickAdd } from '../admin-data';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardCard from '../../../components/admin/ui/DashboardCard';
import { LayoutDashboard, Users, Building2, FolderTree, Package, FileText, ClipboardList, Settings, BarChart3, AlertTriangle, Bell, ChevronRight, Clock3 } from 'lucide-react';

const cardModules: Record<string, string[]> = {
  'Employee Management': ['employees'],
  'Customer Relations Management': ['quotations', 'leads', 'crm'],
  'Project Management': ['projects'],
  'Inventory Management': ['inventory'],
  'Content Management': ['content'],
  'User Management': ['users'],
  'Reports & Analytics': ['reports'],
};

const cardIcons: Record<string, any> = {
  'Employee Management': Users,
  'Customer Relations Management': Building2,
  'Project Management': FolderTree,
  'Inventory Management': Package,
  'Content Management': FileText,
  'User Management': Settings,
  'Reports & Analytics': BarChart3,
};

const cardTints: Record<string, string> = {
  'Employee Management': 'from-blue-600 to-blue-700',
  'Customer Relations Management': 'from-sky-500 to-blue-600',
  'Project Management': 'from-blue-600 to-blue-700',
  'Inventory Management': 'from-sky-500 to-blue-600',
  'Content Management': 'from-blue-400 to-blue-600',
  'User Management': 'from-blue-800 to-blue-950',
  'Reports & Analytics': 'from-blue-600 to-blue-700',
};

const quickActionModules: Record<string, string[]> = {
  'New Lead / Quotation': ['quotations', 'leads', 'crm'],
  'New Blog': ['content'],
  'New Project': ['projects'],
  'New Employee': ['employees'],
  'Invite User': ['users'],
};

const modulePermissionCodes: Record<string, string[]> = {
  employees: ['hr:read', 'hr:write'],
  crm: ['crm:read', 'crm:write'],
  leads: ['crm:read', 'crm:write'],
  quotations: ['crm:read', 'crm:write'],
  projects: ['portfolio:read', 'portfolio:write'],
  inventory: ['inventory:read', 'inventory:write'],
  content: ['blog:read', 'blog:write', 'testimonial:read', 'testimonial:write', 'portfolio:read', 'portfolio:write'],
  users: ['admin:manage_users'],
  reports: ['admin:dashboard'],
};

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(operations);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [openAlerts, setOpenAlerts] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
    fetchRecentActivities();
    const refresh = window.setInterval(() => {
      fetchRealStats();
      fetchRecentActivities();
    }, 15000);
    return () => window.clearInterval(refresh);
  }, []);

  useEffect(() => {
    const fetchAttentionItems = async () => {
      try {
        const [alertsResponse, notificationsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/reports/alerts/'),
          token
            ? fetch('http://127.0.0.1:8000/api/notifications/notifications/', {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve(null),
        ]);

        if (alertsResponse.ok) {
          const data = await alertsResponse.json();
          const alerts = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
          setOpenAlerts(alerts.slice(0, 4));
        }
        if (notificationsResponse?.ok) {
          const data = await notificationsResponse.json();
          const notifications = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
          setUnreadNotifications(notifications.filter((item: any) => !item.is_read).slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard alerts:', error);
      }
    };

    fetchAttentionItems();
    const refresh = window.setInterval(fetchAttentionItems, 15000);
    return () => window.clearInterval(refresh);
  }, [token]);

  const fetchRealStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reports/executive-overview/');
      if (!response.ok) throw new Error('Could not load live dashboard summary');
      const data = await response.json();
      const liveCards = data.dashboard_cards || {};

      const updatedStats = operations.map((stat) => {
        const [, label, , color, path] = stat;
        const liveCard = liveCards[label];
        if (liveCard) {
          return [
            String(liveCard.value ?? 0),
            label,
            liveCard.subtitle || '',
            color,
            path
          ];
        }

        return stat;
      });

      setStats(updatedStats);
    } catch (error) {
      console.error('Failed to fetch real stats:', error);
      // Keep sample data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reports/activities/?limit=50');
      if (response.ok) {
        const data = await response.json();
        const activities = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

        // Filter activities based on user's module permissions
        const accessibleModules = Object.entries(modulePermissions)
          .filter(([_, permission]) => ['view', 'edit', 'full'].includes(permission))
          .map(([module, _]) => module);

        const filteredActivities = activities.filter((activity: any) => {
          // If user has no department policy, show all activities (backward compatibility)
          if (!hasDepartmentPolicy) return true;

          // If user is administrator, show all activities
          if (user?.role === 'Administrator') return true;

          // Filter by accessible modules
          if (activity.module && accessibleModules.length > 0) {
            return accessibleModules.includes(activity.module);
          }

          // If no module specified, show it (backward compatibility)
          return true;
        });

        setRecentActivities(filteredActivities.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      // Keep empty array on error
    }
  };

  const modulePermissions = user?.module_permissions || {};
  const hasDepartmentPolicy = Object.keys(modulePermissions).length > 0;
  const canAccess = (modules: string[]) => {
    if (hasDepartmentPolicy) return modules.some((module) => ['view', 'edit', 'full'].includes(modulePermissions[module]));
    if (user?.role === 'Administrator') return true;
    return modules.some((module) => (modulePermissionCodes[module] || []).some((permission) => user?.permissions?.includes(permission)));
  };
  const visibleStats = stats.filter((stat) => canAccess(cardModules[stat[1]] || []));
  const visibleQuickActions = quickAdd.filter((action) => canAccess(quickActionModules[action.label] || []));

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="Welcome back! Here's what's happening with your business today."
      activePath="/admin/dashboard"
      onSearch={(query) => console.log('Search:', query)}
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8 p-8">
          {/* Dashboard Stats Grid */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {visibleStats.map((stat, index) => {
              const [value, label, subtitle, color, path] = stat;
              const Icon = cardIcons[label] || LayoutDashboard;
              const tint = cardTints[label] || 'from-blue-600 to-blue-700';

              return (
                <DashboardCard
                  key={index}
                  label={label}
                  value={value}
                  icon={Icon}
                  tint={tint}
                  href={path}
                />
              );
            })}
          </div>

          {/* Alerts and notifications */}
          <section className="grid gap-5 xl:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-red-100 bg-red-50/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-950">Open Alerts</h3>
                  {openAlerts.length > 0 && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{openAlerts.length}</span>}
                </div>
                <Link href="/admin/reports/activity" className="flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-900">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-red-50">
                {openAlerts.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-500">No open alerts.</p>
                ) : openAlerts.map((alert: any) => (
                  <Link key={alert.id} href={alert.category === 'low_stock' ? '/admin/inventory/dashboard' : '/admin/reports/activity'} className="block px-5 py-4 transition-colors hover:bg-red-50/50">
                    <p className="font-medium text-slate-900">{alert.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-950">Unread Notifications</h3>
                  {unreadNotifications.length > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">{unreadNotifications.length}</span>}
                </div>
                <Link href="/admin/reports/activity" className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-blue-50">
                {unreadNotifications.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-slate-500">You have no unread notifications.</p>
                ) : unreadNotifications.map((notification: any) => (
                  <Link key={notification.id} href={notification.metadata?.href || '/admin/reports/activity'} className="block px-5 py-4 transition-colors hover:bg-blue-50/50">
                    <p className="font-medium text-slate-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                <p className="mt-0.5 text-sm text-slate-500">The latest 10 actions across your accessible modules.</p>
              </div>
              <Link href="/admin/reports/activity" className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900">
                Activity Center <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivities.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">No recent activity to display yet.</div>
              ) : recentActivities.map((activity: any) => {
                const actor = activity.performed_by_name || activity.performed_by_username || activity.employee_name || activity.user || 'System';
                const timestamp = activity.created_at || activity.timestamp;
                return (
                  <Link
                    key={activity.id}
                    href={`/admin/reports/activity?activity=${activity.id}`}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {actor.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{activity.action || activity.description || 'Activity recorded'}</p>
                        {activity.module && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">{activity.module}</span>}
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {activity.description || 'No additional description'} <span className="text-slate-400">·</span> by {actor}
                      </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-1 text-xs text-slate-500 sm:flex">
                      <Clock3 className="h-3.5 w-3.5" />
                      {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

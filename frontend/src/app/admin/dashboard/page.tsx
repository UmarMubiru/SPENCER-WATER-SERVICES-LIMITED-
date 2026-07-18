'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '../components/AdminLayout';
import { api } from '../../../lib/api';
import { operations, quickAdd } from '../admin-data';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(operations);
  const [recentActivities, setRecentActivities] = useState([
    { action: 'New lead created', user: 'John Kamau', time: '2 minutes ago' },
    { action: 'Quotation approved', user: 'Sarah Nankya', time: '15 minutes ago' },
    { action: 'Project milestone completed', user: 'Michael Ochieng', time: '1 hour ago' },
    { action: 'Inventory alert triggered', user: 'System', time: '2 hours ago' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      // Fetch Employees stats
      const employeesResponse = await api.get('/employees/dashboard/');
      let employeesStats = null;
      if (employeesResponse.ok) {
        employeesStats = await employeesResponse.json();
      }

      // Fetch Users stats
      const usersResponse = await api.get('/users/stats/');
      let usersStats = null;
      if (usersResponse.ok) {
        usersStats = await usersResponse.json();
      }

      // Update stats with real data where available
      const updatedStats = operations.map((stat) => {
        const [value, label, subtitle, color, path] = stat;

        // Update Employees card
        if (label === 'Employee Management' && employeesStats) {
          return [
            employeesStats.total_employees.toString(),
            label,
            `${employeesStats.contracts_expiring_soon} contracts expiring`,
            color,
            path
          ];
        }

        // Update Users-related cards
        if (label === 'User Management' && usersStats) {
          return [
            usersStats.active_users.toString(),
            label,
            `${usersStats.administrators} administrators`,
            color,
            path
          ];
        }

        return stat;
      });

      setStats(updatedStats);

      // Update recent activities with real data
      if (employeesStats && employeesStats.recent_activities) {
        setRecentActivities(employeesStats.recent_activities);
      }
    } catch (error) {
      console.error('Failed to fetch real stats:', error);
      // Keep sample data on error
    } finally {
      setLoading(false);
    }
  };

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
        <>
          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const [value, label, subtitle, color, path] = stat;
              const colorClasses = {
                blue: {
                  bg: 'bg-blue-50',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  valueColor: 'text-blue-700',
                },
                green: {
                  bg: 'bg-green-50',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  valueColor: 'text-green-700',
                },
                amber: {
                  bg: 'bg-amber-50',
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600',
                  valueColor: 'text-amber-700',
                },
                red: {
                  bg: 'bg-red-50',
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  valueColor: 'text-red-700',
                },
              };

              const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

              return (
                <Link key={index} href={path}>
                  <div
                    className={`${colors.bg} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                        <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>
                          {value}
                        </p>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                      </div>
                      <div className={`${colors.iconBg} ${colors.iconColor} p-3 rounded-lg`}>
                        <span className="text-2xl">📊</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {quickAdd.slice(0, 6).map((action) => (
                <Link key={action.label} href={action.path}>
                  <button
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                  >
                    <span className="text-2xl">➕</span>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {(activity.employee_name || activity.user || 'System').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action || activity.description}</p>
                    <p className="text-sm text-gray-500">by {activity.employee_name || activity.user || 'System'}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
            </>
          )}
    </AdminLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import Link from 'next/link';
import { ArrowRight, Activity, Users, Briefcase, Package, MessageSquare, FileText, Building, TrendingUp } from 'lucide-react';

interface ActivitySummary {
  module: string;
  module_display: string;
  count: number;
  last_activity: string;
}

export default function SystemActivityPage() {
  const [summaries, setSummaries] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reports/activities/summary/');
      const data = await response.json();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module: string) => {
    const icons: Record<string, any> = {
      employment: Users,
      projects: Briefcase,
      inventory: Package,
      crm: MessageSquare,
      users: Building,
      content: FileText,
      tenders: TrendingUp,
    };
    return icons[module] || Activity;
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      employment: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      projects: 'bg-green-50 border-green-200 hover:bg-green-100',
      inventory: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      crm: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      users: 'bg-red-50 border-red-200 hover:bg-red-100',
      content: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      tenders: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    };
    return colors[module] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  const modules = [
    { key: 'employment', display: 'Employment Management', path: '/admin/reports/system-activity/employment' },
    { key: 'projects', display: 'Project Management', path: '/admin/reports/system-activity/projects' },
    { key: 'inventory', display: 'Inventory Management', path: '/admin/reports/system-activity/inventory' },
    { key: 'crm', display: 'CRM & Quotations', path: '/admin/reports/system-activity/crm' },
    { key: 'users', display: 'User Management', path: '/admin/reports/system-activity/users' },
    { key: 'content', display: 'Content Management', path: '/admin/reports/system-activity/content' },
    { key: 'tenders', display: 'Tender Management', path: '/admin/reports/system-activity/tenders' },
  ];

  return (
    <AdminLayout
      title="System Activity & Audit"
      subtitle="Centralized audit log for all system activities"
      activePath="/admin/reports/system-activity"
    >
      <div className="space-y-6">
        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            modules.map((module) => {
              const Icon = getModuleIcon(module.key);
              const summary = summaries.find(s => s.module === module.key);
              const count = summary?.count || 0;
              const lastActivity = summary?.last_activity || 'No recent activity';

              return (
                <Link key={module.key} href={module.path}>
                  <div className={`border rounded-xl p-6 transition-all cursor-pointer ${getModuleColor(module.key)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${getModuleColor(module.key).split(' ')[0]} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.display}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">{count}</span> activities recorded
                      </p>
                      <p className="text-xs text-gray-500">
                        Last: {lastActivity !== 'No recent activity' ? new Date(lastActivity).toLocaleDateString() : 'No recent activity'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity Across All Modules</h2>
          <p className="text-sm text-gray-600">
            Click on any module above to view detailed activity logs for that specific module.
            Each module page provides filtered views with advanced search capabilities.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsService } from '@/services/reportsService';
import { Card, KPICard, Sparkline } from '@/components/reports';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, Briefcase, Package, DollarSign, AlertTriangle, Calendar, TrendingUp, Download } from 'lucide-react';
import PageHeader from '../../../../components/admin/ui/PageHeader';

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-blue-100 text-blue-700 border-blue-200',
  updated: 'bg-blue-50 text-blue-700 border-blue-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-blue-50 text-blue-700 border-blue-200',
  deleted: 'bg-blue-100 text-blue-700 border-blue-200',
  failed_login: 'bg-blue-800 text-white border-blue-700',
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MODULE_PERMISSIONS: Record<string, string> = {
  Employees: 'employees',
  Projects: 'projects',
  Inventory: 'inventory',
  CRM: 'crm',
  Content: 'content',
  Users: 'users',
};

export default function ExecutiveOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('30d');

  const fetchData = () => {
    reportsService.getExecutiveOverview(dateRange).then(setData);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dateRange]);
  if (!data) return <p>Loading...</p>;

  const modulePermissions = user?.module_permissions || {};
  const hasDepartmentPolicy = Object.keys(modulePermissions).length > 0;
  
  const canAccessModule = (module: string) => {
    if (hasDepartmentPolicy) {
      const modulePermission = modulePermissions[module];
      return ['view', 'edit', 'full'].includes(modulePermission);
    }
    // Fallback for administrators
    return user?.role === 'Administrator';
  };

  const accessibleModules = Object.entries(MODULE_PERMISSIONS)
    .filter(([, module]) => canAccessModule(module))
    .map(([label]) => label);

  const revenueData = data.revenue_trend || [
    { month: 'Jan', revenue: 1.8 },
    { month: 'Feb', revenue: 2.1 },
    { month: 'Mar', revenue: 1.9 },
    { month: 'Apr', revenue: 2.3 },
    { month: 'May', revenue: 2.5 },
    { month: 'Jun', revenue: 2.3 },
  ];

  const employeeDistribution = data.employee_distribution || [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 32 },
    { name: 'Operations', value: 28 },
    { name: 'Finance', value: 22 },
    { name: 'HR', value: 25 },
  ];

  const projectsByStatus = data.projects_by_status || [
    { status: 'Not Started', count: 5 },
    { status: 'In Progress', count: 12 },
    { status: 'Review', count: 4 },
    { status: 'Completed', count: 3 },
  ];

  return (
    <AdminLayout
      title="Executive Overview"
      subtitle="CEO Dashboard - Key performance indicators"
      activePath="/admin/reports/dashboard"
    >
      <div className="space-y-4 p-5 md:p-6">
        {/* Header with Date Range and Export */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['Today', '30d', 'Quarter', 'Custom'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                    }`}
                  >
                    {range === '30d' ? 'Last 30 Days' : range}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-medium text-blue-900 hover:bg-blue-50">
                <Download className="w-3 h-3" />
                Export PDF
              </button>
            </div>

            {/* Module Navigation - Filtered by Department Permissions */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {accessibleModules.map((module) => (
                <button
                  key={module}
                  className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-medium text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                >
                  {module}
                </button>
              ))}
              {accessibleModules.length === 0 && (
                <p className="text-sm text-blue-600">No modules accessible based on your department permissions</p>
              )}
            </div>

            {/* KPI Cards - Filtered by accessible modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {canAccessModule('employees') && (
                <KPICard
                  title="Total Employees"
                  value={data.kpis.employees}
                  change={data.kpis.employee_change || 0}
                  sparkline={<Sparkline data={data.kpis.employee_history || [140, 142, 145, 148, 150, 152]} color="#3b82f6" />}
                  icon={<Users className="w-4 h-4 text-blue-600" />}
                />
              )}
              {canAccessModule('projects') && (
                <KPICard
                  title="Running Projects"
                  value={data.kpis.projects}
                  change={data.kpis.project_change || 0}
                  sparkline={<Sparkline data={data.kpis.project_history || [28, 27, 26, 25, 24, 24]} color="#3b82f6" />}
                  icon={<Briefcase className="w-4 h-4 text-blue-600" />}
                />
              )}
              {canAccessModule('crm') && (
                <KPICard
                  title="Pending Quotations"
                  value={data.kpis.pending_quotations}
                  change={data.kpis.quotations_change || 0}
                  changeLabel="new this week"
                  icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
                />
              )}
              {canAccessModule('inventory') && (
                <KPICard
                  title="Inventory Value"
                  value={data.kpis.inventory_value || "UGX 0"}
                  change={data.kpis.inventory_change || 0}
                  sparkline={<Sparkline data={data.kpis.inventory_history || [120, 125, 130, 128, 132, 135]} color="#3b82f6" />}
                  icon={<Package className="w-4 h-4 text-blue-600" />}
                />
              )}
              {canAccessModule('projects') && (
                <KPICard
                  title="Revenue"
                  value={data.kpis.revenue || "UGX 0"}
                  change={data.kpis.revenue_change || 0}
                  sparkline={<Sparkline data={data.kpis.revenue_history || [1.8, 1.9, 2.0, 2.1, 2.2, 2.3]} color="#3b82f6" />}
                  icon={<DollarSign className="w-4 h-4 text-blue-600" />}
                />
              )}
              <KPICard
                title="Critical Alerts"
                value={data.critical_alerts?.length || 0}
                icon={<AlertTriangle className="w-4 h-4 text-blue-600" />}
              />
            </div>

            {/* Charts Grid - Filtered by accessible modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {canAccessModule('projects') && (
                <>
                  {/* Revenue Trend */}
                  <Card title="Revenue Trend" className="xl:col-span-2">
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Projects by Status */}
                  <Card title="Projects by Status">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={projectsByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}

              {canAccessModule('employees') && (
                /* Employee Distribution */
                <Card title="Employee Distribution">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={employeeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.name}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {employeeDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {canAccessModule('crm') && (
                /* Quotation Conversion Funnel */
                <Card title="Quotation Conversion Funnel">
                  <div className="space-y-3">
                    {(data.quotation_funnel || [
                      { label: 'Leads', value: 100, color: '#3b82f6' },
                      { label: 'Quotations Sent', value: 75, color: '#60a5fa' },
                      { label: 'Negotiations', value: 50, color: '#93c5fd' },
                      { label: 'Won', value: 35, color: '#bfdbfe' },
                    ]).map((stage: any) => (
                      <div key={stage.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-blue-900">{stage.label}</span>
                          <span className="text-blue-600">{stage.value}</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${stage.value}%`, backgroundColor: stage.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {canAccessModule('inventory') && (
                /* Low Stock Items */
                <Card title="Low Stock Items">
                  <div className="space-y-2">
                    {(data.low_stock_items || [
                      { name: 'PVC Pipes 2"', qty: 5, level: 20 },
                      { name: 'Water Meters', qty: 8, level: 25 },
                      { name: 'Fittings Kit', qty: 3, level: 15 },
                    ]).map((item: any) => (
                      <div key={item.name} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <div>
                          <p className="font-medium text-xs text-blue-900">{item.name}</p>
                          <p className="text-[10px] text-blue-600">Qty: {item.qty}</p>
                        </div>
                        <span className="text-[10px] font-medium text-blue-700">{item.level}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Upcoming Deadlines - Common to all */}
              <Card title="Upcoming Deadlines">
                <div className="space-y-2">
                  {(data.upcoming_deadlines || [
                    { title: 'Project A Completion', date: '2 days', priority: 'high' },
                    { title: 'Contract Renewal - John Doe', date: '5 days', priority: 'medium' },
                    { title: 'Quotation Submission - XYZ Corp', date: '7 days', priority: 'low' },
                  ]).map((deadline: any) => (
                    <div key={deadline.title} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-xs text-blue-900">{deadline.title}</p>
                        <p className="text-[10px] text-blue-600">{deadline.date}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        deadline.priority === 'high' ? 'bg-blue-200 text-blue-800' :
                        deadline.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {deadline.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Bottom Section: Activity and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Timeline */}
              <Card title="Recent Activity">
                <div className="space-y-4">
                  {(() => {
                    // Filter activities based on user's module permissions
                    const accessibleModules = Object.entries(modulePermissions)
                      .filter(([_, permission]) => ['view', 'edit', 'full'].includes(permission))
                      .map(([module, _]) => module);

                    const filteredActivities = data.recent_activity.filter((activity: any) => {
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

                    return filteredActivities.slice(0, 5).map((activity: any, index: number) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full bg-blue-500`} />
                          {index < filteredActivities.slice(0, 5).length - 1 && (
                            <div className="w-0.5 h-full bg-blue-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[activity.action_type] || 'bg-blue-100 text-blue-700'}`}>
                              {activity.module}
                            </span>
                            <span className="text-sm text-blue-600">{activity.action}</span>
                          </div>
                          <p className="text-xs text-blue-400">{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>

              {/* Critical Alerts */}
              <Card title="Critical Alerts">
                {data.critical_alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-blue-600">No critical alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.critical_alerts.map((alert: any) => (
                      <div key={alert.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-900">{alert.title || alert.message}</p>
                            <p className="text-xs text-blue-700 mt-1">{alert.description || alert.message}</p>
                            {alert.due_date && (
                              <p className="text-xs text-blue-600 mt-2">Due: {new Date(alert.due_date).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
    </AdminLayout>
  );
}

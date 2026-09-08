'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsService } from '@/services/reportsService';
import { Card, KPICard } from '@/components/reports';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, UserCheck, ShieldCheck, Briefcase, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const MODULES = [
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'crm', label: 'CRM', icon: DollarSign },
  { id: 'users', label: 'Users', icon: Users },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AnalyticsPage() {
  const [selectedModule, setSelectedModule] = useState('employees');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const refreshAnalytics = () => reportsService.getAnalytics(selectedModule).then(setData);
    refreshAnalytics();
    const interval = setInterval(refreshAnalytics, 30000);
    return () => clearInterval(interval);
  }, [selectedModule]);

  const renderEmployeeAnalytics = () => {
    if (!data) return null;
    
    const departmentData = data.by_department?.map((item: any) => ({
      name: item.job_title__department__name || 'Unassigned',
      value: item.count,
    })) || [];

    const statusData = data.by_status?.map((item: any) => ({
      name: item.status,
      value: item.count,
    })) || [];

    const employmentTypeData = data.by_employment_type?.map((item: any) => ({
      name: item.employee_type.replace('_', ' '),
      value: item.count,
    })) || [];

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Employees"
            value={data.total_count || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Available"
            value={data.by_status?.find((s: any) => s.status === 'available')?.count || 0}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="On Leave"
            value={data.by_status?.find((s: any) => s.status === 'on_leave')?.count || 0}
            icon={<TrendingDown className="w-6 h-6 text-yellow-600" />}
          />
          <KPICard
            title="Full Time"
            value={data.by_employment_type?.find((e: any) => e.employee_type === 'full_time')?.count || 0}
            icon={<Briefcase className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Employees by Department">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Employee Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value} (${Math.round((entry.percent || 0) * 100)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Employment Type">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={employmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value} (${Math.round((entry.percent || 0) * 100)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {employmentTypeData.map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Job Title Distribution">
            <div className="space-y-3">
              {data.by_job_title?.slice(0, 8).map((item: any) => (
                <div key={item.job_title__title || 'Unassigned'} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.job_title__title || 'Unassigned'}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderProjectsAnalytics = () => {
    if (!data) return null;

    const statusData = data.by_status?.map((item: any) => ({
      name: item.status.replace('_', ' '),
      value: item.count,
    })) || [];

    const serviceLineData = data.by_service_line?.map((item: any) => ({
      name: item.service_line.replace('_', ' '),
      value: item.count,
    })) || [];

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Projects"
            value={data.total_count || 0}
            icon={<Briefcase className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Total Contract Value"
            value={`UGX ${(data.total_contract_value || 0).toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="Avg Completion"
            value={`${Math.round(data.avg_completion_percentage || 0)}%`}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          />
          <KPICard
            title="Overdue"
            value={data.overdue_count || 0}
            icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Projects by Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Projects by Service Line">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceLineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value} (${Math.round((entry.percent || 0) * 100)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceLineData.map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Projects by Lead" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.by_lead?.map((item: any) => (
                <div key={item.project_lead__user__username || 'Unassigned'} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">{item.project_lead__user__username || 'Unassigned'}</span>
                  <span className="font-semibold text-gray-900 bg-white px-3 py-1 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderInventoryAnalytics = () => {
    if (!data) return null;

    const categoryData = data.by_category?.map((item: any) => ({
      name: item.category__name || 'Uncategorized',
      value: item.count,
    })) || [];

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Items"
            value={data.total_items || 0}
            icon={<Package className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Low Stock"
            value={data.low_stock_count || 0}
            icon={<TrendingDown className="w-6 h-6 text-yellow-600" />}
          />
          <KPICard
            title="Out of Stock"
            value={data.out_of_stock_count || 0}
            icon={<TrendingDown className="w-6 h-6 text-red-600" />}
          />
          <KPICard
            title="Total Value"
            value={`UGX ${(data.total_value || 0).toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="Pending Requests"
            value={data.pending_request_count || 0}
            icon={<TrendingDown className="w-6 h-6 text-orange-600" />}
          />
          <KPICard
            title="Units Issued"
            value={data.issued_units || 0}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Inventory by Category">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Low Stock Items">
            <div className="space-y-3 max-h-80 overflow-auto">
              {data.low_stock_items?.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity} / Reorder: {item.reorder_level}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">Reorder</span>
                </div>
              ))}
              {(!data.low_stock_items || data.low_stock_items.length === 0) && (
                <p className="text-gray-500 text-center py-8">No low stock items</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderCrmAnalytics = () => {
    if (!data) return null;

    const pipelineData = data.lead_pipeline?.map((item: any) => ({
      name: item.stage.replace('_', ' '),
      value: item.count,
    })) || [];

    const quotationStatusData = data.quotation_status?.map((item: any) => ({
      name: item.status.replace('_', ' '),
      value: item.count,
    })) || [];

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Leads"
            value={data.total_leads || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Conversion Rate"
            value={`${data.conversion_rate || 0}%`}
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="Total Quotations"
            value={data.total_quotations || 0}
            icon={<Briefcase className="w-6 h-6 text-purple-600" />}
          />
          <KPICard
            title="Quote Success Rate"
            value={`${data.quote_success_rate || 0}%`}
            icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Potential Revenue"
            value={`UGX ${(data.potential_revenue || 0).toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Accepted Value"
            value={`UGX ${(data.accepted_value || 0).toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="New Leads (This Month)"
            value={data.new_leads_this_month || 0}
            icon={<Users className="w-6 h-6 text-purple-600" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Lead Pipeline">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Quotation Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quotationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value} (${Math.round((entry.percent || 0) * 100)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quotationStatusData.map((_entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    );
  };

  const renderUsersAnalytics = () => {
    if (!data) return null;

    const statusData = data.by_account_status?.map((item: any) => ({
      name: item.account_status.replace(/_/g, ' '),
      value: item.count,
    })) || [];

    const roleData = data.by_role?.map((item: any) => ({
      name: item.role__name || 'No role assigned',
      value: item.count,
    })) || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title="Total Users"
            value={data.total_users || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <KPICard
            title="Active Users"
            value={data.active_users || 0}
            icon={<UserCheck className="w-6 h-6 text-green-600" />}
          />
          <KPICard
            title="Staff Users"
            value={data.staff_users || 0}
            icon={<ShieldCheck className="w-6 h-6 text-purple-600" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Users by Account Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Users by Role">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${entry.value} (${Math.round((entry.percent || 0) * 100)}%)`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {roleData.map((entry: { name: string }, index: number) => (
                    <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Role Distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roleData.map((role: { name: string; value: number }, index: number) => (
              <div key={role.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-gray-700 font-medium truncate">{role.name}</span>
                </div>
                <span className="font-semibold text-gray-900 bg-white px-3 py-1 rounded-full">{role.value}</span>
              </div>
            ))}
            {roleData.length === 0 && <p className="text-gray-500 text-center py-8 lg:col-span-3">No user role data available</p>}
          </div>
        </Card>
      </div>
    );
  };

  const renderGenericAnalytics = () => {
    if (!data) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data).slice(0, 6).map(([key, value]: [string, any]) => (
            <KPICard
              key={key}
              title={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              value={typeof value === 'number' ? value : Array.isArray(value) ? value.length : '-'}
            />
          ))}
        </div>
        <Card title="Detailed Data">
          <pre className="text-sm text-gray-700 overflow-auto bg-gray-50 p-4 rounded-lg">{JSON.stringify(data, null, 2)}</pre>
        </Card>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Module-specific analytics and breakdowns"
      activePath="/admin/reports/analytics"
    >
      <div className="p-6">
        {/* Module Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedModule === module.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {module.label}
                </button>
              );
            })}
          </div>

          {/* Analytics Content */}
          <div>
            {!data ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading analytics data...</div>
              </div>
            ) : selectedModule === 'employees' ? (
              renderEmployeeAnalytics()
            ) : selectedModule === 'projects' ? (
              renderProjectsAnalytics()
            ) : selectedModule === 'inventory' ? (
              renderInventoryAnalytics()
            ) : selectedModule === 'crm' ? (
              renderCrmAnalytics()
            ) : selectedModule === 'users' ? (
              renderUsersAnalytics()
            ) : (
              renderGenericAnalytics()
            )}
          </div>
      </div>
    </AdminLayout>
  );
}

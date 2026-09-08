'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/reports';
import {
  Clock, AlertTriangle, Bell, Shield, Filter, Search, CheckCircle,
  XCircle, User, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

const ACTION_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  created: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '✓' },
  updated: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '✎' },
  assigned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '→' },
  approved: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '✓' },
  warning: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '⚠' },
  deleted: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '✕' },
  failed_login: { bg: 'bg-gray-800', text: 'text-white', border: 'border-gray-700', icon: '✕' },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
};

function ActivityReportContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'timeline' | 'alerts' | 'notifications' | 'security'>('timeline');
  const [activity, setActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filters, setFilters] = useState({ module: '', action: '', user: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [securityStats, setSecurityStats] = useState({
    successful_logins: 0,
    failed_logins: 0,
    password_resets: 0,
    locked_accounts: 0,
  });

  const fetchData = () => {
    if (tab === 'timeline') {
      reportsService.getActivity().then(setActivity).catch(() => setActivity([]));
    }
    if (tab === 'alerts') {
      reportsService.listAlerts().then(setAlerts).catch(() => setAlerts([]));
    }
    if (tab === 'notifications') {
      reportsService.getNotifications().then((data) =>
        setNotifications(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [])
      ).catch(() => setNotifications([]));
    }
    if (tab === 'security') {
      reportsService.getSecurityStats().then(setSecurityStats).catch(() =>
        setSecurityStats({ successful_logins: 0, failed_logins: 0, password_resets: 0, locked_accounts: 0 })
      );
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [tab]);

  const resolveAlert = async (id: number) => {
    await reportsService.resolveAlert(id);
    reportsService.listAlerts().then(setAlerts);
  };

  const markNotificationRead = async (id: string) => {
    await reportsService.markNotificationRead(id);
    fetchData();
  };

  const groupActivityByDate = (activities: any[]) => {
    const groups: Record<string, any[]> = {};
    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      let key;
      if (isToday(date)) key = 'Today';
      else if (isYesterday(date)) key = 'Yesterday';
      else key = format(date, 'MMMM d, yyyy');
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(activity);
    });
    return groups;
  };

  const activityGroups = groupActivityByDate(activity);
  const selectedActivityId = searchParams.get('activity');
  const selectedActivity = activity.find((item) => String(item.id) === selectedActivityId);

  const formatAuditValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'No data recorded';
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };

  return (
    <AdminLayout
      title="Activity Center"
      subtitle="Timeline, alerts, and security logs"
      activePath="/admin/reports/activity"
    >
      <div className="p-6">
        {/* Tab Navigation */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            {([
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Shield },
            ] as const).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Timeline */}
              <div className="lg:col-span-3 space-y-6">
                {selectedActivity && (
                  <Card className="overflow-hidden border border-blue-200 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-blue-100 bg-blue-50 px-5 py-4">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-semibold capitalize text-blue-700">{selectedActivity.module}</span>
                          <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium capitalize text-slate-600">{selectedActivity.action_type || 'recorded'}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">{selectedActivity.action || 'Activity details'}</h2>
                        <p className="mt-1 text-sm text-slate-600">{selectedActivity.description || 'No additional description was recorded.'}</p>
                      </div>
                      <Link href="/admin/reports/activity" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close details</Link>
                    </div>
                    <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                      <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Performed by</p><p className="mt-1 text-sm font-medium text-slate-900">{selectedActivity.performed_by_name || selectedActivity.performed_by_username || 'System'}</p></div>
                      <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recorded</p><p className="mt-1 text-sm font-medium text-slate-900">{selectedActivity.created_at ? format(new Date(selectedActivity.created_at), 'PPpp') : 'Unknown'}</p></div>
                      <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reference</p><p className="mt-1 break-all text-sm font-medium text-slate-900">{selectedActivity.reference_type || 'No reference'}{selectedActivity.reference_id ? ` · ${selectedActivity.reference_id}` : ''}</p></div>
                      <div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Department</p><p className="mt-1 text-sm font-medium text-slate-900">{selectedActivity.department || 'Not specified'}</p></div>
                    </div>
                    <div className="grid gap-4 border-t border-slate-100 px-5 py-4 lg:grid-cols-2">
                      <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Before</p><pre className="max-h-44 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{formatAuditValue(selectedActivity.old_value)}</pre></div>
                      <div><p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">After</p><pre className="max-h-44 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{formatAuditValue(selectedActivity.new_value)}</pre></div>
                    </div>
                  </Card>
                )}
                {/* Filters */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search activity..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                      />
                    </div>
                  </div>
                </div>

                {showFilters && (
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                          <option value="">All Modules</option>
                          <option value="employees">Employees</option>
                          <option value="projects">Projects</option>
                          <option value="inventory">Inventory</option>
                          <option value="crm">CRM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                          <option value="">All Actions</option>
                          <option value="created">Created</option>
                          <option value="updated">Updated</option>
                          <option value="deleted">Deleted</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                        <input type="text" placeholder="Search by user..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                {Object.entries(activityGroups).map(([date, activities]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
                    </div>
                    <div className="space-y-3 ml-1.5">
                      {activities.map((activity, index) => {
                        const colors = ACTION_COLORS[activity.action_type] || ACTION_COLORS.created;
                        return (
                          <div key={activity.id} className="relative pl-8 pb-4">
                            {/* Timeline line */}
                            {index < activities.length - 1 && (
                              <div className="absolute left-1.5 top-8 bottom-0 w-0.5 bg-gray-200" />
                            )}
                            {/* Timeline dot */}
                            <div className={`absolute left-0 top-1 w-3 h-3 rounded-full border-2 ${
                              activity.action_type === 'created' ? 'bg-green-500 border-green-200' :
                              activity.action_type === 'updated' ? 'bg-yellow-500 border-yellow-200' :
                              activity.action_type === 'approved' ? 'bg-purple-500 border-purple-200' :
                              activity.action_type === 'deleted' ? 'bg-red-500 border-red-200' :
                              'bg-blue-500 border-blue-200'
                            }`} />
                            
                            {/* Activity Card */}
                            <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${colors.text} ${colors.border} border`}>
                                    {activity.module}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(activity.created_at), 'HH:mm')}
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 mb-1">{activity.action}</p>
                              {activity.description && (
                                <p className="text-sm text-gray-600">{activity.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                <span>{activity.performed_by_username || 'System'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Panel */}
              <div className="space-y-4">
                <Card title="Activity Summary">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today</span>
                      <span className="font-semibold">{activity.filter(a => isToday(new Date(a.created_at))).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold">{activity.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Most Active Module</span>
                      <span className="font-semibold">Employees</span>
                    </div>
                  </div>
                </Card>

                <Card title="Open Alerts">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium text-red-700">Critical</span>
                      <span className="font-bold text-red-700">{alerts.filter(a => a.priority === 'critical').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm font-medium text-orange-700">High</span>
                      <span className="font-bold text-orange-700">{alerts.filter(a => a.priority === 'high').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm font-medium text-yellow-700">Medium</span>
                      <span className="font-bold text-yellow-700">{alerts.filter(a => a.priority === 'medium').length}</span>
                    </div>
                  </div>
                </Card>

                <Card title="Quick Actions">
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4" />
                      Mark All Read
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                      <XCircle className="w-4 h-4" />
                      Clear History
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {tab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Alerts</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    All
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Open
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Resolved
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${
                    alert.priority === 'critical' ? 'border-l-red-500' :
                    alert.priority === 'high' ? 'border-l-orange-500' :
                    alert.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${PRIORITY_COLORS[alert.priority] || PRIORITY_COLORS.low}`}>
                            {alert.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{alert.title || alert.message}</h3>
                        <p className="text-sm text-gray-600">{alert.description || alert.message}</p>
                        {alert.reference_type && (
                          <p className="text-xs text-gray-500 mt-2">
                            Related to: {alert.reference_type} #{alert.reference_id}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="ml-4 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    </div>
                  </Card>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No alerts at this time.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Card>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => !notification.is_read && markNotificationRead(notification.id)}
                        className={`block w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                          notification.is_read ? 'bg-white' : 'bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          </div>
                          {!notification.is_read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />}
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security Logs</h2>
              
              {/* Security Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Successful Logins</p>
                      <p className="text-2xl font-bold text-gray-900">{securityStats.successful_logins}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Failed Logins</p>
                      <p className="text-2xl font-bold text-gray-900">{securityStats.failed_logins}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Password Resets</p>
                      <p className="text-2xl font-bold text-gray-900">{securityStats.password_resets}</p>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Shield className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Locked Accounts</p>
                      <p className="text-2xl font-bold text-gray-900">{securityStats.locked_accounts}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Security Events */}
              <Card title="Recent Security Events">
                <div className="space-y-3">
                  {activity.filter(a => a.action_type === 'failed_login' || a.module === 'security').slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${
                          event.action_type === 'failed_login' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {event.action_type === 'failed_login' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Shield className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{event.action}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{format(new Date(event.created_at), 'HH:mm')}</p>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
    </AdminLayout>
  );
}

export default function ActivityCenterPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6">Loading...</div>}>
      <ActivityReportContent />
    </Suspense>
  );
}

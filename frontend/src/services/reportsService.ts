const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function authHeaders() {
  // Older screens store the JWT as `token`, while newer auth flows use
  // `access_token`. Use either so all Reports views see the same user data
  // as the top-bar notification bell.
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.detail || json.message || text || 'Request failed');
    } catch {
      throw new Error(text || 'Request failed');
    }
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const reportsService = {
  getExecutiveOverview: (dateRange?: string) => fetch(`${API_URL}/api/reports/executive-overview/${dateRange ? `?date_range=${dateRange}` : ''}`, { headers: authHeaders() }).then(handle),
  getAnalytics: (type: string) => fetch(`${API_URL}/api/reports/analytics/?type=${type}`, { headers: authHeaders() }).then(handle),
  getActivity: (module?: string) =>
    fetch(`${API_URL}/api/reports/activity/${module ? `?module=${module}` : ''}`, { headers: authHeaders() }).then(handle),
  listAlerts: () => fetch(`${API_URL}/api/reports/alerts/`, { headers: authHeaders() }).then(handle),
  resolveAlert: (id: number) => fetch(`${API_URL}/api/reports/alerts/${id}/resolve/`, { method: 'POST', headers: authHeaders() }).then(handle),
  generateReport: (module: string, fields: string[], filters: any) =>
    fetch(`${API_URL}/api/reports/generate/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ module, fields, filters }) }).then(handle),
  listSavedReports: () => fetch(`${API_URL}/api/reports/saved-reports/`, { headers: authHeaders() }).then(handle),
  saveReport: (data: any) => fetch(`${API_URL}/api/reports/saved-reports/`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) }).then(handle),
  listScheduledReports: () => fetch(`${API_URL}/api/reports/scheduled-reports/`, { headers: authHeaders() }).then(handle),
  getInsights: () => fetch(`${API_URL}/api/reports/insights/`, { headers: authHeaders() }).then(handle),
  getSecurityStats: () => fetch(`${API_URL}/api/reports/security-stats/`, { headers: authHeaders() }).then(handle),
  getNotifications: () => fetch(`${API_URL}/api/notifications/notifications/`, { headers: authHeaders() }).then(handle),
  markNotificationRead: (id: string) => fetch(`${API_URL}/api/notifications/notifications/${id}/mark_read/`, { method: 'POST', headers: authHeaders() }).then(handle),
};

'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { api } from '../../../../lib/api';
import Link from 'next/link';

interface Report {
  id: string;
  report_type: string;
  category: string;
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';
  file_format: string;
  date_range_start?: string;
  date_range_end?: string;
  generated_by?: string;
  requested_at: string;
  completed_at?: string;
  error_message?: string;
}

export default function ReportsDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const [generateForm, setGenerateForm] = useState({
    category: '',
    report_type: '',
    file_format: 'PDF',
    date_range_start: '',
    date_range_end: '',
  });

  const reportTypes = {
    'EXECUTIVE': ['Executive Summary', 'Monthly Business Review', 'Quarterly Performance Report'],
    'PROJECT': ['Project Status Report', 'Project Timeline Report', 'Resource Utilization Report'],
    'FINANCIAL': ['Revenue Report', 'Expense Report', 'Profit Loss Statement'],
    'TENDER': ['Tender Status Report', 'Win Rate Analysis', 'Tender Pipeline Report'],
    'INVENTORY': ['Shortfall Report', 'Weekly Stock Report', 'Stock Valuation Report', 'Consumption Report', 'Stock History Report', 'Expiry Report'],
    'CRM': ['Lead Pipeline Report', 'Customer Activity Report', 'Conversion Funnel Report'],
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/');
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/reports/', generateForm);
      
      if (response.ok) {
        setShowGenerateModal(false);
        setGenerateForm({ category: '', report_type: '', file_format: 'PDF', date_range_start: '', date_range_end: '' });
        fetchReports();
      } else {
        alert('Error generating report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await api.get(`/reports/${reportId}/download/`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${reportId}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  const filteredReports = reports.filter(report => {
    if (filters.category && report.category !== filters.category) return false;
    if (filters.status && report.status !== filters.status) return false;
    if (filters.dateFrom && new Date(report.requested_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(report.requested_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  const stats = [
    { label: 'Total Reports', value: reports.length, change: 'All time', color: 'blue' },
    { label: 'Ready to Download', value: reports.filter(r => r.status === 'READY').length, change: 'Available now', color: 'green' },
    { label: 'Processing', value: reports.filter(r => r.status === 'PROCESSING').length, change: 'In queue', color: 'amber' },
    { label: 'Failed', value: reports.filter(r => r.status === 'FAILED').length, change: 'Need attention', color: 'red' },
  ];

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/reports/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Reports & Analytics"
          subtitle="View and generate business reports and analytics"
          onSearch={(q) => console.log('Search reports:', q)}
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, index) => {
              const colorClasses = {
                blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-blue-700' },
                green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', valueColor: 'text-green-700' },
                amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
                red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue;
              
              return (
                <div key={index} className={`${colors.bg} rounded-xl p-6 border border-gray-200`}>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </div>

          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Report Timeline</h2>
              <span className="text-sm text-gray-500">All times: East Africa Time</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4"><p className="text-sm font-medium text-blue-900">Last generated</p><p className="mt-1 text-sm text-blue-700">10 Jul 2026, 09:42 EAT</p></div>
              <div className="rounded-lg bg-amber-50 p-4"><p className="text-sm font-medium text-amber-900">Next scheduled report</p><p className="mt-1 text-sm text-amber-700">14 Jul 2026, 08:00 EAT</p></div>
              <div className="rounded-lg bg-green-50 p-4"><p className="text-sm font-medium text-green-900">Last download</p><p className="mt-1 text-sm text-green-700">10 Jul 2026, 10:03 EAT</p></div>
            </div>
          </section>

          {/* Report Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {[
              { name: 'Executive Reports', icon: '📊', category: 'EXECUTIVE' },
              { name: 'Project Reports', icon: '📋', category: 'PROJECT' },
              { name: 'Financial Reports', icon: '💰', category: 'FINANCIAL' },
              { name: 'Tender Reports', icon: '📝', category: 'TENDER' },
              { name: 'Inventory Reports', icon: '📦', category: 'INVENTORY' },
              { name: 'CRM Reports', icon: '👥', category: 'CRM' },
            ].map((category, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, category: prev.category === category.category ? '' : category.category }))}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{reports.filter(r => r.category === category.category).length} reports available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <button 
                  onClick={() => setShowGenerateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Generate Report
                </button>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="PROJECT">Project</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="TENDER">Tender</option>
                    <option value="INVENTORY">Inventory</option>
                    <option value="CRM">CRM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="QUEUED">Queued</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="READY">Ready</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No reports found matching your filters.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Report Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Requested</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Format</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{report.id}</td>
                      <td className="py-4 px-6 text-gray-700">{report.report_type}</td>
                      <td className="py-4 px-6 text-gray-700">{report.category}</td>
                      <td className="py-4 px-6 text-gray-700">{new Date(report.requested_at).toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'READY' ? 'bg-green-100 text-green-700' :
                          report.status === 'PROCESSING' ? 'bg-amber-100 text-amber-700' :
                          report.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{report.file_format}</td>
                      <td className="py-4 px-6">
                        {report.status === 'READY' ? (
                          <button 
                            onClick={() => handleDownloadReport(report.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Download
                          </button>
                        ) : report.status === 'FAILED' ? (
                          <span className="text-red-600 text-sm">{report.error_message?.substring(0, 30)}...</span>
                        ) : (
                          <span className="text-gray-400 text-sm">Processing...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleGenerateReport}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={generateForm.category}
                    onChange={(e) => setGenerateForm({ ...generateForm, category: e.target.value, report_type: '' })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    {Object.keys(reportTypes).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {generateForm.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select
                      value={generateForm.report_type}
                      onChange={(e) => setGenerateForm({ ...generateForm, report_type: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select report type</option>
                      {reportTypes[generateForm.category as keyof typeof reportTypes]?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={generateForm.file_format}
                    onChange={(e) => setGenerateForm({ ...generateForm, file_format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="XLSX">Excel</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range Start</label>
                    <input
                      type="date"
                      value={generateForm.date_range_start}
                      onChange={(e) => setGenerateForm({ ...generateForm, date_range_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range End</label>
                    <input
                      type="date"
                      value={generateForm.date_range_end}
                      onChange={(e) => setGenerateForm({ ...generateForm, date_range_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

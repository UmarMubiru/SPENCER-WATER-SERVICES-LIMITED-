'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/reports';
import { 
  FileText, Save, Calendar, Download, Filter, SortAsc, 
  CheckSquare, Square, ChevronDown, ChevronUp, Plus, Trash2
} from 'lucide-react';

const MODULES = [
  { id: 'employees', label: 'Employees', fields: ['full_name', 'department__name', 'job_title__title', 'status', 'employee_type', 'gross_monthly_salary', 'contract_start_date', 'contract_end_date'] },
  { id: 'projects', label: 'Projects', fields: ['name', 'status', 'service_line', 'project_lead__user__username', 'contract_value', 'completion_percentage', 'planned_start_date', 'planned_end_date'] },
  { id: 'inventory', label: 'Inventory', fields: ['name', 'item_code', 'category__name', 'quantity', 'unit_cost', 'reorder_level', 'unit', 'is_active'] },
];

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Name',
  department__name: 'Department',
  job_title__title: 'Job Title',
  status: 'Status',
  employee_type: 'Employment Type',
  gross_monthly_salary: 'Salary',
  contract_start_date: 'Contract Start',
  contract_end_date: 'Contract End',
  service_line: 'Service Line',
  project_lead__user__username: 'Project Lead',
  contract_value: 'Contract Value',
  completion_percentage: 'Completion %',
  planned_start_date: 'Start Date',
  planned_end_date: 'End Date',
  category__name: 'Category',
  item_code: 'Item Code',
  quantity: 'Quantity',
  unit_cost: 'Unit Cost',
  reorder_level: 'Reorder Level',
  is_active: 'Active',
};

export default function ReportsPage() {
  const [tab, setTab] = useState<'generate' | 'saved' | 'scheduled'>('generate');
  const [selectedModule, setSelectedModule] = useState('employees');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [showFieldSelector, setShowFieldSelector] = useState(true);

  useEffect(() => {
    if (tab === 'saved') reportsService.listSavedReports().then(setSavedReports);
    if (tab === 'scheduled') reportsService.listScheduledReports().then(setScheduledReports);
  }, [tab]);

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handlePreview = async () => {
    if (selectedFields.length === 0) return;
    const result = await reportsService.generateReport(selectedModule, selectedFields, filters);
    setPreviewData(result);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting as ${format}`, { module: selectedModule, fields: selectedFields, data: previewData });
  };

  const handleSaveReport = async () => {
    const reportName = prompt('Enter report name:');
    if (reportName) {
      try {
        await reportsService.saveReport({
          name: reportName,
          module: selectedModule,
          fields: selectedFields,
          filters,
        });
        alert('Report saved successfully!');
        setTab('saved');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Unable to save the report.');
      }
    }
  };

  const currentModule = MODULES.find(m => m.id === selectedModule);

  return (
    <AdminLayout
      title="Report Builder"
      subtitle="Generate, save, and schedule custom reports"
      activePath="/admin/reports/reports"
    >
      <div className="p-6">
        {/* Tab Navigation */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
            {([
              { id: 'generate', label: 'Generate', icon: FileText },
              { id: 'saved', label: 'Saved', icon: Save },
              { id: 'scheduled', label: 'Scheduled', icon: Calendar },
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

          {tab === 'generate' && (
            <div className="space-y-6">
              {/* Module Selection */}
              <Card title="Select Module">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {MODULES.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setSelectedModule(module.id);
                        setSelectedFields([]);
                        setPreviewData([]);
                      }}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        selectedModule === module.id
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <p className="font-medium">{module.label}</p>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Field Selection */}
              <Card 
                title="Select Fields"
                actions={
                  <button
                    onClick={() => setShowFieldSelector(!showFieldSelector)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showFieldSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showFieldSelector ? 'Hide' : 'Show'}
                  </button>
                }
              >
                {showFieldSelector && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentModule?.fields.map((field) => (
                      <button
                        key={field}
                        onClick={() => toggleField(field)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                          selectedFields.includes(field)
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {selectedFields.includes(field) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm">{FIELD_LABELS[field] || field}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Filters */}
              <Card title="Filters">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </Card>

              {/* Sort Options */}
              <Card title="Sort & Group">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">None</option>
                      {selectedFields.map((field) => (
                        <option key={field} value={field}>{FIELD_LABELS[field] || field}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortOrder('asc')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          sortOrder === 'asc' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200'
                        }`}
                      >
                        <SortAsc className="w-4 h-4" />
                        Ascending
                      </button>
                      <button
                        onClick={() => setSortOrder('desc')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                          sortOrder === 'desc' ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                        Descending
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePreview}
                  disabled={selectedFields.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  Preview Report
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={selectedFields.length === 0 || previewData.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save Report
                </button>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={previewData.length === 0}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={previewData.length === 0}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={previewData.length === 0}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <Card title="Preview" className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {selectedFields.map((field) => (
                            <th key={field} className="px-4 py-3 text-left font-medium text-gray-900 border-b">
                              {FIELD_LABELS[field] || field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 50).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {selectedFields.map((field) => (
                              <td key={field} className="px-4 py-3 border-b text-gray-700">
                                {String(row[field] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.length > 50 && (
                      <p className="text-center text-sm text-gray-500 py-4">
                        Showing 50 of {previewData.length} records
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {tab === 'saved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Saved Reports</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  New Report
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{report.module}</p>
                      </div>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.fields?.slice(0, 3).map((field: string) => (
                        <span key={field} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {FIELD_LABELS[field] || field}
                        </span>
                      ))}
                      {report.fields?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          +{report.fields.length - 3} more
                        </span>
                      )}
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      <FileText className="w-4 h-4" />
                      Generate
                    </button>
                  </Card>
                ))}
                {savedReports.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No saved reports yet. Create your first report!
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'scheduled' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Scheduled Reports</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Schedule Report
                </button>
              </div>
              <Card>
                <div className="space-y-3">
                  {scheduledReports.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{schedule.saved_report?.name}</h3>
                        <p className="text-sm text-gray-500">
                          {schedule.frequency} • Last run: {schedule.last_run ? new Date(schedule.last_run).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Run Now
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {scheduledReports.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No scheduled reports. Schedule a report to automate regular exports.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
    </AdminLayout>
  );
}

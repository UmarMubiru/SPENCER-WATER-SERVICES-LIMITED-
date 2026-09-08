'use client';

import React, { useState, useEffect, use } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ArrowLeft, User, FileText, History, Edit, Download, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CountryCodeSelector from '@/components/CountryCodeSelector';

interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  id_type?: string;
  id_number?: string;
  id_document?: string;
  photo?: string;
  employee_type: string;
  department: string;
  department_name: string;
  job_title?: string;
  job_title_name?: string;
  management_category?: string;
  gross_monthly_salary?: number;
  pay_basis?: string;
  daily_rate?: number;
  hourly_rate?: number;
  contract_start_date?: string;
  contract_end_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EmployeeHistory {
  id: number;
  action: string;
  description: string;
  previous_value: string;
  new_value: string;
  performed_by: string;
  timestamp: string;
}

interface ContractDocument {
  id: number;
  title: string;
  doc_type: string;
  file: string;
  uploaded_at: string;
}

interface Attendance {
  id: number;
  employee_name: string;
  department_name: string;
  job_title_name: string;
  clock_in: string;
  clock_out: string | null;
  date: string;
  hours_worked: number | null;
  hourly_rate: number | null;
  total_earnings: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectAssignment {
  id: number;
  project_name: string;
  project_reference?: string;
  assigned_role: string;
  is_team_lead: boolean;
  assigned_date: string;
  end_date: string | null;
  is_active: boolean;
  workload_percentage?: number;
  notes?: string;
}

type TabType = 'overview' | 'documents' | 'updates' | 'assignments';

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const employeeId = unwrappedParams.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<EmployeeHistory[]>([]);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [countryCode, setCountryCode] = useState('256');

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/employees/${employeeId}/`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployee(data);
      setEditForm(data);
      
      // Extract country code from phone number if it starts with +
      if (data.phone && data.phone.startsWith('+')) {
        const phoneMatch = data.phone.match(/^\+(\d+)(.*)$/);
        if (phoneMatch) {
          setCountryCode(phoneMatch[1]);
          setEditForm(prev => ({ ...prev, phone: phoneMatch[2] }));
        }
      }

      // Load history
      try {
        const historyResponse = await fetch(`http://127.0.0.1:8000/api/employees/history/?employee=${employeeId}`, {
          cache: 'no-store'
        });
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(Array.isArray(historyData.results) ? historyData.results : Array.isArray(historyData) ? historyData : []);
        }
      } catch (historyError) {
        console.error('Failed to load history:', historyError);
      }

      // Load documents
      try {
        const docsResponse = await fetch(`http://127.0.0.1:8000/api/employees/contract-documents/?employee=${employeeId}`, {
          cache: 'no-store'
        });
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(Array.isArray(docsData.results) ? docsData.results : Array.isArray(docsData) ? docsData : []);
        }
      } catch (docsError) {
        console.error('Failed to load documents:', docsError);
      }


      // Load project assignments - get all assignments including historical
      try {
        const assignmentsResponse = await fetch(`http://127.0.0.1:8000/api/projects/role_allocations/?employee=${employeeId}`, {
          cache: 'no-store'
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setProjectAssignments(Array.isArray(assignmentsData.results) ? assignmentsData.results : Array.isArray(assignmentsData) ? assignmentsData : []);
        }
      } catch (assignmentsError) {
        console.error('Failed to load project assignments:', assignmentsError);
      }
    } catch (error) {
      console.error('Failed to load employee data:', error);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const formDataToSend = new FormData();

      // Add all form fields
      if (employee) {
        for (const key in editForm) {
          if (editForm[key as keyof Employee] !== employee[key as keyof Employee]) {
            // Combine country code with phone number
            if (key === 'phone') {
              formDataToSend.append(key, `+${countryCode}${editForm[key as keyof Employee]}`);
            } else {
              formDataToSend.append(key, String(editForm[key as keyof Employee]));
            }
          }
        }
      }

      // Add photo if changed
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/employees/employees/${employeeId}/`, {
        method: 'PATCH',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      loadEmployeeData();
      setEditing(false);
      setPhotoFile(null);
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert(`Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('employee', employeeId);

    try {
      await fetch('http://127.0.0.1:8000/api/employees/contract-documents/', {
        method: 'POST',
        body: formData
      });
      loadEmployeeData();
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'assignments' as TabType, label: 'Assignments', icon: User },
  ];

  if (loading) {
    return (
      <AdminLayout title="Employee Details" subtitle="View employee information" activePath="/admin/employees">
        <div className="p-8 text-center text-gray-500">Loading employee details...</div>
      </AdminLayout>
    );
  }

  if (!employee) {
    return (
      <AdminLayout title="Employee Details" subtitle="View employee information" activePath="/admin/employees">
        <div className="p-8 text-center text-gray-500">Employee not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Employee Details" subtitle={`${employee.full_name} - ${employee.employee_type}`} activePath="/admin/employees">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          Back to Employees
        </button>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-wrap justify-between gap-4 items-center rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white">
                  <div><p className="text-sm text-blue-100">Employee overview</p><h2 className="text-2xl font-bold">{employee.full_name}</h2><p className="text-blue-100 mt-1">{employee.job_title_name || employee.job_title || 'Employee'} · {employee.department_name || 'No department'}</p></div>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-blue-800 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Employee Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <div className="flex">
                          <CountryCodeSelector
                            value={countryCode}
                            onChange={setCountryCode}
                          />
                          <input
                            type="text"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                        <select
                          value={editForm.id_type || ''}
                          onChange={(e) => setEditForm({ ...editForm, id_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select ID Type</option>
                          <option value="national_id">National ID</option>
                          <option value="driving_permit">Driving Permit</option>
                          <option value="passport">Passport</option>
                          <option value="refugee_card">Refugee Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                        <input
                          type="text"
                          value={editForm.id_number || ''}
                          onChange={(e) => setEditForm({ ...editForm, id_number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Photo</label>
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setPhotoFile(e.target.files[0]);
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          {(employee.photo || photoFile) && (
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={photoFile ? URL.createObjectURL(photoFile) : (employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`)}
                                  alt="Employee photo"
                                  className="h-48 w-48 object-contain rounded-lg border-2 border-gray-300 bg-gray-100"
                                  onError={(e) => {
                                    console.error('Image load error:', e);
                                    console.error('Photo URL:', photoFile ? URL.createObjectURL(photoFile) : (employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`));
                                    console.error('Employee photo field:', employee.photo);
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully');
                                  }}
                                />
                                {photoFile && (
                                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    New
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p className="font-medium text-gray-900">Current Photo</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {photoFile ? 'Preview of new photo' : 'Existing photo from database'}
                                </p>
                                {!photoFile && (
                                  <p className="text-xs text-gray-400 mt-1 break-all">
                                    URL: {employee.photo}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-500">JPG, JPEG, or PNG files only. Recommended size: 400x400px</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Management Category</label>
                        <select
                          value={editForm.management_category || ''}
                          onChange={(e) => setEditForm({ ...editForm, management_category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Category</option>
                          <option value="management">Management (Administrative)</option>
                          <option value="technical">Technical / Field</option>
                        </select>
                      </div>
                      {employee.employee_type === 'full_time' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <input
                              type="text"
                              value={editForm.job_title_name || editForm.job_title || ''}
                              onChange={(e) => setEditForm({ ...editForm, job_title_name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gross Monthly Salary</label>
                            <input
                              type="number"
                              value={editForm.gross_monthly_salary || ''}
                              onChange={(e) => setEditForm({ ...editForm, gross_monthly_salary: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </>
                      )}
                      {employee.employee_type === 'part_time' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pay Basis</label>
                            <select
                              value={editForm.pay_basis || ''}
                              onChange={(e) => setEditForm({ ...editForm, pay_basis: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                              <option value="">Select Pay Basis</option>
                              <option value="daily_fixed">Fixed rate per day worked</option>
                              <option value="hourly_daily">Hourly rate, calculated daily</option>
                              <option value="hourly_monthly">Hourly rate, totaled monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate</label>
                            <input
                              type="number"
                              value={editForm.daily_rate || ''}
                              onChange={(e) => setEditForm({ ...editForm, daily_rate: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                            <input
                              type="number"
                              value={editForm.hourly_rate || ''}
                              onChange={(e) => setEditForm({ ...editForm, hourly_rate: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date</label>
                            <input
                              type="date"
                              value={editForm.contract_start_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, contract_start_date: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date</label>
                            <input
                              type="date"
                              value={editForm.contract_end_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, contract_end_date: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditForm(employee);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Employee Photo Section */}
                    {employee.photo && (
                      <div className="bg-white rounded-xl border border-slate-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Photo</h3>
                        <div className="flex items-center gap-6">
                          <img
                            src={employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`}
                            alt="Employee photo"
                            className="h-40 w-40 object-contain rounded-lg border-2 border-gray-300 bg-gray-100"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Profile photo uploaded during employee registration</p>
                            <a
                              href={employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Download size={14} />
                              View Full Size
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Employee Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 [&>div]:rounded-xl [&>div]:border [&>div]:border-slate-100 [&>div]:bg-slate-50 [&>div]:p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{employee.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">{employee.phone || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">ID Type</label>
                          <p className="text-gray-900 capitalize">{employee.id_type?.replace('_', ' ') || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">ID Number</label>
                          <p className="text-gray-900">{employee.id_number || '-'}</p>
                        </div>
                        {employee.id_document && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">ID Document</label>
                            <a
                              href={employee.id_document?.startsWith('http') ? employee.id_document : `http://127.0.0.1:8000${employee.id_document}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Download size={14} />
                              Download ID Document
                            </a>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-500">Management Category</label>
                          <p className="text-gray-900 capitalize">{employee.management_category?.replace('_', ' ') || '-'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Department</label>
                          <p className="text-gray-900">{employee.department_name || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className="text-gray-900 capitalize">{employee.status.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Employee Type</label>
                          <p className="text-gray-900 capitalize">{employee.employee_type.replace('_', ' ')}</p>
                        </div>
                        {employee.employee_type === 'full_time' && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Job Title</label>
                              <p className="text-gray-900">{employee.job_title_name || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Gross Monthly Salary</label>
                              <p className="text-gray-900">{employee.gross_monthly_salary ? `UGX ${employee.gross_monthly_salary.toLocaleString()}` : '-'}</p>
                            </div>
                          </>
                        )}
                        {employee.employee_type === 'part_time' && (
                          <>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Pay Basis</label>
                              <p className="text-gray-900 capitalize">{employee.pay_basis?.replace('_', ' ') || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Daily Rate</label>
                              <p className="text-gray-900">{employee.daily_rate ? `UGX ${employee.daily_rate.toLocaleString()}` : '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                              <p className="text-gray-900">{employee.hourly_rate ? `UGX ${employee.hourly_rate.toLocaleString()}` : '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Contract Period</label>
                              <p className="text-gray-900">
                                {employee.contract_start_date ? new Date(employee.contract_start_date).toLocaleDateString() : 'Not set'} - 
                                {employee.contract_end_date ? new Date(employee.contract_end_date).toLocaleDateString() : 'Not set'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Project Assignments History</h3>
                  <span className="text-sm text-gray-500">
                    {projectAssignments.length} total assignment(s)
                  </span>
                </div>
                {projectAssignments.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-sm text-gray-500">This employee has not been assigned to any projects yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clerk of Works</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {projectAssignments
                          .sort((a, b) => new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime())
                          .map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {assignment.project_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {assignment.project_reference || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {assignment.assigned_role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.is_team_lead ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  Clerk of Works
                                </span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.workload_percentage ? `${assignment.workload_percentage}%` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(assignment.assigned_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {assignment.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Documents</h3>
                  
                  {/* Employee Photo */}
                  {employee.photo && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Employee Photo</h4>
                      <div className="flex items-center gap-4">
                        <img
                          src={employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`}
                          alt="Employee photo"
                          className="h-32 w-32 object-contain rounded-lg border border-gray-300 bg-gray-100"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">Profile photo uploaded during employee registration</p>
                          <a
                            href={employee.photo?.startsWith('http') ? employee.photo : `http://127.0.0.1:8000${employee.photo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Document */}
                  {employee.id_document && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Identity Document</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {employee.id_type?.replace('_', ' ') || 'ID Document'} - {employee.id_number || 'Unknown number'}
                          </p>
                          <a
                            href={employee.id_document?.startsWith('http') ? employee.id_document : `http://127.0.0.1:8000${employee.id_document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Download size={14} />
                            Download Document
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contract Documents */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Contract Documents</h4>
                    {documents.length === 0 ? (
                      <p className="text-gray-500 text-sm">No contract documents uploaded</p>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">{doc.title}</p>
                              <p className="text-sm text-gray-500 capitalize">{doc.doc_type.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                            </div>
                            <a
                              href={doc.file?.startsWith('http') ? doc.file : `http://127.0.0.1:8000${doc.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Download size={14} />
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h3>
                  <form onSubmit={handleDocumentUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                        <select
                          name="doc_type"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select type</option>
                          <option value="contract">Contract</option>
                          <option value="offer_letter">Offer Letter</option>
                          <option value="nda">NDA</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                      <input
                        type="file"
                        name="file"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload size={16} />
                      Upload Document
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

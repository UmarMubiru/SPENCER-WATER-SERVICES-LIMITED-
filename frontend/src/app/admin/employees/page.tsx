'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Archive, ArchiveRestore, Users, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { ResponsiveTable } from '../components/ResponsiveTable';
import { useRouter } from 'next/navigation';
import DashboardCard from '../../../components/admin/ui/DashboardCard';
import StatusBadge from '../../../components/admin/ui/StatusBadge';

interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  employee_type: string;
  department_name: string;
  job_title_name?: string;
  management_category?: string;
  gross_monthly_salary?: number;
  daily_rate?: number;
  hourly_rate?: number;
  status: string;
  is_archived: boolean;
  created_at: string;
}

interface AllocationReview {
  id: number;
  employee: number;
  employee_name: string;
  project_name: string;
  assigned_date: string;
}

export default function EmployeeManagementPage() {
  const router = useRouter();
  const [fullTimeEmployees, setFullTimeEmployees] = useState<Employee[]>([]);
  const [partTimeEmployees, setPartTimeEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [allocationReviews, setAllocationReviews] = useState<AllocationReview[]>([]);
  const [activeTab, setActiveTab] = useState<'fulltime' | 'parttime'>('fulltime');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total_users: 0,
    total_departments: 0,
    total_job_titles: 0,
    pending_approvals: 0,
  });

  const handleView = (employee: Employee) => {
    router.push(`/admin/employees/${employee.id}`);
  };

  const handleArchive = async (employee: Employee) => {
    console.log('Archiving employee:', employee);
    if (confirm(`Are you sure you want to archive ${employee.full_name}?`)) {
      try {
        const url = `http://127.0.0.1:8000/api/employees/employees/${employee.id}/archive/`;
        console.log('Calling API:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Archive response status:', response.status);
        console.log('Archive response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Archive response data:', data);
          loadEmployees();
        } else {
          const errorText = await response.text();
          console.error('Archive failed - status:', response.status);
          console.error('Archive failed - response:', errorText);
          alert(`Failed to archive employee. Status: ${response.status}. Error: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to archive employee:', error);
        alert(`Failed to archive employee: ${error}`);
      }
    }
  };

  const handleUnarchive = async (employee: Employee) => {
    console.log('Unarchiving employee:', employee);
    if (confirm(`Are you sure you want to unarchive ${employee.full_name}?`)) {
      try {
        const url = `http://127.0.0.1:8000/api/employees/employees/${employee.id}/unarchive/`;
        console.log('Calling API:', url);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Unarchive response status:', response.status);
        console.log('Unarchive response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Unarchive response data:', data);
          loadEmployees();
        } else {
          const errorText = await response.text();
          console.error('Unarchive failed - status:', response.status);
          console.error('Unarchive failed - response:', errorText);
          alert(`Failed to unarchive employee. Status: ${response.status}. Error: ${errorText}`);
        }
      } catch (error) {
        console.error('Failed to unarchive employee:', error);
        alert(`Failed to unarchive employee: ${error}`);
      }
    }
  };

  const tableActions = showArchived ? [
    {
      label: 'View',
      icon: <Eye size={14} />,
      onClick: (employee: Employee) => handleView(employee),
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'Unarchive',
      icon: <ArchiveRestore size={14} />,
      onClick: (employee: Employee) => handleUnarchive(employee),
      className: 'text-green-600 hover:bg-green-50'
    }
  ] : [
    {
      label: 'View',
      icon: <Eye size={14} />,
      onClick: (employee: Employee) => handleView(employee),
      className: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'Archive',
      icon: <Archive size={14} />,
      onClick: (employee: Employee) => handleArchive(employee),
      className: 'text-orange-600 hover:bg-orange-50'
    }
  ];

  const fetchStats = async () => {
    try {
      const [credResponse, deptResponse, jobResponse, empResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/employees/credentials/?status=pending'),
        fetch('http://127.0.0.1:8000/api/employees/departments/'),
        fetch('http://127.0.0.1:8000/api/employees/job-titles/'),
        fetch('http://127.0.0.1:8000/api/employees/employees/'),
      ]);

      if (credResponse.ok) {
        const credData = await credResponse.json();
        setStats(prev => ({ ...prev, pending_approvals: (credData.results || credData).length }));
      }
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setStats(prev => ({ ...prev, total_departments: (deptData.results || deptData).length }));
      }
      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setStats(prev => ({ ...prev, total_job_titles: (jobData.results || jobData).length }));
      }
      if (empResponse.ok) {
        const empData = await empResponse.json();
        setStats(prev => ({ ...prev, total_users: (empData.results || empData).length }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
    fetchStats();
  }, [showArchived]);

  const loadAllocationReviews = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects/role_allocations/review_actions/');
      if (!response.ok) return;
      const data = await response.json();
      setAllocationReviews(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load allocation reviews:', error);
    }
  };

  useEffect(() => {
    loadAllocationReviews();
    const refresh = window.setInterval(loadAllocationReviews, 60000);
    return () => window.clearInterval(refresh);
  }, []);

  const resolveAllocationReview = async (allocationId: number, decision: 'available' | 'keep_assigned') => {
    const response = await fetch(`http://127.0.0.1:8000/api/projects/role_allocations/${allocationId}/resolve_review/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    if (response.ok) {
      await Promise.all([loadAllocationReviews(), loadEmployees()]);
    } else {
      alert('Could not update this allocation. Please try again.');
    }
  };

  const loadEmployees = async () => {
    try {
      const [fullTimeResponse, partTimeResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/employees/employees/full_time/?show_archived=${showArchived}`),
        fetch(`http://127.0.0.1:8000/api/employees/employees/part_time/?show_archived=${showArchived}`)
      ]);

      const fullTimeData = await fullTimeResponse.json();
      const partTimeData = await partTimeResponse.json();

      const allFullTime = Array.isArray(fullTimeData.results) ? fullTimeData.results : Array.isArray(fullTimeData) ? fullTimeData : [];
      const allPartTime = Array.isArray(partTimeData.results) ? partTimeData.results : Array.isArray(partTimeData) ? partTimeData : [];

      setFullTimeEmployees(allFullTime);
      setPartTimeEmployees(allPartTime);
    } catch (error) {
      console.error('Failed to load employees:', error);
      setFullTimeEmployees([]);
      setPartTimeEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fullTimeColumns = [
    { key: 'full_name', header: 'Name' },
    { key: 'job_title_name', header: 'Job Title' },
    { key: 'department_name', header: 'Department' },
    { key: 'gross_monthly_salary', header: 'Monthly Salary', format: (val: number) => val ? `UGX ${val.toLocaleString()}` : '-' },
    { key: 'status', header: 'Status', format: (val: string) => {
      const statusMap: Record<string, string> = {
        'active_not_assigned': 'Active - Not Assigned',
        'active_assigned': 'Active - Assigned',
        'not_active': 'Not Active'
      };
      return statusMap[val] || val;
    }},
  ];

  const partTimeColumns = [
    { key: 'full_name', header: 'Name' },
    { key: 'job_title_name', header: 'Job Title' },
    { key: 'department_name', header: 'Department' },
    { key: 'hourly_rate', header: 'Hourly Rate', format: (val: number) => val ? `UGX ${val.toLocaleString()}` : '-' },
    { key: 'total_monthly_earnings', header: 'Total Monthly Earnings', format: (val: number) => val ? `UGX ${val.toLocaleString()}` : '-' },
    { key: 'status', header: 'Status', format: (val: string) => {
      const statusMap: Record<string, string> = {
        'active_not_assigned': 'Active - Not Assigned',
        'active_assigned': 'Active - Assigned',
        'not_active': 'Not Active'
      };
      return statusMap[val] || val;
    }},
  ];

  const paginatedFullTime = fullTimeEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedPartTime = partTimeEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = activeTab === 'fulltime'
    ? Math.ceil(fullTimeEmployees.length / itemsPerPage)
    : Math.ceil(partTimeEmployees.length / itemsPerPage);

  const currentData = activeTab === 'fulltime' ? paginatedFullTime : paginatedPartTime;
  const currentColumns = activeTab === 'fulltime' ? fullTimeColumns : partTimeColumns;

  return (
    <AdminLayout title="Employee Management" subtitle="Manage all employees" activePath="/admin/employees">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            label="Pending Approvals"
            value={stats.pending_approvals}
            icon={Users}
            tint="from-blue-400 to-blue-600"
            href="/admin/user-management/credentials"
          />
          <DashboardCard
            label="Total Users"
            value={stats.total_users}
            icon={Users}
            tint="from-blue-600 to-blue-700"
            href="/admin/employees"
          />
          <DashboardCard
            label="Departments"
            value={stats.total_departments}
            icon={Building2}
            tint="from-sky-500 to-blue-600"
            href="/admin/user-management/departments"
          />
          <DashboardCard
            label="Job Titles"
            value={stats.total_job_titles}
            icon={Briefcase}
            tint="from-blue-800 to-blue-950"
            href="/admin/user-management/job-titles"
          />
        </div>

        {allocationReviews.length > 0 && (
          <section className="rounded-xl border border-blue-100 bg-white shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">Allocation Actions Required</h3>
                <p className="text-xs text-blue-600">Confirm the employment status of staff whose projects have ended</p>
              </div>
              <span className="px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">{allocationReviews.length}</span>
            </div>
            <div className="space-y-2">
              {allocationReviews.map((review) => (
                <div key={review.id} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900 text-sm">{review.employee_name}</p>
                    <p className="text-xs text-blue-600">Assigned to {review.project_name} since {review.assigned_date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => resolveAllocationReview(review.id, 'available')} className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mark Available</button>
                    <button onClick={() => resolveAllocationReview(review.id, 'keep_assigned')} className="px-2 py-1.5 text-xs border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition">Keep Assigned</button>
                    <Link href={`/admin/employees/${review.employee}`} className="px-2 py-1.5 text-xs border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition">Update Status</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-3">
            <div className="flex flex-wrap gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            <Link 
              href="/admin/employees/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Add Employee
            </Link>
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${showArchived ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-blue-200 hover:bg-blue-50 text-blue-900'}`}
            >
              <Archive size={16} />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('fulltime'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'fulltime' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Full-time ({fullTimeEmployees.length})
          </button>
          <button
            onClick={() => { setActiveTab('parttime'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'parttime' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            Part-time ({partTimeEmployees.length})
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-blue-400 text-sm">Loading employees...</div>
        ) : (
          <div className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-blue-100 px-4 py-2.5 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-blue-900 text-base">
                {activeTab === 'fulltime' ? 'Full-time Employees' : 'Part-time Employees'}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({activeTab === 'fulltime' ? fullTimeEmployees.length : partTimeEmployees.length} total)
                </span>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            {currentData.length === 0 ? (
              <div className="p-8 text-center text-blue-400 text-sm">
                {activeTab === 'fulltime' ? 'No full-time employees found' : 'No part-time employees found'}
              </div>
            ) : (
              <ResponsiveTable
                columns={currentColumns}
                data={currentData}
                actions={tableActions}
              />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

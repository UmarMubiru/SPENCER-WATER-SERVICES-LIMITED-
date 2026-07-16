'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Topbar } from '../../../components/Topbar';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { employeeService } from '../../services/employeeService';
import { Employee } from '../../types/employee';

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const fetchEmployee = async () => {
    try {
      const employeeData = await employeeService.getEmployee(Number(params.id));
      setEmployee(employeeData);
    } catch (error) {
      console.error('Error fetching employee:', error);
      alert('Employee not found');
      router.push('/admin/employees/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This cannot be undone.')) return;
    
    setDeleting(true);
    try {
      await employeeService.deleteEmployee(Number(params.id));
      router.push('/admin/employees/dashboard');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Unable to delete this employee.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/employees/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex" style={{
        background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <Sidebar activePath="/admin/employees/dashboard" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">Employee not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{
      background: 'radial-gradient(circle at 14% 12%, rgba(0, 149, 190, 0.28), transparent 28%), radial-gradient(circle at 86% 18%, rgba(30, 99, 184, 0.22), transparent 30%), linear-gradient(135deg, #eef8ff 0%, #d8ecfb 38%, #f6f9fe 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <Sidebar activePath="/admin/employees/dashboard" />
      <div className="flex-1 ml-64">
        <Topbar
          title="Employee Details"
          subtitle={`View and manage ${employee.full_name}`}
          onSearch={(q) => console.log('Search:', q)}
        />

        <div className="p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{employee.full_name}</h2>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/employees/edit/${employee.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <Link
                    href="/admin/employees/dashboard"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Employee ID</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.employee_id}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.phone || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.department_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Job Title</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.job_title_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Employment Type</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.employment_type_name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {employee.status || 'N/A'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Contract Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    employee.contract_status === 'Active' ? 'bg-green-100 text-green-700' :
                    employee.contract_status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                    employee.contract_status === 'Expired' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {employee.contract_status || 'N/A'}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Joining Date</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.joining_date || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Contract Expiry</p>
                  <p className="text-lg font-semibold text-gray-900">{employee.contract_expiry || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

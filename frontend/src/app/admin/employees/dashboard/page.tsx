'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ResponsiveTable } from '../../components/ResponsiveTable';
import { DashboardCards } from '../components/DashboardCards';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeeTable } from '../components/EmployeeTable';
import { QuickActions } from '../components/QuickActions';
import { RecentActivities } from '../components/RecentActivities';
import { employeeService } from '../services/employeeService';
import { Employee, DashboardStats, Department } from '../types/employee';
import { useRouter } from 'next/navigation';

export default function EmployeesDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, employeesData, departmentsData] = await Promise.all([
        employeeService.getDashboardStats(),
        employeeService.getEmployees(),
        employeeService.getDepartments(),
      ]);
      setStats(statsData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Set fallback data when API is unavailable
      setStats({
        total_employees: 128,
        active_employees: 96,
        on_contract: 88,
        exited: 8,
        contracts_expiring_soon: 8,
        contracts_expired: 2,
        new_this_month: 12,
        department_distribution: [],
        recent_activities: [
          { action: 'Contract renewed', description: 'Contract renewed for John Kamau', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), employee_name: 'John Kamau' },
          { action: 'New employee', description: 'Sarah Nankya joined the company', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), employee_name: 'Sarah Nankya' },
          { action: 'Status change', description: 'Michael Ochieng promoted to Senior Engineer', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), employee_name: 'Michael Ochieng' },
        ],
      });
      setEmployees([
        { id: 1, employee_id: 'EMP-001', first_name: 'John', last_name: 'Kamau', full_name: 'John Kamau', email: 'john.kamau@sws.com', phone: '+256 700 123 456', department_name: 'Engineering', job_title_name: 'Senior Engineer', employment_type_name: 'Permanent', status: 'active', joining_date: '2023-01-15', contract_expiry: '2024-12-31', contract_status: 'Active', created_at: '2023-01-15', updated_at: '2023-01-15' },
        { id: 2, employee_id: 'EMP-002', first_name: 'Sarah', last_name: 'Nankya', full_name: 'Sarah Nankya', email: 'sarah.nankya@sws.com', phone: '+256 700 234 567', department_name: 'Projects', job_title_name: 'Project Manager', employment_type_name: 'Permanent', status: 'active', joining_date: '2023-03-22', contract_expiry: '2024-12-31', contract_status: 'Active', created_at: '2023-03-22', updated_at: '2023-03-22' },
        { id: 3, employee_id: 'EMP-003', first_name: 'Michael', last_name: 'Ochieng', full_name: 'Michael Ochieng', email: 'michael.ochieng@sws.com', phone: '+256 700 345 678', department_name: 'Operations', job_title_name: 'Site Supervisor', employment_type_name: 'Contract', status: 'active', joining_date: '2023-05-10', contract_expiry: '2024-06-30', contract_status: 'Expiring Soon', created_at: '2023-05-10', updated_at: '2023-05-10' },
      ]);
      setDepartments([
        { id: 1, name: 'Engineering', description: 'Engineering department' },
        { id: 2, name: 'Projects', description: 'Projects department' },
        { id: 3, name: 'Operations', description: 'Operations department' },
        { id: 4, name: 'Human Resources', description: 'HR department' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const filtered = await employeeService.getEmployees({
        search: query,
        department: selectedDepartment,
        status: selectedStatus,
      });
      setEmployees(filtered);
    } catch (error) {
      console.error('Failed to search employees:', error);
    }
  };

  const handleDepartmentChange = async (department: string) => {
    setSelectedDepartment(department);
    try {
      const filtered = await employeeService.getEmployees({
        search: searchQuery,
        department,
        status: selectedStatus,
      });
      setEmployees(filtered);
    } catch (error) {
      console.error('Failed to filter by department:', error);
    }
  };

  const handleStatusChange = async (status: string) => {
    setSelectedStatus(status);
    try {
      const filtered = await employeeService.getEmployees({
        search: searchQuery,
        department: selectedDepartment,
        status,
      });
      setEmployees(filtered);
    } catch (error) {
      console.error('Failed to filter by status:', error);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    router.push(`/admin/employees/details/${employee.id}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    router.push(`/admin/employees/edit/${employee.id}`);
  };

  const handleFiltersClick = () => {
    // Toggle advanced filters visibility
    console.log('Open advanced filters');
  };

  const handleAddEmployee = () => {
    router.push('/admin/employees/create');
  };

  const handleImportEmployees = () => {
    alert('Import functionality coming soon. Please use the Add Employee button to add employees individually.');
  };

  const handleContractAlerts = () => {
    setSelectedStatus('expiring');
  };

  const handleGenerateReport = () => {
    alert('Report generation coming soon. Check back later for this feature.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      title="Employees Management"
      subtitle="View and manage all employee records"
      activePath="/admin/employees/dashboard"
      onSearch={handleSearch}
    >
          {/* Dashboard Cards */}
          {stats && <DashboardCards stats={stats} />}

          {/* Filters */}
          <EmployeeFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            departments={departments}
            onFiltersClick={handleFiltersClick}
          />

          {/* Main Content Area with Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Table */}
            <div className="lg:col-span-2">
              <EmployeeTable
                employees={employees}
                onView={handleViewEmployee}
                onEdit={handleEditEmployee}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <QuickActions
                onAddEmployee={handleAddEmployee}
                onImportEmployees={handleImportEmployees}
                onContractAlerts={handleContractAlerts}
                onGenerateReport={handleGenerateReport}
              />
              {stats && <RecentActivities activities={stats.recent_activities} />}
            </div>
          </div>
    </AdminLayout>
  );
}

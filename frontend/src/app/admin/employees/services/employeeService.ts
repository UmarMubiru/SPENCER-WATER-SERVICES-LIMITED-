import { Employee, DashboardStats, Department, JobTitle, EmploymentType, EmployeeFilters } from '../types/employee';
import { api } from '../../../../lib/api';

const BASE = '/employees';

export const employeeService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get(`${BASE}/dashboard/`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.employment_type) params.append('employment_type', filters.employment_type);
    if (filters?.contract_status) params.append('contract_status', filters.contract_status);

    const url = params.toString() ? `${BASE}/employees/?${params}` : `${BASE}/employees/`;
    const response = await api.get(url);
    if (!response.ok) throw new Error('Failed to fetch employees');
    const data = await response.json();
    return data.results || data;
  },

  async getEmployee(id: number): Promise<Employee> {
    const response = await api.get(`${BASE}/employees/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch employee');
    return response.json();
  },

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    const response = await api.post(`${BASE}/employees/`, employee);
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    const response = await api.patch(`${BASE}/employees/${id}/`, employee);
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
  },

  async deleteEmployee(id: number): Promise<void> {
    const response = await api.delete(`${BASE}/employees/${id}/`);
    if (!response.ok) throw new Error('Failed to delete employee');
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get(`${BASE}/departments/`);
    if (!response.ok) throw new Error('Failed to fetch departments');
    const data = await response.json();
    return data.results || data;
  },

  async getJobTitles(): Promise<JobTitle[]> {
    const response = await api.get(`${BASE}/job-titles/`);
    if (!response.ok) throw new Error('Failed to fetch job titles');
    const data = await response.json();
    return data.results || data;
  },

  async getEmploymentTypes(): Promise<EmploymentType[]> {
    const response = await api.get(`${BASE}/employment-types/`);
    if (!response.ok) throw new Error('Failed to fetch employment types');
    const data = await response.json();
    return data.results || data;
  },

  async getEmployeeContracts(id: number) {
    const response = await api.get(`${BASE}/employees/${id}/contracts/`);
    if (!response.ok) throw new Error('Failed to fetch employee contracts');
    return response.json();
  },

  async getEmployeeDocuments(id: number) {
    const response = await api.get(`${BASE}/employees/${id}/documents/`);
    if (!response.ok) throw new Error('Failed to fetch employee documents');
    return response.json();
  },

  async getEmployeeAssignments(id: number) {
    const response = await api.get(`${BASE}/employees/${id}/assignments/`);
    if (!response.ok) throw new Error('Failed to fetch employee assignments');
    return response.json();
  },

  async getEmployeeHistory(id: number) {
    const response = await api.get(`${BASE}/employees/${id}/history/`);
    if (!response.ok) throw new Error('Failed to fetch employee history');
    return response.json();
  },
};

export interface Employee {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  national_id?: string;
  employee_type: 'permanent' | 'temporary';
  department: number;
  department_name?: string;
  job_title?: string;
  salary?: number;
  wage_rate?: number;
  contract_start_date?: string;
  contract_end_date?: string;
  status: 'not_active' | 'active_assigned' | 'active_not_assigned';
  created_at: string;
  updated_at: string;
}

export interface PermanentEmployee extends Employee {
  employee_type: 'permanent';
  job_title: string;
  salary?: number;
}

export interface TemporaryEmployee extends Employee {
  employee_type: 'temporary';
  wage_rate?: number;
  contract_start_date?: string;
  contract_end_date?: string;
}

export interface DashboardStats {
  total_employees: number;
  total_permanent: number;
  total_temporary: number;
  active_employees: number;
  assigned_temporary: number;
  on_contract: number;
  exited: number;
  contracts_expiring_soon: number;
  contracts_expired: number;
  new_this_month: number;
  department_distribution: Array<{ department__name: string; count: number }>;
  recent_activities: RecentActivity[];
}

export interface RecentActivity {
  action: string;
  description: string;
  timestamp: string;
  employee_name: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface JobTitle {
  id: number;
  title: string;
  description?: string;
  department?: number;
}

export interface EmploymentType {
  id: number;
  name: string;
  description?: string;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  employment_type?: string;
  contract_status?: string;
}

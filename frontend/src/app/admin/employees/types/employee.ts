export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  department_name: string;
  job_title_name: string;
  employment_type_name: string;
  status: 'active' | 'on_leave' | 'suspended' | 'exited';
  joining_date: string;
  contract_expiry?: string;
  contract_status?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
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

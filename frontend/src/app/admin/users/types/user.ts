export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  role: number | string | null;
  role_name?: string | null;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  administrators: number;
  inactive_users: number;
  new_this_month: number;
}

export interface CreateUser {
  email: string;
  full_name: string;
  phone_number?: string;
  role_id: number;
  permission_ids: number[];
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

import { User, UserStats, CreateUser, UserFilters } from '../types/user';

const API_BASE = 'http://127.0.0.1:8000/api/users';

const authHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userService = {
  // User Statistics
  async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_BASE}/stats/`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return response.json();
  },

  // User CRUD
  async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('is_active', filters.status === 'active' ? 'true' : 'false');

    const url = params.toString() ? `${API_BASE}/?${params}` : `${API_BASE}/`;
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE}/${id}/`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async createUser(user: CreateUser): Promise<{ message: string; setup_url?: string }> {
    const response = await fetch(`${API_BASE}/invitations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send invitation');
    }
    return response.json();
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  // Role-specific endpoints
  async getAdministrators(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/administrators/`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch administrators');
    return response.json();
  },

  async getTechnicians(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/technicians/`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch technicians');
    return response.json();
  },

  async getHRUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/hr_users/`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Failed to fetch HR users');
    return response.json();
  },
};

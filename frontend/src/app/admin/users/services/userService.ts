import { User, UserStats, CreateUser, UserFilters } from '../types/user';
import { api } from '../../../../lib/api';

const BASE = '/users';

export const userService = {
  async getUserStats(): Promise<UserStats> {
    const response = await api.get(`${BASE}/stats/`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return response.json();
  },

  async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('is_active', filters.status === 'active' ? 'true' : 'false');

    const url = params.toString() ? `${BASE}/?${params}` : `${BASE}/`;
    const response = await api.get(url);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get(`${BASE}/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async createUser(user: CreateUser): Promise<{ message: string; setup_url?: string }> {
    const response = await api.post(`${BASE}/invitations/`, user);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send invitation');
    }
    return response.json();
  },

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const response = await api.patch(`${BASE}/${id}/`, user);
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(id: number): Promise<void> {
    const response = await api.delete(`${BASE}/${id}/`);
    if (!response.ok) throw new Error('Failed to delete user');
  },

  async getAdministrators(): Promise<User[]> {
    const response = await api.get(`${BASE}/administrators/`);
    if (!response.ok) throw new Error('Failed to fetch administrators');
    return response.json();
  },

  async getTechnicians(): Promise<User[]> {
    const response = await api.get(`${BASE}/technicians/`);
    if (!response.ok) throw new Error('Failed to fetch technicians');
    return response.json();
  },

  async getHRUsers(): Promise<User[]> {
    const response = await api.get(`${BASE}/hr_users/`);
    if (!response.ok) throw new Error('Failed to fetch HR users');
    return response.json();
  },
};

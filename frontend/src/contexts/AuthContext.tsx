'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  profile_picture?: string;
  role?: string | null;
  role_id?: number | null;
  job_title?: string | null;
  department?: string | null;
  department_id?: number | null;
  permissions?: string[];
  module_permissions?: Record<string, 'view' | 'edit' | 'full'>;
  landing?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => void;
  updateUser: (changes: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount (client-side only)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const accessToken = data.token;

      // Use the user data from the login response
      const userData: User = {
        id: data.user.id,
        username: data.user.email, // Use email as username since that's what's returned
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        full_name: data.user.full_name,
        role: data.user.role,
        role_id: data.user.role_id,
        job_title: data.user.job_title,
        department: data.user.department,
        department_id: data.user.department_id,
        permissions: [], // Will be filled from token data
        module_permissions: data.user.module_permissions,
        landing: '/dashboard',
      };

      console.log('Login response data:', data);
      console.log('Parsed user data:', userData);

      // Decode JWT to get legacy permissions
      const tokenData = JSON.parse(atob(accessToken.split('.')[1]));
      userData.permissions = tokenData.permissions || [];
      userData.landing = tokenData.landing || '/dashboard';

      setToken(accessToken);
      setUser(userData);

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    }
  };

  const signup = async (formData: FormData) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/auth/register/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      
      // After signup, automatically login to get token
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
  };

  const updateUser = (changes: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...changes };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshUserData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const profile = await response.json();
      setUser((current) => {
        if (!current) return current;
        const updated = {
          ...current,
          first_name: profile.first_name ?? current.first_name,
          last_name: profile.last_name ?? current.last_name,
          full_name: profile.full_name ?? current.full_name,
          email: profile.email ?? current.email,
          department: profile.department ?? profile.department_name ?? current.department,
          department_id: profile.department_id ?? current.department_id,
          job_title: profile.job_title ?? current.job_title,
          module_permissions: profile.module_permissions ?? current.module_permissions,
        };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.debug('Failed to refresh signed-in user data:', error);
    }
  }, [token]);

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    updateUser,
    refreshUserData,
    loading,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

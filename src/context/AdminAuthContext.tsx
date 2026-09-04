import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminProfile } from '../types';
import { apiRequest } from '../services/httpClient';

interface AdminAuthContextType {
  admin: AdminProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ADMIN_BASE = '/api/admin';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrentAdmin();
  }, []);

  const fetchCurrentAdmin = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ admin: AdminProfile }>(`${ADMIN_BASE}/stats`, {
        asAdmin: true,
      });
      // If the request succeeds with asAdmin, we have a valid admin token
      // Re-fetch the actual admin profile
      const adminData = await apiRequest<{ admin: AdminProfile }>(
        `${ADMIN_BASE}/users`,
        { asAdmin: true }
      );
      setAdmin(adminData.admin);
      setToken(tokenStore.getAdminToken());
    } catch (err) {
      // No valid admin session
      setAdmin(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; admin: AdminProfile }>(
        `${ADMIN_BASE}/login`,
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        }
      );
      setAdmin(data.admin);
      setToken(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin login failed. Please check your credentials.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest(`${ADMIN_BASE}/logout`, { method: 'POST' });
    } catch {
      // Logout best-effort; clear state regardless
    }
    setAdmin(null);
    setToken(null);
  };

  const value: AdminAuthContextType = {
    admin,
    token,
    isAuthenticated: Boolean(admin && token),
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
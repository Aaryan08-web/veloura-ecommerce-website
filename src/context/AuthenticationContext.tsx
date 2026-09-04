import React, { createContext, useContext, useEffect, useState } from 'react';
import { Order, ShippingAddress, UserProfile } from '../types';
import { apiRequest } from '../services/httpClient';
import { isValidEmail } from '../utils/validation';

interface AuthenticationContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  orders: Order[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateAddress: (address: ShippingAddress) => Promise<void>;
  addAddress: (address: ShippingAddress) => Promise<void>;
  removeAddress: (index: number) => Promise<void>;
  addOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const AUTH_BASE = '/api/auth';

const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export const AuthenticationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ user: UserProfile }>(`${AUTH_BASE}/me`);
      setUser(data.user);
    } catch (err) {
      // Backend failed or no token - user remains unauthenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Sync user to backend; do NOT store user JWT/plaintext in localStorage
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Please provide a valid client email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must contain at least 6 characters.' };
    }

    try {
      const data = await apiRequest<{ token: string; user: UserProfile }>(`${AUTH_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      // Authentication succeeded via backend - user state is now authoritative
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name?.trim()) {
      return { success: false, error: 'Please provide your full legal name.' };
    }
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must contain at least 6 characters.' };
    }

    try {
      await apiRequest<{ message: string }>(`${AUTH_BASE}/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      // Registration succeeded via backend; re-fetch current user
      const data = await apiRequest<{ user: UserProfile }>(`${AUTH_BASE}/me`);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Try another email address.' };
    }
  };

  const logout = async () => {
    try {
      await apiRequest(`${AUTH_BASE}/logout`, { method: 'POST' });
    } catch {
      // Logout best-effort; clear local state regardless
    }
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const result = await apiRequest<{ user: UserProfile }>(`${AUTH_BASE}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setUser(result.user);
    } catch (err) {
      // TODO: surface error to user
    }
  };

  const updateAddress = async (address: ShippingAddress) => {
    if (!user) return;
    try {
      const result = await apiRequest<{ user: UserProfile }>(`${AUTH_BASE}/address`, {
        method: 'POST',
        body: JSON.stringify(address),
      });
      setUser(result.user);
    } catch (err) {
      // TODO: surface error to user
    }
  };

  const addAddress = async (address: ShippingAddress) => {
    if (!user) return;
    try {
      const result = await apiRequest<{ user: UserProfile }>(`${AUTH_BASE}/address`, {
        method: 'POST',
        body: JSON.stringify(address),
      });
      setUser(result.user);
    } catch (err) {
      // TODO: surface error to user
    }
  };

  const removeAddress = async (index: number) => {
    if (!user) return;
    try {
      await apiRequest(`${AUTH_BASE}/address/${index}`, { method: 'DELETE' });
      setUser((prev) => {
        if (!prev) return prev;
        const updated = [...(prev.savedAddresses || [])];
        updated.splice(index, 1);
        return { ...prev, savedAddresses: updated };
      });
    } catch (err) {
      // TODO: surface error to user
    }
  };

  const activeUser = user
    ? {
        ...user,
        orders: user.orders || [],
        savedAddresses: user.savedAddresses || [],
      }
    : null;

  return (
    <AuthenticationContext.Provider
      value={{
        user: activeUser,
        isAuthenticated: !!user,
        orders: user.orders || [],
        login,
        register,
        logout,
        updateProfile,
        updateAddress,
        addAddress,
        removeAddress,
        addOrder,
        getOrderById,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }
  return context;
};
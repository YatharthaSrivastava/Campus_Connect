'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authAPI } from '@/lib/apiClient';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, fullName: string, collegeName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session from localStorage on mount ─────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('cc_token');
    const storedUser = localStorage.getItem('cc_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Refresh user data from API ─────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      const updatedUser = res.data?.data || res.data;
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('cc_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.warn('refreshUser error:', err);
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────
  const register = useCallback(async (email: string, fullName: string, collegeName?: string) => {
    const res = await authAPI.register({
      email,
      fullName,
      collegeName,
      ...(MOCK_AUTH ? {} : { firebaseToken: 'PLACEHOLDER' }),
    });

    const responseData = res.data?.data || res.data;
    const authToken = responseData?.token || responseData?.mockToken;
    const newUser = responseData?.user;

    if (authToken) {
      setToken(authToken);
      localStorage.setItem('cc_token', authToken);
    }

    if (newUser) {
      setUser(newUser);
      localStorage.setItem('cc_user', JSON.stringify(newUser));
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string) => {
    const res = await authAPI.login({
      email,
      ...(MOCK_AUTH ? {} : { firebaseToken: 'PLACEHOLDER' }),
    });

    const responseData = res.data?.data || res.data;
    const authToken = responseData?.token || responseData?.mockToken;
    const loggedInUser = responseData?.user;

    if (authToken) {
      setToken(authToken);
      localStorage.setItem('cc_token', authToken);
    }

    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('cc_user', JSON.stringify(loggedInUser));
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

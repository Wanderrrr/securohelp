'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, LoginCredentials, ApiResponse } from '@/types/database';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is ok and content type is JSON
      if (!response.ok) {
        console.error('Auth check failed:', response.status, response.statusText);
        setUser(null);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Auth check failed: Expected JSON, got:', contentType);
        setUser(null);
        return;
      }
      
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // In development, if API is not available, don't block the app
      if (process.env.NODE_ENV === 'development') {
        console.warn('Auth API not available in development mode');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

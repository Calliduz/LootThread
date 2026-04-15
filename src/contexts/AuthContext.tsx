import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, AuthResponse } from '../types/api';
import { login as loginApi } from '../api/endpoints';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'lt_auth';

function loadPersistedAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user ?? null, token: parsed.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

function persistAuth(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    // Also set bare token for the axios interceptor
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const { user, token } = loadPersistedAuth();
    return {
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'admin',
      isLoading: false,
    };
  });

  // Listen for 401 events from the axios interceptor
  useEffect(() => {
    const handler = () => {
      persistAuth(null, null);
      setState({
        user: null, token: null,
        isAuthenticated: false, isAdmin: false, isLoading: false,
      });
    };
    window.addEventListener('auth-error', handler);
    return () => window.removeEventListener('auth-error', handler);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data: AuthResponse = await loginApi(credentials);
      persistAuth(data.user, data.token);
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.role === 'admin',
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    persistAuth(null, null);
    setState({
      user: null, token: null,
      isAuthenticated: false, isAdmin: false, isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

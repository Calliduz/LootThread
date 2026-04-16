import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, LoginCredentials, AuthResponse } from '../types/api';
import { login as loginApi, register as registerApi } from '../api/endpoints';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  loginWithToken: (token: string) => void;
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

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
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
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const data: AuthResponse = await registerApi(credentials);
      persistAuth(data.user, data.token);
      setState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.role === 'admin',
        isLoading: false,
      });
      return data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * loginWithToken — used after OAuth redirect.
   * Decodes the JWT payload to extract the basic user info,
   * then persists and sets auth state. A full profile fetch
   * can be added here if needed in the future.
   */
  const loginWithToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<{ id: string; role: string; name?: string; email?: string; avatarUrl?: string }>(token);
      const user: User = {
        id:        decoded.id,
        name:      decoded.name  || '',
        email:     decoded.email || '',
        role:      decoded.role as 'admin' | 'customer',
        avatarUrl: decoded.avatarUrl,
      };
      persistAuth(user, token);
      setState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: decoded.role === 'admin',
        isLoading: false,
      });
    } catch (err) {
      console.error('[loginWithToken] Failed to decode token', err);
    }
  }, []);

  const logout = useCallback(() => {
    persistAuth(null, null);
    localStorage.removeItem('lt_cart'); // Prevent state leakage
    setState({
      user: null, token: null,
      isAuthenticated: false, isAdmin: false, isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

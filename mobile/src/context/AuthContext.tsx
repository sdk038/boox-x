import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { appStorage, secureStorage } from '../services/storage';
import { User } from '../types';

const GUEST_USER: User = {
  name: 'Guest',
  email: '',
  role: 'user',
};

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    setLoading(true);
    try {
      const token = await secureStorage.getToken();
      if (!token) {
        setUser(GUEST_USER);
        setIsAuthenticated(false);
        return;
      }

      const me = await authAPI.getMe();
      if (me.data.success && me.data.user) {
        setUser(me.data.user);
        setIsAuthenticated(true);
        await appStorage.setUser(me.data.user);
      } else {
        setUser(GUEST_USER);
        setIsAuthenticated(false);
      }
    } catch {
      await secureStorage.removeToken();
      await appStorage.removeUser();
      setUser(GUEST_USER);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession().catch(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success && response.data.user && response.data.token) {
        await secureStorage.setToken(response.data.token);
        await appStorage.setUser(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    try {
      const response = await authAPI.register(payload);
      if (response.data.success && response.data.user && response.data.token) {
        await secureStorage.setToken(response.data.token);
        await appStorage.setUser(response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    await secureStorage.removeToken();
    await appStorage.removeUser();
    setUser(GUEST_USER);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      restoreSession,
    }),
    [user, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

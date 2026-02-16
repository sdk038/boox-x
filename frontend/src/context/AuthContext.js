import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие токена и загружаем пользователя
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователя:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Сохраняем токен и пользователя
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка регистрации';
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Сохраняем токен и пользователя
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка входа';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    // Не удаляем darkMode — тема остаётся для страницы логина
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

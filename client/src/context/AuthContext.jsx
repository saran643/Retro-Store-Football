import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('retro_token') || null);
  const [loading, setLoading] = useState(true);

  // Check and restore authentication session on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('retro_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('retro_token', res.data.token);
      localStorage.setItem('retro_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await authService.adminLogin({ email, password });
    if (res.data.success) {
      localStorage.setItem('retro_token', res.data.token);
      localStorage.setItem('retro_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      localStorage.setItem('retro_token', res.data.token);
      localStorage.setItem('retro_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('retro_token');
    localStorage.removeItem('retro_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('retro_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === 'admin'),
    login,
    adminLogin,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

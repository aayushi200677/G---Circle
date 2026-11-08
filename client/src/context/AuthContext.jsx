import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gcircle_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gcircle_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch fresh profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/users/me');
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('gcircle_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Failed to load user session:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('gcircle_token', jwtToken);
      localStorage.setItem('gcircle_user', JSON.stringify(userData));
    }
    return response;
  };

  const register = async (formData) => {
    return await authService.register(formData);
  };

  const verifyEmail = async (payload) => {
    const response = await authService.verifyEmail(payload);
    if (response.success && response.data) {
      const { user: userData, token: jwtToken } = response.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('gcircle_token', jwtToken);
      localStorage.setItem('gcircle_user', JSON.stringify(userData));
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('gcircle_token');
    localStorage.removeItem('gcircle_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('gcircle_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        verifyEmail,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const payload = await apiRequest('/api/auth/me');
        if (active) {
          setUser(payload.user || null);
        }
      } catch (error) {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const payload = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setUser(payload.user || null);
    return payload.user;
  };

  const logout = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const hasPermission = (permission) => Boolean(user?.role_id?.permissions?.includes(permission));
  const hasRole = (...roles) => Boolean(user?.role_id?.name && roles.includes(user.role_id.name));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, hasPermission, hasRole, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
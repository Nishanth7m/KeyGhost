import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('keyghost_token');
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('keyghost_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('keyghost_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('keyghost_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

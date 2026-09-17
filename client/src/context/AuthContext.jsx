/**
 * context/AuthContext.jsx — Global auth state (user + token).
 * Provides useAuth() hook for any component to read auth state.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tpb_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on app load
  useEffect(() => {
    const token = localStorage.getItem('tpb_token');
    if (token) {
      authApi.me()
        .then((res) => { setUser(res.data); localStorage.setItem('tpb_user', JSON.stringify(res.data)); })
        .catch(() => { localStorage.removeItem('tpb_token'); localStorage.removeItem('tpb_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('tpb_token', data.access_token);
    const me = await authApi.me();
    setUser(me.data);
    localStorage.setItem('tpb_user', JSON.stringify(me.data));
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('tpb_token');
    localStorage.removeItem('tpb_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('tpb_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

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
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed) {
        const savedAvatar = localStorage.getItem(`tpb_avatar_${parsed.id}`);
        if (savedAvatar) parsed.avatar_url = savedAvatar;
        const savedUni = localStorage.getItem(`tpb_university_${parsed.id}`);
        if (savedUni) parsed.university = savedUni;
      }
      return parsed;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on app load
  useEffect(() => {
    const token = localStorage.getItem('tpb_token');
    if (token) {
      authApi.me()
        .then((res) => {
          const savedAvatar = localStorage.getItem(`tpb_avatar_${res.data.id}`);
          const savedUni = localStorage.getItem(`tpb_university_${res.data.id}`);
          const merged = {
            ...res.data,
            avatar_url: savedAvatar || null,
            university: savedUni || 'Riphah International University',
          };
          setUser(merged);
          localStorage.setItem('tpb_user', JSON.stringify(merged));
        })
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
    const savedAvatar = localStorage.getItem(`tpb_avatar_${me.data.id}`);
    const savedUni = localStorage.getItem(`tpb_university_${me.data.id}`);
    const fullUser = {
      ...me.data,
      avatar_url: savedAvatar || null,
      university: savedUni || 'Riphah International University',
    };
    setUser(fullUser);
    localStorage.setItem('tpb_user', JSON.stringify(fullUser));
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('tpb_token');
    localStorage.removeItem('tpb_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    if (updatedData.avatar_url !== undefined && merged.id) {
      if (updatedData.avatar_url) {
        localStorage.setItem(`tpb_avatar_${merged.id}`, updatedData.avatar_url);
      } else {
        localStorage.removeItem(`tpb_avatar_${merged.id}`);
      }
    }
    if (updatedData.university !== undefined && merged.id) {
      localStorage.setItem(`tpb_university_${merged.id}`, updatedData.university);
    }
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

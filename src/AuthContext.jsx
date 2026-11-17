import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Refresh the user on page load so the "verified" status is current
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/auth/me')
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
      })
      .catch(logout);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

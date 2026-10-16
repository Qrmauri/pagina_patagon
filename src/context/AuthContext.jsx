import { useState, useEffect } from 'react';
import { api } from '../services/api';

import { AuthContext } from '../hooks/useAuth';

const ADMIN_STORAGE_KEY = 'patagon_admin_auth';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    const hasToken = !!api.getStoredToken();
    return hasToken;
  });

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [isAdmin]);

  const login = async (username, password) => {
    try {
      // 1. Intentar autenticación real con JWT en Django REST Framework
      await api.login(username.trim(), password);
      setIsAdmin(true);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Usuario o contraseña incorrectos.',
      };
    }
  };

  const logout = () => {
    api.logout();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


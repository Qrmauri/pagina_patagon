import { useState, useEffect } from 'react';
import { api, clearLegacyCredentials } from '../services/api';
import { AuthContext } from '../hooks/useAuth';

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    clearLegacyCredentials();
    api.getSession().then(data => { if (active) setIsAdmin(data.isAdmin); })
      .catch(() => { if (active) setIsAdmin(false); })
      .finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, []);

  const login = async (username, password) => {
    try {
      await api.login(username.trim(), password);
      setIsAdmin(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'No se pudo iniciar sesión.' };
    }
  };

  const logout = async () => {
    await api.logout();
    setIsAdmin(false);
  };

  return <AuthContext.Provider value={{ isAdmin, checkingSession, login, logout }}>{children}</AuthContext.Provider>;
}

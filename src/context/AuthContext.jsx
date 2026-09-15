import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = 'patagon_admin_auth';

// Credenciales por defecto para el administrador
const DEFAULT_CREDENTIALS = {
  user: 'admin',
  pass: 'patagon2025',
};

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [isAdmin]);

  const login = (username, password) => {
    if (
      username.trim().toLowerCase() === DEFAULT_CREDENTIALS.user &&
      password === DEFAULT_CREDENTIALS.pass
    ) {
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' };
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

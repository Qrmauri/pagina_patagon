import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAdmin, checkingSession } = useAuth();

  if (checkingSession) return <p role="status">Comprobando sesión…</p>;

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

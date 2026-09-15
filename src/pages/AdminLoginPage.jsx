import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir limpiamente
  if (isAdmin) {
    return <Navigate to="/admin-productos" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);

    if (result.success) {
      addToast('Sesión de administrador iniciada con éxito', 'success');
      navigate('/admin-productos');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          padding: '36px 30px',
          borderRadius: '24px',
          boxShadow: '0 8px 30px rgba(28,26,24,0.1)',
          border: '1px solid #eedec9',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>🔐</span>
            <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '26px', margin: 0 }}>
              Acceso Administrativo
            </h1>
            <p style={{ color: '#7a746e', fontSize: '14px', marginTop: '6px' }}>
              Ingresa tus credenciales para gestionar el catálogo y pedidos de Patagon Store.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <label>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Usuario</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                style={inputStyle}
              />
            </label>

            <label>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </label>

            <button type="submit" style={buttonStyle}>
              Ingresar al Panel →
            </button>
          </form>

          <div style={{
            marginTop: '22px',
            padding: '12px',
            background: 'var(--cream, #fdf6ee)',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#7a746e',
            textAlign: 'center',
          }}>
            <span>💡 <strong>Credenciales por defecto:</strong></span><br />
            Usuario: <code>admin</code> • Contraseña: <code>patagon2025</code>
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <Link to="/" style={{ fontSize: '13px', color: '#7a746e', textDecoration: 'underline' }}>
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  outline: 'none',
  fontFamily: 'inherit',
};

const buttonStyle = {
  marginTop: '8px',
  background: '#f26419',
  color: '#fff',
  border: 'none',
  borderRadius: '999px',
  padding: '12px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

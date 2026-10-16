import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout({
  children,
  activeTab = 'products',
  onTabChange,
  backendAvailable = false,
  pendingOrdersCount = 0,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'analytics', label: 'Métricas & Analítica', icon: '📊' },
    { id: 'products', label: 'Catálogo de Productos', icon: '📦' },
    { id: 'orders', label: 'Gestión de Pedidos', icon: '📬', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
    { id: 'reviews', label: 'Reseñas de Clientes', icon: '💬' },
    { id: 'settings', label: 'Datos de la tienda', icon: '⚙️' },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'settings':
        return 'Contacto, despacho y condiciones';
      case 'analytics':
        return 'Panel de Control y Analítica de Negocio';
      case 'orders':
        return 'Registro y Gestión de Pedidos';
      case 'reviews':
        return 'Moderación de Reseñas y Opiniones';
      case 'products':
      default:
        return 'Inventario y Catálogo de Productos';
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      <style>{`
        .admin-dashboard-wrapper {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
          font-family: var(--font-body);
          color: #1e293b;
        }

        /* SIDEBAR */
        .admin-sidebar {
          width: 260px;
          background: #0f172a;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.3s ease;
          z-index: 100;
        }

        .admin-sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-sidebar-header .logo-badge {
          background: var(--brand-red-dark);
          color: #fff;
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: var(--tracking-label);
          text-transform: uppercase;
        }

        .admin-nav-list {
          list-style: none;
          padding: 16px 12px;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .admin-nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--text-on-dark);
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .admin-nav-btn:hover {
          background: rgba(255,255,255,0.06);
          color: #f8fafc;
        }

        .admin-nav-btn.active {
          background: var(--brand-red-dark);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(242, 100, 25, 0.3);
        }

        .admin-nav-badge {
          margin-left: auto;
          background: #ef4444;
          color: #ffffff;
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .admin-sidebar-footer {
          padding: 18px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-avatar {
          width: 36px;
          height: 36px;
          background: #334155;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-base);
        }

        /* MAIN CONTENT AREA */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .admin-topbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .admin-content-container {
          padding: 32px;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .backend-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
        }

        .backend-status-pill.online {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .backend-status-pill.offline {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .backend-status-pill.online .status-dot {
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        .backend-status-pill.offline .status-dot {
          background: #f59e0b;
        }

        .mobile-sidebar-toggle {
          display: none;
          background: none;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: var(--text-lg);
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .mobile-sidebar-toggle {
            display: block;
          }
          .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-topbar {
            padding: 14px 18px;
          }
          .admin-content-container {
            padding: 20px 14px;
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <span style={{ fontSize: 'var(--text-xl)' }}>🛡️</span>
          <div>
            <strong style={{ fontSize: 'var(--text-base)', letterSpacing: 'var(--tracking-heading)', display: 'block' }}>
              Patagon Store
            </strong>
            <span className="logo-badge">Backoffice</span>
          </div>
        </div>

        <ul className="admin-nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (onTabChange) onTabChange(item.id);
                  setMobileSidebarOpen(false);
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
              </button>
            </li>
          ))}

          <li style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                color: '#38bdf8',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                textDecoration: 'none',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.08)',
              }}
            >
              <span>🛍️</span>
              <span>Ver Tienda Pública →</span>
            </Link>
          </li>
        </ul>

        {/* PIE DEL SIDEBAR: USUARIO Y LOGOUT */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 'var(--text-sm)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Administrador
              </strong>
              <small style={{ color: 'var(--text-on-dark)', fontSize: 'var(--text-sm)' }}>admin@patagonstore.cl</small>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-bold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="admin-main">
        {/* BARRA SUPERIOR */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="mobile-sidebar-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              ☰
            </button>
            <div>
              <span style={{ fontSize: 'var(--text-sm)', color: '#64748b', fontWeight: 'var(--weight-semibold)' }}>Panel de Control</span>
              <h1 style={{ margin: '2px 0 0', fontSize: 'var(--text-page-title)', fontWeight: 'var(--weight-bold)', color: '#0f172a' }}>
                {getTabTitle()}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`backend-status-pill ${backendAvailable ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              {backendAvailable ? 'Django API Conectada' : 'Modo Offline (LocalStorage)'}
            </div>
          </div>
        </header>

        {/* CONTENIDO INYECTADO */}
        <div className="admin-content-container">
          {children}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import CartIcon from './CartIcon'
import AnnouncementBar from './AnnouncementBar'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAdmin, logout } = useAuth()
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <AnnouncementBar />
      <nav>
        <div className="navbar fade-up">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img 
              src="/logo_patagon_store-removebg-preview.png"
              alt="Logo Patagon Store"
              className="logo-image"
            />
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <ul className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
            <li><Link to="/juguetes" onClick={closeMenu}>🧸 Juguetes</Link></li>
            <li><Link to="/electronica" onClick={closeMenu}>⚡ Electrónica</Link></li>
            <li><Link to="/libreria" onClick={closeMenu}>📚 Librería</Link></li>
            {isAdmin && (
              <>
                <li><Link to="/admin-productos" onClick={closeMenu} style={{ color: '#d97706', fontWeight: 800 }}>🛠️ Gestión</Link></li>
                <li>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: '999px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                  >
                    Salir
                  </button>
                </li>
              </>
            )}
            <li><CartIcon /></li>
          </ul>
        </div>
      </nav>
    </>
  )
}


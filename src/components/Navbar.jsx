import { categoryLabel } from '../services/categoryLabels';
import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import CartIcon from './CartIcon';
import CartDrawer from './CartDrawer';
import AnnouncementBar from './AnnouncementBar';
import { useProducts } from '../hooks/useProducts';
import { formatPrice } from '../services/productsData';
import { PencilSimple, Lightning, Question, MagnifyingGlass, List, Heart, PuzzlePiece } from '@phosphor-icons/react';
import { useFavorites } from '../hooks/useFavorites';

export default function Navbar() {
  const { ids: favoriteIds } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { products } = useProducts();
  const favoriteCount = products.filter(product => favoriteIds.includes(String(product.id))).length;

  const closeMenu = () => setMenuOpen(false);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar sugerencias en vivo
  const searchResults = searchQuery.trim().length >= 2
    ? products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
          p.title?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          categoryLabel(p.category)?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        );
      }).slice(0, 5)
    : [];

  const handleSelectProduct = (productId) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    closeMenu();
    navigate(`/producto/${productId}`);
  };

  return (
    <>
      <AnnouncementBar />
      <nav className="storefront-navbar">
        <div className="navbar fade-up">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img 
              src="/logo_patagon_store-removebg-preview.png"
              alt="Logo Patagon Store"
              className="logo-image"
              width="488"
              height="269"
            />
          </Link>

          {/* BUSCADOR CON AUTOCOMPLETADO EN VIVO */}
          <div
            ref={searchRef}
            className="navbar-search"
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                  pointerEvents: 'none',
                }}
              >
                <MagnifyingGlass size={20} aria-hidden="true" />
              </span>
              <input
                type="text"
                aria-label="Buscar en la tienda"
                placeholder="Buscar útiles, juguetes, tecnología..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSearchDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '999px',
                  border: '1px solid var(--surface-border)',
                  background: 'var(--brand-teal-light)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: showSearchDropdown && searchResults.length > 0 ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown de Resultados en Vivo */}
            {showSearchDropdown && searchQuery.trim().length >= 2 && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  zIndex: 999,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '8px 14px', background: 'var(--brand-teal-light)', borderBottom: '1px solid var(--surface-border)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {searchResults.length > 0 ? `Sugerencias (${searchResults.length})` : 'Sin coincidencias'}
                </div>

                {searchResults.length > 0 ? (
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {searchResults.map((item) => {
                      const isOut = typeof item.stock === 'number' && item.stock === 0;
                      return (
                        <button
                          type="button"
                          className="search-suggestion"
                          key={item.id}
                          onClick={() => handleSelectProduct(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--brand-teal-light)',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=100&auto=format&fit=crop'}
                            alt={item.title}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              background: 'var(--brand-teal-light)',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--brand-red-dark)' }}>
                                {formatPrice(item.price)}
                              </span>
                              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', background: 'var(--brand-teal-light)', padding: '1px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                                {categoryLabel(item.category)}
                              </span>
                            </div>
                          </div>
                          {isOut ? (
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-red-dark)', fontWeight: 'var(--weight-bold)' }}>Agotado</span>
                          ) : (
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-teal-dark)' }}>En stock</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    No encontramos ningún producto para "<strong>{searchQuery}</strong>".
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="store-navigation"
          >
            <List size={26} aria-hidden="true" />
          </button>

          <ul id="store-navigation" className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
            <li className="nav-home-link"><Link to="/" onClick={closeMenu}>Inicio</Link></li>
            <li><NavLink to="/libreria" onClick={closeMenu}><PencilSimple className="nav-books" size={22} weight="duotone" aria-hidden="true" /> Librería</NavLink></li>
            <li><NavLink to="/juguetes" onClick={closeMenu}><PuzzlePiece className="nav-toys" size={22} weight="duotone" aria-hidden="true" /> Juguetes</NavLink></li>
            <li><NavLink to="/electronica" onClick={closeMenu}><Lightning className="nav-electronics" size={22} weight="duotone" aria-hidden="true" /> Electrónica</NavLink></li>
            <li><NavLink to="/ayuda" onClick={closeMenu}><Question className="nav-help" size={22} weight="duotone" aria-hidden="true" /> Ayuda</NavLink></li>
            <li className="nav-tracking-link"><Link to="/seguimiento" onClick={closeMenu}>Rastrear pedido</Link></li>
          </ul>
          <Link to="/favoritos" className="navbar-favorites" onClick={closeMenu} aria-label={`Mis favoritos, ${favoriteCount} guardados`} title="Mis favoritos"><Heart size={24} weight={favoriteCount ? 'fill' : 'regular'} aria-hidden="true" /><span>{favoriteCount}</span></Link>
          <div className="navbar-cart"><CartIcon /></div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}

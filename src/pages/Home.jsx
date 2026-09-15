import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';
import TestimonialsSection from '../components/TestimonialsSection';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../services/productsData';

function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1, true);
    addToast(`"${product.title}" agregado al carrito`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleToggleFavorite = () => {
    const nextState = !favorite;
    setFavorite(nextState);
    addToast(
      nextState ? `Guardado en favoritos: ${product.title}` : `Eliminado de favoritos`,
      'info'
    );
  };

  return (
    <article className="card product-card-hover">
      <div className="card-media">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop'}
          alt={product.title}
          className="card-image"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop';
          }}
        />
        {product.id <= 3 && <span className="product-badge">Destacado</span>}
        <button
          className={`favorite-btn ${favorite ? 'is-favorite' : ''}`}
          onClick={handleToggleFavorite}
          aria-label="Agregar a favoritos"
        >
          {favorite ? '♥' : '♡'}
        </button>
        <button
          className="quickview-trigger-btn"
          onClick={() => onQuickView(product)}
          title="Vista rápida"
        >
          👁 Vista Rápida
        </button>
      </div>
      <div className="card-content">
        <span className="card-category">{product.category}</span>
        <h3 className="card-title">{product.title}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <div className="card-price">{formatPrice(product.price)}</div>
          <span className="card-rating">★ 4.9</span>
        </div>
        <button 
          onClick={handleAdd}
          className="add-to-cart-btn"
          style={added ? { background: '#2c7a49', borderColor: '#2c7a49' } : {}}
        >
          {added ? '✓ ¡Agregado!' : '🛒 Agregar al carrito'}
        </button>
      </div>
    </article>
  );
}

function Hero() {
  const scrollToProducts = (e) => {
    e.preventDefault();
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCategories = (e) => {
    e.preventDefault();
    document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero fade-up delay-1">
      <div className="hero-inner">
        <div className="hero-left">
          <p className="hero-eyebrow">
            <span></span>Tienda online
          </p>
          <h1 className="hero-title">
            Bienvenido a<br/>
            <em>Patagon</em> Store
          </h1>
          <p className="hero-desc">
            Juguetes, electrónica y productos de calidad para toda la familia. Envío rápido a todo Chile.
          </p>
          <div className="hero-actions">
            <a href="#productos" onClick={scrollToProducts} className="btn-primary">
              Comenzar →
            </a>
            <a href="#categorias" onClick={scrollToCategories} className="btn-secondary">
              Ver categorías
            </a>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-dot"></div>
              Envío gratis +$30.000
            </div>
            <div className="trust-item">
              <div className="trust-dot"></div>
              Devolución 30 días
            </div>
            <div className="trust-item">
              <div className="trust-dot"></div>
              Pago seguro
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1596460107916-430662021049?w=800&auto=format&fit=crop"
            alt="Productos Patagon Store"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.parentElement.classList.add('hero-image-fallback');
            }}
          />
          <div className="hero-badge">
            <div className="hero-badge-icon">🧸</div>
            <div className="hero-badge-text">
              <strong>Catálogo actualizado</strong>
              <span>Nuevos cada semana</span>
            </div>
          </div>
          <div className="hero-mini-card hero-mini-one"><span>⚡</span><strong>Electrónica</strong><small>Lo último</small></div>
          <div className="hero-mini-card hero-mini-two"><span>📚</span><strong>Librería</strong><small>Destacados</small></div>
        </div>
      </div>
    </section>
  );
}

function Stats({ totalProductsCount }) {
  return (
    <section className="stats-strip fade-up delay-2">
      <div className="stat-card">
        <div className="stat-icon orange">🎁</div>
        <div>
          <div className="stat-num">+{totalProductsCount || 10}</div>
          <div className="stat-label">Productos disponibles</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green">🚚</div>
        <div>
          <div className="stat-num">24h</div>
          <div className="stat-label">Despacho express</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon blue">⭐</div>
        <div>
          <div className="stat-num">4.9</div>
          <div className="stat-label">Calificación clientes</div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { products } = useProducts();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [sortBy, setSortBy] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const visibleProducts = useMemo(() => {
    const list = (products || []).filter((product) => {
      if (!product) return false;
      const term = (searchTerm || '').toLowerCase().trim();
      const matchesCategory = selectedCategory === 'todas' || (product.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const content = `${product.title || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
      const matchesSearch = !term || content.includes(term);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === 'title-asc') {
      sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
    }

    return sorted;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <main>
        <div className="container">
          <Hero />
          <Stats totalProductsCount={products.length} />

          <section className="category-section" id="categorias">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Encuentra tu próximo favorito</span>
                <h2>Explora nuestras categorías</h2>
              </div>
              <Link to="/juguetes" className="text-link">Ver todo →</Link>
            </div>
            <div className="category-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <Link to="/juguetes" className="category-card"><span className="category-icon">🧸</span><div><h3>Juguetes</h3><p>Ideas para imaginar y jugar</p></div><b>→</b></Link>
              <Link to="/electronica" className="category-card"><span className="category-icon">⚡</span><div><h3>Electrónica</h3><p>Tecnología para tu día</p></div><b>→</b></Link>
              <Link to="/libreria" className="category-card"><span className="category-icon">📚</span><div><h3>Librería</h3><p>Historias que inspiran</p></div><b>→</b></Link>
            </div>
          </section>

          <section id="productos">
            <div className="section-heading products-heading">
              <div>
                <span className="section-kicker">Selección Patagon</span>
                <h2>Productos destacados</h2>
              </div>
              <div className="product-search">
                <span>⌕</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar productos..."
                />
              </div>
            </div>

            {/* Barra de Filtros y Ordenamiento */}
            <div className="catalog-toolbar">
              <div className="category-pills">
                {['todas', 'juguetes', 'electrónica', 'libros'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat === 'todas' ? 'Todos' : cat}
                  </button>
                ))}
              </div>

              <div className="sort-control">
                <label htmlFor="sort-select">Ordenar por:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="default">Destacados</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="title-asc">Nombre A-Z</option>
                </select>
                <span className="results-counter">
                  ({visibleProducts.length} {visibleProducts.length === 1 ? 'producto' : 'productos'})
                </span>
              </div>
            </div>

            {visibleProducts.length > 0 ? (
              <div className="products-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <strong>No encontramos productos</strong>
                <span>Prueba con otra búsqueda o selecciona otra categoría.</span>
              </div>
            )}
          </section>

          <section className="promo-banner">
            <div>
              <span className="section-kicker">Una compra que conviene</span>
              <h2>Compra más, disfruta más</h2>
              <p>Envío gratis en compras sobre $30.000 a todo Chile</p>
            </div>
            <a
              href="#productos"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-secondary"
            >
              Ver productos →
            </a>
          </section>

          {/* Sección de Testimonios */}
          <TestimonialsSection />

          <section className="benefits-section">
            <div><span>🚚</span><strong>Envíos a todo Chile</strong><small>Recibe donde estés</small></div>
            <div><span>🔒</span><strong>Pago seguro</strong><small>Compra con confianza</small></div>
            <div><span>↩️</span><strong>Devolución fácil</strong><small>30 días para cambiar</small></div>
            <div><span>💬</span><strong>Atención al cliente</strong><small>Estamos para ayudarte</small></div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h2>Patagon <em>Store</em></h2>
            <p>Una tienda para descubrir<br />cosas que hacen bien.</p>
            <div className="social-links">
              <a href="#instagram">◎</a>
              <a href="#facebook">f</a>
              <a href="#whatsapp">◌</a>
            </div>
          </div>
          <div>
            <h3>Comprar</h3>
            <Link to="/juguetes">Juguetes</Link>
            <Link to="/electronica">Electrónica</Link>
            <Link to="/libreria">Librería</Link>
          </div>
          <div>
            <h3>Ayuda</h3>
            <a href="#envios">Envíos</a>
            <a href="#devoluciones">Devoluciones</a>
            <a href="#preguntas">Preguntas frecuentes</a>
          </div>
          <div>
            <h3>Empresa</h3>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
            <Link to={isAdmin ? "/admin-productos" : "/admin-login"} style={{ color: '#9ca3af', fontSize: '13px' }}>
              {isAdmin ? "⚙️ Panel Administración" : "🔒 Acceso Administrativo"}
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Patagon Store</span>
          <span>Hecho para disfrutar lo cotidiano</span>
        </div>
      </footer>
    </>
  );
}

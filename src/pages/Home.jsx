import { categoryLabel } from '../services/categoryLabels';
import { Truck, ShieldCheck, ArrowUUpLeft, ChatCircle, MagnifyingGlass, Coins, CaretDown, Gear, Lock } from '@phosphor-icons/react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QuickViewModal from '../components/QuickViewModal';
import TestimonialsSection from '../components/TestimonialsSection';
import ProductCard from '../components/ProductCard';
import StorefrontHero from '../components/StorefrontHero';
import StorefrontCategories from '../components/StorefrontCategories';
import ShoppingNeeds from '../components/ShoppingNeeds';
import BrandPageEdges from '../components/BrandPageEdges';
import BrandFootprint from '../components/BrandFootprint';
import BrandDoodles from '../components/BrandDoodles';
import BrandText from '../components/BrandText';
import FeaturedProducts from '../components/FeaturedProducts';
import { useProducts } from '../hooks/useProducts';
import ProductPairing from '../components/ProductPairing';
import PatagonStory from '../components/PatagonStory';
import StorefrontDetails from '../components/StorefrontDetails';
import StorePhotoGallery from '../components/StorePhotoGallery';
import { useAuth } from '../hooks/useAuth';
import { DEMO_MODE } from '../services/checkout';

export default function Home() {
  const { products, loading, backendAvailable } = useProducts();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [priceRange, setPriceRange] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const visibleProducts = useMemo(() => {
    const list = (products || []).filter((product) => {
      if (!product) return false;
      const term = (searchTerm || '').toLowerCase().trim();
      const matchesCategory = selectedCategory === 'todas' || (product.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const content = `${product.title || ''} ${product.description || ''} ${product.category || ''} ${categoryLabel(product.category) || ''}`.toLowerCase();
      const matchesSearch = !term || content.includes(term);

      const price = Number(product.price || 0);
      let matchesPrice = true;
      if (priceRange === 'under-20k') matchesPrice = price < 20000;
      else if (priceRange === '20k-50k') matchesPrice = price >= 20000 && price <= 50000;
      else if (priceRange === '50k-100k') matchesPrice = price > 50000 && price <= 100000;
      else if (priceRange === 'over-100k') matchesPrice = price > 100000;

      return matchesCategory && matchesSearch && matchesPrice && (!availableOnly || Number(product.stock) > 0);
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
  }, [products, searchTerm, selectedCategory, priceRange, sortBy, availableOnly]);

  return (
    <>
      <Navbar />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <main className="store-home storefront-home">
        <BrandPageEdges />
        <StorefrontHero />
        <div className="container">

          <StorefrontCategories />
          <BrandDoodles />
          <FeaturedProducts products={products} />

          <section id="productos">
            <div className="section-heading products-heading">
              <div>
                <span className="section-kicker"><BrandFootprint className="brand-kicker-mark" /> Todas tus ideas</span>
                <h2><BrandText text="Explora nuestro catálogo" /></h2>
              </div>
              <div className="product-search">
                <span><MagnifyingGlass size={20} aria-hidden="true" /></span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Buscar productos del catálogo"
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
                    {cat === 'todas' ? 'Todos' : categoryLabel(cat)}
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

<label className="availability-filter"><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} /> Solo productos disponibles</label>
            {/* Rango de Precios */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '0 0 24px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--weight-semibold)' }}>
                <Coins size={18} weight="duotone" aria-hidden="true" /> Precio:
              </span>
              {[
                { id: 'all', label: 'Todos los precios' },
                { id: 'under-20k', label: 'Menos de $20.000' },
                { id: '20k-50k', label: '$20.000 - $50.000' },
                { id: '50k-100k', label: '$50.000 - $100.000' },
                { id: 'over-100k', label: 'Más de $100.000' },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setPriceRange(range.id)}
                  className={`filter-pill ${priceRange === range.id ? 'active' : ''}`}
                  style={{ fontSize: 'var(--text-sm)', padding: '5px 12px' }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {visibleProducts.length > 0 ? (
              <div className="products-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    showBadge={product.id <= 3}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results" role="status">
                <BrandFootprint className="brand-empty-mark" />
                <strong>{loading ? 'Cargando catálogo…' : !DEMO_MODE && !backendAvailable ? 'Catálogo temporalmente no disponible' : products.length === 0 ? 'Estamos preparando el catálogo' : 'No encontramos productos'}</strong>
                <span>{!DEMO_MODE && (!backendAvailable || products.length === 0) ? 'Vuelve más tarde para consultar productos y disponibilidad confirmados.' : 'Prueba con otra búsqueda o selecciona otra categoría.'}</span>
              </div>
            )}
          </section>

          <details className="home-discover-more">
            <summary>Más formas de encontrar tu próxima idea <CaretDown size={22} aria-hidden="true" /></summary>
            <ShoppingNeeds />
            <ProductPairing products={products} />
          </details>
          <BrandDoodles />
          <PatagonStory />
          <StorePhotoGallery />

          {/* Sección de Testimonios */}
          <details className="home-discover-more">
            <summary>{DEMO_MODE ? 'Opiniones sobre esta demostración' : 'Opiniones de la comunidad'} <CaretDown size={22} aria-hidden="true" /></summary>
            <TestimonialsSection />
          </details>
          <StorefrontDetails />

          <section id="ayuda" className="demo-info">
            <span className="section-kicker">Proyecto de portafolio</span>
            <h2>Explora la tienda con tranquilidad</h2>
            <p>Este sitio es una demostración. Los productos, reseñas y condiciones comerciales son ejemplos. Usa datos ficticios al probar el checkout: el pago es simulado, no se realizan cobros ni se despachan productos.</p>
          </section>
          <section className="benefits-section">
            <Link to="/ayuda"><Truck size={28} aria-hidden="true" /><strong>Información de entrega</strong><small>Consulta zonas y plazos</small></Link>
            <a href="#ayuda"><ShieldCheck size={28} aria-hidden="true" /><strong>Compra de demostración</strong><small>Conoce cómo funciona</small></a>
            <Link to="/ayuda"><ArrowUUpLeft size={28} aria-hidden="true" /><strong>Cambios y devoluciones</strong><small>Revisa las condiciones</small></Link>
            <Link to="/ayuda"><ChatCircle size={28} aria-hidden="true" /><strong>Ayuda y contacto</strong><small>Encuentra información útil</small></Link>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="footer-logo"><img src="/logo_patagon_store-removebg-preview.png" alt="Patagon Store — inicio" width="488" height="269" loading="lazy" /></Link>
            <p>Librería, juguetes y electrónica.<br />Ideas para crear y jugar.</p>
            <p>Demo de tienda online.<br />No se realizan ventas reales.</p>
          </div>
          <div>
            <h2>Comprar</h2>
            <Link to="/juguetes">Juguetes</Link>
            <Link to="/electronica">Electrónica</Link>
            <Link to="/libreria">Librería</Link>
          </div>
          <div>
            <h2>Ayuda</h2>
            <Link to="/ayuda">Despacho y contacto</Link>
            <Link to="/ayuda">Cambios y condiciones</Link>
            <Link to="/seguimiento">Seguimiento de pedidos</Link>
          </div>
          <div>
            <h2>Empresa</h2>
            <a href="#nuestra-historia">Así es Patagon</a>
            <a href="#ayuda">Información</a>
            <Link to={isAdmin ? "/admin" : "/admin/login"} style={{ color: 'var(--text-on-dark)', fontSize: 'var(--text-sm)' }}>
              {isAdmin ? <><Gear size={18} aria-hidden="true" /> Panel de Control</> : <><Lock size={18} aria-hidden="true" /> Acceso Administrativo</>}
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Patagon Store · Proyecto de demostración</span>
          <span>Hecho para disfrutar lo cotidiano</span>
        </div>
      </footer>
    </>
  );
}

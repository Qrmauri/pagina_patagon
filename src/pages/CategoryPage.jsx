import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PencilSimple } from '@phosphor-icons/react'
import BrandFootprint from '../components/BrandFootprint'
import BrandPageEdges from '../components/BrandPageEdges'
import './CategoryPage.css'
import Navbar from '../components/Navbar'
import CatalogFilters from '../components/CatalogFilters'
import { filterCatalog } from '../services/store'
import QuickViewModal from '../components/QuickViewModal'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { filterByNeed, SHOPPING_NEEDS } from '../services/shoppingNeeds'

const CATEGORY_PRESENTATION = {
  libros: { line: 'Ideas para aprender y crear.', description: 'Útiles escolares, artículos de oficina, manualidades y libros para acompañar tus ideas.' },
  juguetes: { image: 'peluche-clasico', line: 'La imaginación empieza aquí.', description: 'Pequeños descubrimientos, grandes momentos. Encuentra juguetes para aprender, regalar y jugar.' },
  electrónica: { image: 'audifonos-premium', line: 'Conecta con lo que disfrutas.', description: 'Tecnología para tus juegos, tu música y los momentos de cada día. Explora nuestra selección.' },
};

export default function CategoryPage({ title, emoji, category, description, children }) {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const activeNeed = SHOPPING_NEEDS.find(need => need.id === searchParams.get('necesidad') && need.category === category);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filters, setFilters] = useState({ search: '', available: false, minPrice: '', maxPrice: '', sort: 'default' });

  const categoryProducts = products.filter(
    (product) => product.category?.toLowerCase() === category?.toLowerCase()
  );

  const filteredProducts = filterCatalog(filterByNeed(categoryProducts, activeNeed?.id), filters);
  const presentation = CATEGORY_PRESENTATION[category];

  return (
    <>
      <Navbar />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <main className="catalog-page patagon-catalog" data-category={category}>
        <BrandPageEdges />
        <div className="container">
          <section className="patagon-category-heading" aria-labelledby="category-title">
            <div className="category-hero-copy">
            <p className="category-eyebrow">El mundo de Patagon</p>
            <h1 id="category-title">
              <span className="category-heading-icon" aria-hidden="true">{emoji}</span>{' '}
              <span>{title.split(/([^\u0020-\u007e]+)/u).map((part, index) => (
                <span key={index} className={/[^\u0020-\u007e]/u.test(part) ? 'category-heading-fallback' : undefined}>{part}</span>
              ))}</span>
            </h1>
            <p className="category-intro">
              {description || presentation?.description || `Explora nuestras selecciones de ${title.toLowerCase()}`}
            </p>
            <a className="category-explore" href="#productos">Ver productos <span aria-hidden="true">→</span></a>
            </div>
            <div className="category-hero-art">
              <BrandFootprint className="category-footprint" />
              {presentation?.image ? <img src={`/products/illustrations/${presentation.image}.webp`} alt="" width="320" height="320" /> : <div className="category-stationery-art" aria-hidden="true"><PencilSimple size={140} weight="duotone" /></div>}
              <span className="category-art-caption">{category === 'libros' ? 'Estudia. Crea. Imagina.' : 'Ilustración · Patagon Store'}</span>
            </div>
          </section>

          <nav className="category-switcher" aria-label="Explorar categorías">
            <span>Descubre también</span>
            <Link to="/libreria" aria-current={category === 'libros' ? 'page' : undefined}>Librería</Link>
            <Link to="/juguetes" aria-current={category === 'juguetes' ? 'page' : undefined}>Juguetes</Link>
            <Link to="/electronica" aria-current={category === 'electrónica' ? 'page' : undefined}>Electrónica</Link>
          </nav>

          {children}
          {activeNeed && <div className="category-need-selection"><div><span className="section-kicker">Tu selección Patagon</span><h2>{activeNeed.title}</h2><p>{activeNeed.description}. Mostramos las coincidencias del catálogo actual.</p></div><Link to={activeNeed.path}>Ver toda la categoría <span aria-hidden="true">→</span></Link></div>}
          <CatalogFilters filters={filters} onChange={setFilters} />
          <p role="status" className="category-result-count">{filteredProducts.length} {filteredProducts.length === 1 ? 'producto para descubrir' : 'productos para descubrir'}</p>

          <section id="productos" className="category-products">
            <p className="category-products-kicker">{presentation?.line || 'Descubre nuestra selección.'}</p>
            <h2 className="catalog-list-title">Productos de {title.toLowerCase()}</h2>
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '18px' }}>
                  <p style={{ fontSize: 'var(--text-lg)', color: '#7a746e' }}>
                    No hay productos que coincidan con estos filtros en <strong>{title}</strong>.
                  </p>
                  <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                    {activeNeed ? 'Todavía no hay coincidencias para esta selección y estos filtros. Puedes explorar toda la categoría con el enlace de arriba.' : 'Prueba otro precio o limpia los filtros.'}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

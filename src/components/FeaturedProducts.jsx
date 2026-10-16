import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { formatPrice, isProductIllustration } from '../services/productsData';
import { categoryLabel } from '../services/categoryLabels';

const selection = ['Peluche Clásico', 'Libro Aventuras', 'Audífonos Premium'];

export default function FeaturedProducts({ products }) {
  const selected = selection.map(title => products.find(product => product.title === title)).filter(Boolean);
  const featured = selected.length ? selected : products.slice(0, 3);
  if (!featured.length) return null;
  return <section className="storefront-featured" aria-labelledby="favorites-heading">
    <div className="storefront-section-heading"><div><p className="storefront-selection-label">El rincón Patagon</p><h2 id="favorites-heading">Pequeños hallazgos, grandes ideas</h2></div><a href="#productos">Ver todos los productos <ArrowRight size={18} aria-hidden="true" /></a></div>
    <div className="storefront-featured-grid">
      {featured.map(product => <article className="storefront-featured-product" data-category={product.category} key={product.id}>
        <Link to={`/producto/${product.id}`} className="storefront-featured-image"><img src={product.image || '/product-placeholder.svg'} alt={product.title} width="200" height="200" loading="lazy" decoding="async" /><small>{isProductIllustration(product) ? 'Imagen ilustrativa' : 'Imagen del producto'}</small></Link>
        <div className="storefront-featured-copy"><span className="storefront-product-category">{categoryLabel(product.category)}</span><h3><Link to={`/producto/${product.id}`}>{product.title}</Link></h3><p>{formatPrice(product.price)}</p><Link className="storefront-product-link" to={`/producto/${product.id}`}>Ver producto <ArrowRight size={18} aria-hidden="true" /></Link></div>
      </article>)}
    </div>
  </section>;
}

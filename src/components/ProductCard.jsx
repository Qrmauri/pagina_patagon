import BrandText from './BrandText';
import { categoryLabel } from '../services/categoryLabels';
import { Eye, Heart, ShoppingCart, Check, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice, isProductIllustration } from '../services/productsData';


export default function ProductCard({
  product,
  onQuickView,
  showBadge = false,
  showFavorite = true,
}) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);
  const favorites = useFavorites();
  const isFavorite = favorites.isFavorite(product.id);

  const handleAdd = () => {
    if (product.stock === 0) {
      addToast(`"${product.title}" se encuentra actualmente agotado`, 'warning');
      return;
    }
    if (!addToCart(product, 1, true)) return;
    addToast(`"${product.title}" agregado al carrito`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleToggleFavorite = () => {
    try {
      const selected = favorites.toggle(product.id);
      addToast(`${selected ? 'Guardado en' : 'Eliminado de'} favoritos: ${product.title}`, 'info');
    } catch {
      addToast('No pudimos guardar tus favoritos. Revisa si el navegador permite almacenamiento local.', 'error');
    }
  };

  const isOutOfStock = typeof product.stock === 'number' && product.stock === 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;

  return (
    <article className={`card product-card-hover ${isOutOfStock ? 'is-out-of-stock' : ''}`} data-category={product.category}>
      <div className="card-media">
        <Link to={`/producto/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}>
          <img
            src={product.image || '/product-placeholder.svg'}
            alt={product.title}
            className="card-image"
            style={isProductIllustration(product) ? { objectFit: 'contain', background: '#faf6ef' } : undefined}
            loading="lazy"
            decoding="async"
            width="800"
            height="800"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = '/product-placeholder.svg';
            }}
          />
        </Link>

        {/* Insignias de estado */}
        {isOutOfStock ? (
          <span className="product-badge out-of-stock-badge">Agotado</span>
        ) : isLowStock ? (
          <span className="product-badge low-stock-badge">¡Últimas {product.stock} un.!</span>
        ) : showBadge ? (
          <span className="product-badge">Destacado</span>
        ) : null}

        {showFavorite && (
          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
            aria-pressed={isFavorite}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart size={21} weight={isFavorite ? 'fill' : 'regular'} aria-hidden="true" />
          </button>
        )}

        {onQuickView && (
          <button
            type="button"
            className="quickview-trigger-btn"
            onClick={() => onQuickView(product)}
            title="Vista rápida"
          >
            <Eye size={18} aria-hidden="true" /> Vista rápida
          </button>
        )}
      </div>

      <div className="card-content">
        {isProductIllustration(product) && <small className="product-illustration-note">Imagen ilustrativa</small>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-category">{categoryLabel(product.category)}</span>
          {typeof product.stock === 'number' && product.stock > 0 && (
            <span style={{ fontSize: 'var(--text-sm)', color: '#52635e' }}>
              Stock: <strong>{product.stock}</strong>
            </span>
          )}
        </div>

        <h3 className="card-title">
          <Link to={`/producto/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            <BrandText text={product.title} />
          </Link>
        </h3>
        <p className="card-desc">{product.description}</p>

        <div className="card-footer">
          <div className="card-price">{formatPrice(product.price)}</div>
          <span className="card-rating">Demo</span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`add-to-cart-btn ${isOutOfStock ? 'btn-out-of-stock' : ''}`}
          style={
            isOutOfStock
              ? { background: '#9ca3af', borderColor: '#9ca3af', cursor: 'not-allowed', opacity: 0.8 }
              : added
              ? { background: 'var(--brand-teal-dark)', borderColor: 'var(--brand-teal-dark)' }
              : {}
          }
        >
          {isOutOfStock ? <><X size={18} aria-hidden="true" /> Agotado</> : added ? <><Check size={18} aria-hidden="true" /> ¡Agregado!</> : <><ShoppingCart size={19} aria-hidden="true" /> Agregar al carrito</>}
        </button>
      </div>
    </article>
  );
}

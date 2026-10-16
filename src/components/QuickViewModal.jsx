import { categoryLabel } from '../services/categoryLabels';
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { Link } from 'react-router-dom';
import { formatPrice, isProductIllustration } from '../services/productsData';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    const added = addToCart(product, quantity, true);
    if (!added) return;
    addToast(`Se agregaron ${added}x "${product.title}" al carrito`, 'success');
    onClose();
  };

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="quickview-grid">
          <div className="quickview-image-wrap">
            <img
              src={product.image || '/product-placeholder.svg'}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/product-placeholder.svg';
              }}
            />
            <span className="quickview-category-badge">{categoryLabel(product.category)}</span>
          </div>

          <div className="quickview-info">
            <span className="section-kicker">Vista Rápida</span>
            <h2 className="quickview-title">{product.title}</h2>
            {isProductIllustration(product) && <p className="product-illustration-note">Imagen ilustrativa del producto</p>}
            
            <div className="quickview-rating-row">
              <span className="card-rating">Reseña de ejemplo</span>
              <span className="quickview-reviews-count">Sin reseñas verificadas del producto</span>
            </div>

            <div className="quickview-price">
              {formatPrice(product.price)}
            </div>

            <p className="quickview-desc">
              {product.description}
            </p>

            <div className="quickview-perks">
              <div><span>🚚</span> Consulta zonas y plazos de entrega</div>
              <div><span>↩️</span> Condiciones de cambios disponibles en Ayuda</div>
              <div><Link to="/ayuda">Contacto y condiciones de compra</Link></div>
            </div>

            <div className="quickview-actions">
              <div className="quickview-qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
              </div>
              <button onClick={handleAdd} disabled={product.stock === 0} className="btn-primary quickview-add-btn">
                🛒 Agregar al Carrito • {formatPrice(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

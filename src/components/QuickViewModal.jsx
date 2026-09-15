import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../services/productsData';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, quantity, true);
    addToast(`Se agregaron ${quantity}x "${product.title}" al carrito`, 'success');
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
              src={product.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=600&auto=format&fit=crop'}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=600&auto=format&fit=crop';
              }}
            />
            <span className="quickview-category-badge">{product.category}</span>
          </div>

          <div className="quickview-info">
            <span className="section-kicker">Vista Rápida</span>
            <h2 className="quickview-title">{product.title}</h2>
            
            <div className="quickview-rating-row">
              <span className="card-rating">★★★★★ 4.9</span>
              <span className="quickview-reviews-count">(38 opiniones verificadas)</span>
            </div>

            <div className="quickview-price">
              {formatPrice(product.price)}
            </div>

            <p className="quickview-desc">
              {product.description}
            </p>

            <div className="quickview-perks">
              <div><span>🚚</span> Despacho 24-48h a todo Chile</div>
              <div><span>↩️</span> Garantía de satisfacción 30 días</div>
              <div><span>🔒</span> Pago seguro con cifrado SSL</div>
            </div>

            <div className="quickview-actions">
              <div className="quickview-qty">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button onClick={handleAdd} className="btn-primary quickview-add-btn">
                🛒 Agregar al Carrito • {formatPrice(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

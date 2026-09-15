import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../services/productsData';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const total = getTotalPrice();
  const totalItems = getTotalItems();

  const FREE_SHIPPING_THRESHOLD = 30000;
  const progressPercent = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  if (!isDrawerOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={closeDrawer}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <h3>Tu Carrito</h3>
            <span className="cart-drawer-count">({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
          </div>
          <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Cerrar carrito">
            ✕
          </button>
        </div>

        {/* Barra de progreso de envío gratis */}
        <div className="free-shipping-bar">
          <div className="free-shipping-text">
            {remainingForFree > 0 ? (
              <span>Te faltan <strong>{formatPrice(remainingForFree)}</strong> para <strong>Envío Gratis 🚚</strong></span>
            ) : (
              <span className="free-shipping-achieved">🎉 ¡Felicidades! Tienes <strong>Envío Gratis</strong></span>
            )}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent >= 100 ? '#2c7a49' : '#f26419'
              }}
            ></div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Tu carrito aún está vacío</p>
              <button onClick={closeDrawer} className="btn-secondary" style={{ marginTop: '14px' }}>
                Explorar productos
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="drawer-item">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=200&auto=format&fit=crop'}
                  alt={item.title}
                  className="drawer-item-img"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=200&auto=format&fit=crop';
                  }}
                />
                <div className="drawer-item-details">
                  <div className="drawer-item-top">
                    <h4>{item.title}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="drawer-remove-btn"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="drawer-item-category">{item.category}</span>
                  <div className="drawer-item-bottom">
                    <div className="drawer-qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="drawer-item-price">
                      {formatPrice(item.numericPrice ? item.numericPrice * item.quantity : item.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer del Drawer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-subtotal">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="drawer-shipping-note">Impuestos y opciones de envío calculados al finalizar.</p>
            <div className="drawer-actions">
              <Link
                to="/carrito"
                onClick={closeDrawer}
                className="btn-primary drawer-checkout-btn"
              >
                Ir a Pagar • {formatPrice(total)} →
              </Link>
              <button onClick={closeDrawer} className="btn-link-continue">
                Seguir comprando
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

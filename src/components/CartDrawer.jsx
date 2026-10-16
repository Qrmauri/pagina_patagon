import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../services/productsData';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const total = getTotalPrice();
  const totalItems = getTotalItems();
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector('[data-cart-close]')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeDrawer();
      if (event.key !== 'Tab') return;
      const elements = drawerRef.current?.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!drawerRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isDrawerOpen, closeDrawer]);

  const FREE_SHIPPING_THRESHOLD = 30000;
  const progressPercent = Math.min(100, Math.round((total / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  if (!isDrawerOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={closeDrawer}>
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <h2 id="cart-drawer-title">Tu Carrito</h2>
            <span className="cart-drawer-count">({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
          </div>
          <button data-cart-close className="cart-drawer-close" onClick={closeDrawer} aria-label="Cerrar carrito">
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
                background: progressPercent >= 100 ? 'var(--brand-teal-dark)' : 'var(--brand-red-dark)'
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
                  src={item.image || '/product-placeholder.svg'}
                  alt={item.title}
                  className="drawer-item-img"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith('/product-placeholder.svg')) e.currentTarget.src = '/product-placeholder.svg';
                  }}
                />
                <div className="drawer-item-details">
                  <div className="drawer-item-top">
                    <h3>{item.title}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="drawer-remove-btn"
                      title="Eliminar"
                      aria-label={`Quitar ${item.title}`}
                    >
                      ✕
                    </button>
                  </div>
                  <span className="drawer-item-category">{item.category}</span>
                  <span className="drawer-stock-note">{formatPrice(item.numericPrice)} / unidad · Stock: {item.stock}</span>
                  <div className="drawer-item-bottom">
                    <div className="drawer-qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Reducir cantidad de ${item.title}`}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Aumentar cantidad de ${item.title}`}>+</button>
                    </div>
                    <span className="drawer-item-price">
                      {formatPrice(item.numericPrice * item.quantity)}
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

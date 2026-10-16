import { useState } from 'react';
import { calculateCheckout, DEMO_MODE } from '../services/checkout';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import Navbar from '../components/Navbar';
import StorePurchaseInfo from '../components/StorePurchaseInfo';
import OrderReceiptModal from '../components/OrderReceiptModal';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatPrice, parsePrice } from '../services/productsData';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems, refreshCart, addToCart } = useCart();
  const [removedItems, setRemovedItems] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [checkingCart, setCheckingCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const total = getTotalPrice();
  const itemCount = getTotalItems();
  const busy = checkingCart || validatingCoupon;

  const { shippingCost, discountAmount, finalTotal, couponEligible } = calculateCheckout(total, appliedCoupon);

  const handleProceedToCheckout = async () => {
    if (checkingCart) return;
    setCartMessage('');
    setCheckingCart(true);
    try {
      const result = await refreshCart();
      if (!result.cart.length) {
        addToast('Los productos del carrito ya no están disponibles.', 'warning');
      } else if (result.changed) {
        setCartMessage('Actualizamos precios o cantidades. Revisa los productos y el total antes de continuar.');
        addToast('Actualizamos precios o cantidades. Revisa el carrito antes de continuar.', 'warning', 6000);
      } else {
        setShowCheckout(true);
      }
    } catch (error) {
      setCartMessage(error.message);
      addToast(error.message, 'error');
    } finally {
      setCheckingCart(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code || validatingCoupon) return;
    setCouponError('');
    setValidatingCoupon(true);
    try {
      const coupon = await api.validateCoupon(code, total, total >= 30000 ? 0 : 3990);
      setAppliedCoupon(coupon);
      addToast(coupon.message || 'Cupón aplicado', 'success');
    } catch (error) {
      setCouponError(error.message);
      addToast(error.message, 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemove = (item) => {
    setRemovedItems([item]);
    removeFromCart(item.id);
  };

  const handleClear = () => {
    setRemovedItems(cart);
    clearCart();
  };

  const handleUndo = () => {
    removedItems.forEach((item) => addToCart(item, item.quantity, false));
    setRemovedItems([]);
  };

  const undoNotice = removedItems.length > 0 && (
    <div className="cart-undo" role="status">
      <span>{removedItems.length === 1 ? `Quitaste ${removedItems[0].title}.` : 'Vaciaste el carrito.'}</span>
      <button type="button" onClick={handleUndo} disabled={busy}>Deshacer</button>
    </div>
  );

  const handleCheckoutSuccess = (orderData) => {
    clearCart();
    setCompletedOrder(orderData);
    setShowCheckout(false);
  };

  // 1. Pantalla de Confirmación de Pedido Exitoso
  if (completedOrder) {
    return (
      <>
        <Navbar />
        {showReceiptModal && (
          <OrderReceiptModal
            order={completedOrder}
            onClose={() => setShowReceiptModal(false)}
          />
        )}

        <div className="cart-page" style={{ maxWidth: '680px', margin: '40px auto 80px', textAlign: 'center' }}>
          <div style={{
            background: '#ffffff',
            padding: '40px 32px',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(28,26,24,0.1)',
            border: '1px solid #eedec9',
          }}>
            <span style={{ fontSize: 'var(--text-4xl)', display: 'block', marginBottom: '12px' }}>🎉</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#2c7a49', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>
              {completedOrder.demo ? 'Prueba completada' : 'Pedido registrado'}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-page-title)', margin: '8px 0 12px', color: '#1c1a18' }}>
              {completedOrder.demo ? '¡Demo completada' : '¡Gracias por tu pedido'}, {completedOrder.customer_name}!
            </h1>
            <p style={{ color: '#7a746e', fontSize: 'var(--text-base)', marginBottom: '24px' }}>
              {completedOrder.demo ? 'Simulación completada. No se realizó ningún cobro ni se enviarán productos.' : 'Tu pedido quedó registrado y pendiente de confirmación de pago.'}
            </p>

            <div style={{
              background: '#fdf6ee',
              border: '1px solid #eedec9',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              fontSize: 'var(--text-sm)',
            }}>
              <div><strong>N° de Pedido:</strong> #{completedOrder.id}</div>
              <div><strong>Total del pedido:</strong> <span style={{ color: 'var(--brand-red-dark)', fontWeight: 'var(--weight-bold)' }}>{formatPrice(completedOrder.total)}</span></div>
              <div><strong>Correo:</strong> {completedOrder.customer_email}</div>
              <div><strong>Destino:</strong> {completedOrder.address}, {completedOrder.city}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '380px', margin: '0 auto' }}>
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                style={{
                  background: 'var(--brand-red-dark)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(242, 100, 25, 0.3)',
                }}
              >
                📄 Ver resumen de demostración
              </button>

              {!completedOrder.demo && <button
                type="button"
                onClick={() => navigate(`/seguimiento?id=${completedOrder.id}&email=${encodeURIComponent(completedOrder.customer_email)}`)}
                style={{
                  background: '#ffffff',
                  color: '#2c7a49',
                  border: '2px solid #2c7a49',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                🚚 Rastrear este Pedido en Vivo
              </button>}

              <Link
                to="/"
                style={{
                  color: '#7a746e',
                  fontSize: 'var(--text-sm)',
                  textDecoration: 'underline',
                  marginTop: '10px',
                }}
              >
                ← Volver a la Tienda
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2. Carrito Vacío
  if (cart.length === 0 && !showCheckout) {
    return (
      <>
        <Navbar />
        <main className="cart-page cart-page--shop">
          <Link to="/" className="cart-back-link">← Seguir explorando</Link>
          {undoNotice}
          <div className="empty-cart">
            <span className="cart-empty-symbol" aria-hidden="true">🛍️</span>
            <h1>Tu próxima elección te espera</h1>
            <p>Tu carrito está vacío. Descubre librería, juguetes y tecnología para toda la familia.</p>
            <Link to="/" className="continue-shopping-btn">
              ← Explorar Productos
            </Link>
          </div>
        </main>
      </>
    );
  }

  // 3. Formulario de Checkout
  if (showCheckout) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <button 
            onClick={() => setShowCheckout(false)}
            className="back-to-cart-btn"
          >
            ← Volver al carrito
          </button>
          <CheckoutForm 
            cart={cart} 
            total={total}
            initialCoupon={couponEligible ? appliedCoupon : null}
            onSuccess={handleCheckoutSuccess}
          />
        </div>
      </>
    );
  }

  // 4. Listado del Carrito
  return (
    <>
      <Navbar />
      <main className="cart-page cart-page--shop">
        <Link to="/" className="cart-back-link">← Seguir explorando</Link>
        <header className="cart-heading">
          <div><span className="cart-eyebrow">TU SELECCIÓN PATAGON</span><h1>Mi carrito<span>.</span></h1><p>{itemCount} {itemCount === 1 ? 'unidad' : 'unidades'} · {cart.length} {cart.length === 1 ? 'producto' : 'productos'}</p></div>
          <ol className="cart-steps" aria-label="Pasos de compra"><li aria-current="step"><span>1</span> Carrito</li><li><span>2</span> Datos</li><li><span>3</span> Confirmación</li></ol>
        </header>
        {undoNotice}
        {cartMessage && <p className="cart-inline-notice" role="status">{cartMessage}</p>}
        <div className="cart-container">
          <section className="cart-products" aria-label="Productos del carrito" aria-busy={checkingCart}>
            <div className="cart-list-heading"><h2>Tus productos</h2><button type="button" className="cart-text-button" onClick={handleClear} disabled={busy}>Vaciar carrito</button></div>
            <div className="cart-items">
              {cart.map((item) => (
                <article key={item.id} className="cart-item">
                  <Link to={`/producto/${item.id}`} className="cart-image-link" aria-label={`Ver ${item.title}`}>
                    <img src={item.image || '/product-placeholder.svg'} alt={item.title} className="cart-item-image" onError={(event) => { if (!event.currentTarget.src.endsWith('/product-placeholder.svg')) event.currentTarget.src = '/product-placeholder.svg'; }} />
                  </Link>
                  <div className="cart-item-info">
                    <span className="cart-category">{item.category}</span>
                    <h3><Link to={`/producto/${item.id}`}>{item.title}</Link></h3>
                    <p className="cart-unit-price">{formatPrice(item.price)} <span>/ unidad</span></p>
                    <p className={`cart-stock ${item.quantity >= item.stock ? 'cart-stock--limit' : ''}`}>{item.quantity >= item.stock ? 'Máximo disponible en tu carrito' : `${item.stock} unidades disponibles`}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-item-quantity">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={busy || item.quantity <= 1} aria-label={`Reducir cantidad de ${item.title}`} className="qty-btn">−</button>
                      <input type="number" inputMode="numeric" min="1" max={item.stock} step="1" disabled={busy} aria-label={`Cantidad de ${item.title}`} value={item.quantity} onChange={(event) => updateQuantity(item.id, Math.max(1, parseInt(event.target.value, 10) || 1))} className="qty-input" />
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={busy || item.quantity >= item.stock} aria-label={`Aumentar cantidad de ${item.title}`} className="qty-btn">+</button>
                    </div>
                    <button type="button" onClick={() => handleRemove(item)} disabled={busy} className="cart-remove" aria-label={`Quitar ${item.title}`}>Quitar</button>
                  </div>
                  <div className="cart-item-subtotal"><span>Total del producto</span>{formatPrice((item.numericPrice ?? parsePrice(item.price)) * item.quantity)}</div>
                </article>
              ))}
            </div>
            <div className="cart-shipping-incentive">
              <span aria-hidden="true">🚚</span><div><strong>{shippingCost === 0 ? '¡Tu envío es gratis!' : `Te faltan ${formatPrice(Math.max(0, 30000 - total))} para envío gratis`}</strong><p>{shippingCost === 0 ? 'El costo de despacho ya está descontado de tu resumen.' : 'En compras desde $30.000, el despacho va por nuestra cuenta.'}</p><progress max="30000" value={shippingCost === 0 ? 30000 : Math.min(total, 30000)} aria-label="Progreso para envío gratis" /></div>
            </div>
            <p className="cart-stock-note">Las cantidades se limitan al stock disponible. Comprobamos precios y existencias al continuar.</p>
          </section>
          <aside className="cart-summary" aria-label="Resumen de compra">
            <span className="cart-eyebrow">TODO CLARO, ANTES DE CONTINUAR</span>
            <h2>Resumen de compra</h2>
            <div className="summary-row"><span>Productos ({itemCount})</span><strong>{formatPrice(total)}</strong></div>
            {discountAmount > 0 && <div className="summary-row cart-discount"><span>Descuento · {appliedCoupon.code}</span><strong>−{formatPrice(discountAmount)}</strong></div>}
            <div className="summary-row"><span>Despacho</span><strong className={shippingCost === 0 ? 'cart-free-shipping' : ''}>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</strong></div>
            <div className="cart-coupon">
              <form onSubmit={(event) => { event.preventDefault(); handleApplyCoupon(); }}>
                <label htmlFor="cart-coupon">¿Tienes un cupón?</label>
                <div className="cart-coupon-input"><input id="cart-coupon" type="text" placeholder="Ej. PATAGON10" value={couponInput} disabled={busy} onChange={(event) => { setCouponInput(event.target.value.toUpperCase()); setCouponError(''); }} aria-invalid={Boolean(couponError)} aria-describedby={couponError ? 'cart-coupon-error' : undefined} /><button type="submit" disabled={busy || !couponInput.trim()}>{validatingCoupon ? 'Validando…' : 'Aplicar'}</button></div>
              </form>
              {couponError && <p id="cart-coupon-error" className="cart-coupon-error" role="alert">{couponError}</p>}
              {appliedCoupon && <div className={`cart-coupon-applied ${!couponEligible ? 'cart-coupon-applied--inactive' : ''}`} role="status"><span>{couponEligible ? '✓' : '!'} {appliedCoupon.code}{!couponEligible && ` · Mínimo ${formatPrice(appliedCoupon.min_purchase)}`}</span><button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(''); setCouponError(''); }} disabled={busy} aria-label={`Quitar cupón ${appliedCoupon.code}`}>Quitar</button></div>}
            </div>
            <div className="summary-row total"><span>Total</span><strong>{formatPrice(finalTotal)}</strong></div>
            <p className="cart-total-note">Valores en pesos chilenos · CLP</p>
            <button type="button" onClick={handleProceedToCheckout} disabled={busy} aria-busy={checkingCart} className="checkout-btn">{checkingCart ? 'Comprobando tu carrito…' : 'Continuar con mi compra →'}</button>
            <p className="cart-checkout-note">Podrás revisar tus datos antes de confirmar.</p>
            {DEMO_MODE && <p className="cart-demo-note"><strong>Compra de demostración</strong> No se realizan cobros ni envíos. Usa datos ficticios.</p>}
            <StorePurchaseInfo />
          </aside>
        </div>
      </main>
    </>
  );
}

import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import Navbar from '../components/Navbar';
import { formatPrice, parsePrice } from '../services/productsData';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();
  const total = getTotalPrice();

  const handleCheckoutSuccess = () => {
    clearCart();
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  if (cart.length === 0 && !showCheckout) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <h1>🛒 Mi Carrito</h1>
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
            <Link to="/" className="continue-shopping-btn">
              ← Explorar Productos
            </Link>
          </div>
        </div>
      </>
    );
  }

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
            onSuccess={handleCheckoutSuccess}
            onError={() => setShowCheckout(false)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <h1>🛒 Mi Carrito</h1>
        
        <div className="cart-container">
          <div className="cart-items">
            {cart.map((item) => {
              const itemPriceNum = item.numericPrice ?? parsePrice(item.price);
              const subtotal = itemPriceNum * (item.quantity || 1);

              return (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop'}
                    alt={item.title}
                    className="cart-item-image"
                    onError={(event) => {
                      event.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop';
                    }}
                  />
                  
                  <div className="cart-item-info">
                    <h3>{item.title}</h3>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                  </div>

                  <div className="cart-item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="qty-input"
                    />
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    {formatPrice(subtotal)}
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                    title="Eliminar producto"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Resumen del Pedido</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Envío:</span>
              <span>{total >= 30000 ? 'Gratis' : '$3.990'}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatPrice(total >= 30000 ? total : total + 3990)}</span>
            </div>

            <button 
              onClick={() => setShowCheckout(true)}
              className="checkout-btn"
            >
              💳 Proceder al Pago
            </button>

            <button 
              onClick={clearCart}
              className="clear-cart-btn"
            >
              Vaciar Carrito
            </button>

            <Link to="/" className="continue-shopping-link">
              ← Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

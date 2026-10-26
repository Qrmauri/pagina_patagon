import { useState } from 'react';
import { calculateCheckout, DEMO_MODE } from '../services/checkout';
import { api } from '../services/api';
import { parsePrice, formatPrice } from '../services/productsData';
import { useToast } from '../hooks/useToast';
import WebpayModal from './WebpayModal';
import StorePurchaseInfo from './StorePurchaseInfo';

export default function CheckoutForm({ cart, total, initialCoupon = null, onSuccess, onError }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('webpay'); // 'webpay' | 'transferencia'
  const [showWebpayModal, setShowWebpayModal] = useState(false);

  // Cupones de descuento
  const [couponCode, setCouponCode] = useState(initialCoupon ? initialCoupon.code : '');
  const [appliedCoupon, setAppliedCoupon] = useState(initialCoupon);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    postal_code: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cálculos financieros con cupones y despacho
  const { subtotal, shippingCost, discountAmount, finalTotal, couponEligible } = calculateCheckout(total, appliedCoupon);

  // Aplicar cupón de descuento
  const handleApplyCoupon = async (codeToTest) => {
    const code = String(codeToTest || couponCode).trim().toUpperCase();
    if (!code) {
      addToast('Por favor escribe un código de cupón', 'warning');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(code, subtotal, shippingCost);
      if (res.valid) {
        setAppliedCoupon(res);
        setCouponCode(res.code);
        addToast(res.message || `¡Cupón ${res.code} aplicado!`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Cupón inválido o expirado', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    addToast('Cupón removido', 'info');
  };

  // Validación de formulario
  const validateForm = () => {
    if (!cart.length) throw new Error('El carrito está vacío');
    if (appliedCoupon && !couponEligible) throw new Error('El carrito no cumple la compra mínima del cupón');
    if (
      !formData.customer_name.trim() ||
      !formData.customer_email.trim() ||
      !formData.customer_phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.postal_code.trim()
    ) {
      throw new Error('Por favor completa todos los campos del formulario');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customer_email)) {
      throw new Error('Ingresa un correo electrónico válido');
    }
  };

  // Creación de la orden en el Backend
  const submitOrder = async (paymentDetails = {}) => {
    setLoading(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        subtotal: subtotal,
        shipping: shippingCost,
        discount_amount: discountAmount,
        coupon_code: couponEligible ? appliedCoupon.code : null,
        total: finalTotal,
        payment_method: paymentDetails.method || paymentMethod,
        payment_authorization: paymentDetails.authorizationCode || null,
        status: 'pending',
        items_data: cart.map((item) => ({
          id: item.id,
          title: item.title,
          price: parsePrice(item.price),
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const response = DEMO_MODE
        ? { ...orderPayload, id: `DEMO-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending', demo: true }
        : await api.createOrder(orderPayload);

      addToast(
        DEMO_MODE ? 'Demostración completada. No se realizó ningún cobro.' : `Pedido #${response.id} registrado. Pago pendiente de confirmación.`,
        'success', 6000
      );

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error procesando pedido:', error);
      addToast(`Error: ${error.message}`, 'error', 5000);
      if (onError) onError(error);
    } finally {
      setLoading(false);
      setShowWebpayModal(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    try {
      validateForm();
      if (paymentMethod === 'webpay' && !DEMO_MODE) {
        throw new Error('El pago real con Webpay todavía no está integrado.');
      }
      if (paymentMethod === 'webpay') {
        setShowWebpayModal(true);
      } else {
        submitOrder({ method: 'transferencia' });
      }
    } catch (err) {
      addToast(err.message, 'warning');
    }
  };

  return (
    <div className="checkout-form-container">
      {/* Modal de Webpay Plus */}
      {showWebpayModal && (
        <WebpayModal
          orderAmount={finalTotal}
          customerName={formData.customer_name}
          customerEmail={formData.customer_email}
          onPaymentSuccess={(authData) => {
            submitOrder({
              method: 'webpay',
              authorizationCode: authData.authorizationCode,
            });
          }}
          onCancel={() => setShowWebpayModal(false)}
        />
      )}

<p className="demo-notice">{DEMO_MODE ? 'Demostración: utiliza datos ficticios. No se realizan cobros ni envíos.' : 'Pedido pendiente de confirmación de pago.'}</p>
      <h2>📋 Finalizar Compra</h2>
      <StorePurchaseInfo />
      <form onSubmit={handleFormSubmit} className="checkout-form">
        
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="form-section">
          <h3>1. Información de Contacto</h3>
          
          <div className="form-group">
            <label htmlFor="customer_name">Nombre y Apellido *</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Ej: Sofía Valenzuela"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_email">Correo Electrónico *</label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="sofia@ejemplo.cl"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_phone">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DIRECCIÓN */}
        <div className="form-section">
          <h3>2. Dirección de Despacho</h3>
          
          <div className="form-group">
            <label htmlFor="address">Dirección y Número *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Av. Manuel Bulnes 450, Depto 302"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Ciudad / Comuna *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Punta Arenas"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Código Postal *</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="6200000"
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: CUPONES DE DESCUENTO */}
        <div className="form-section" style={{ background: '#fdfbf7', border: '1px solid #eedec9', padding: '18px', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '8px' }}>🎟️ ¿Tienes un Cupón de Descuento?</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: '#7a746e', marginBottom: '12px' }}>
            Ingresa tu código promocional para obtener rebajas en tu pedido.
          </p>

          {appliedCoupon ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              <span>
                🎉 Cupón <strong>{appliedCoupon.code}</strong> aplicado: -{formatPrice(discountAmount)}
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#991b1b',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                ✕ Quitar
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Ej: PATAGON10"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: 'var(--text-sm)',
                    textTransform: 'uppercase',
                    fontWeight: 'var(--weight-semibold)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={validatingCoupon}
                  style={{
                    padding: '10px 18px',
                    background: 'var(--brand-teal-dark)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: 'var(--text-sm)',
                    cursor: validatingCoupon ? 'not-allowed' : 'pointer',
                  }}
                >
                  {validatingCoupon ? 'Validando...' : 'Aplicar'}
                </button>
              </div>

              {/* Sugerencias de cupones activos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: '#64748b' }}>Cupones disponibles:</span>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('PATAGON10')}
                  style={{ background: '#f1f5f9', border: '1px dashed #94a3b8', padding: '2px 8px', borderRadius: '4px', fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: 'var(--weight-semibold)' }}
                >
                  PATAGON10 (-10%)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('ENVIOGRATIS')}
                  style={{ background: '#f1f5f9', border: '1px dashed #94a3b8', padding: '2px 8px', borderRadius: '4px', fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: 'var(--weight-semibold)' }}
                >
                  ENVIOGRATIS
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon('BIENVENIDO5')}
                  style={{ background: '#f1f5f9', border: '1px dashed #94a3b8', padding: '2px 8px', borderRadius: '4px', fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: 'var(--weight-semibold)' }}
                >
                  BIENVENIDO5 (-$5.000)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 4: MÉTODO DE PAGO */}
        <div className="form-section">
          <h3>3. Método de Pago</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Opción 1: Webpay Plus */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: paymentMethod === 'webpay' ? '2px solid var(--brand-red-dark)' : '1px solid #cbd5e1',
                background: paymentMethod === 'webpay' ? '#fff1f2' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="webpay"
                checked={paymentMethod === 'webpay'}
                onChange={() => setPaymentMethod('webpay')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-red-dark)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: 'var(--text-base)', color: '#0f172a' }}>Pago de demostración</strong>
                  <span style={{ background: 'var(--brand-red-dark)', color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', padding: '2px 6px', borderRadius: '4px' }}>
                    RECOMENDADO
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: '#64748b', margin: '4px 0 0' }}>
                  Prueba una compra simulada sin ingresar datos bancarios.
                </p>
              </div>
              <span style={{ fontSize: 'var(--text-xl)' }}>💳</span>
            </label>

            {/* Opción 2: Transferencia Bancaria */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: paymentMethod === 'transferencia' ? '2px solid var(--brand-teal-dark)' : '1px solid #cbd5e1',
                background: paymentMethod === 'transferencia' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={paymentMethod === 'transferencia'}
                onChange={() => setPaymentMethod('transferencia')}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-teal-dark)' }}
              />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 'var(--text-base)', color: '#0f172a' }}>Transferencia Bancaria Directa</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: '#64748b', margin: '4px 0 0' }}>
                  Ejemplo de pedido con pago pendiente. No realices transferencias.
                </p>
              </div>
              <span style={{ fontSize: 'var(--text-xl)' }}>🏦</span>
            </label>
          </div>

          {/* Datos Bancarios si selecciona Transferencia */}
          {paymentMethod === 'transferencia' && (
            <div
              style={{
                marginTop: '16px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '16px',
                borderRadius: '12px',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-body)',
                color: '#334155',
              }}
            >
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '6px' }}>
                Transferencia de demostración:
              </strong>
              Esta maqueta no dispone de una cuenta para recibir pagos. No transfieras dinero: esta opción solo demuestra el registro de un pedido pendiente.
            </div>
          )}
        </div>

        {/* RESUMEN FINAL DEL COBRO */}
        <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--text-sm)', color: '#64748b' }}>
            <span>Subtotal ({cart.length} productos):</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: 'var(--text-sm)', color: 'var(--brand-teal-dark)', fontWeight: 'var(--weight-semibold)' }}>
              <span>Descuento Cupón ({appliedCoupon?.code}):</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--text-sm)', color: '#64748b' }}>
            <span>Envío a domicilio:</span>
            <span>{shippingCost === 0 ? '¡Gratis!' : formatPrice(shippingCost)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: '#0f172a' }}>
            <span>Total a Pagar:</span>
            <span style={{ color: 'var(--brand-teal-dark)' }}>{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL */}
        <button
          type="submit"
          className="submit-order-btn"
          disabled={loading}
          style={{
            background: paymentMethod === 'webpay' ? 'var(--brand-red-dark)' : 'var(--brand-teal-dark)',
            borderColor: paymentMethod === 'webpay' ? '#be123c' : '#1d4ed8',
            boxShadow: paymentMethod === 'webpay' ? '0 4px 14px rgba(225,29,72,0.3)' : '0 4px 14px rgba(37,99,235,0.3)',
          }}
        >
          {loading
            ? '⏳ Procesando pedido...'
            : paymentMethod === 'webpay'
            ? `💳 Simular pago de ${formatPrice(finalTotal)}`
            : `🏦 Confirmar Pedido (${formatPrice(finalTotal)})`}
        </button>
      </form>
    </div>
  );
}

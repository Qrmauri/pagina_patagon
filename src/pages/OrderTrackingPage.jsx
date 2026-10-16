import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderReceiptModal from '../components/OrderReceiptModal';
import { api } from '../services/api';
import { formatPrice } from '../services/productsData';
import { useStoreContact } from '../hooks/useStoreContact';

const STAGES = [
  { key: 'pending', title: 'Pedido Confirmado', icon: '📋', desc: 'Recibido en nuestro sistema' },
  { key: 'processing', title: 'En Preparación', icon: '⚙️', desc: 'Empacando tus productos' },
  { key: 'shipped', title: 'En Camino', icon: '🚚', desc: 'Despachado para entrega' },
  { key: 'delivered', title: 'Entregado', icon: '🏠', desc: 'Recibido en tu domicilio' },
];

function getStageIndex(status) {
  if (status === 'completed' || status === 'delivered') return 3;
  if (status === 'shipped') return 2;
  if (status === 'processing') return 1;
  return 0; // pending
}

export default function OrderTrackingPage() {
  const contact = useStoreContact();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchTracking = useCallback(async (idToSearch, emailToSearch) => {
    if (!idToSearch || !emailToSearch) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await api.trackOrder(idToSearch, emailToSearch);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'No pudimos encontrar el pedido solicitado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlId = searchParams.get('id');
    const urlEmail = searchParams.get('email');
    if (urlId && urlEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Mantiene el formulario sincronizado con los parámetros del historial.
      setOrderId(urlId);
      setEmail(urlEmail);
      fetchTracking(urlId, urlEmail);
    }
  }, [searchParams, fetchTracking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setSearchParams({ id: orderId.trim(), email: email.trim().toLowerCase() });
  };

  const isCancelled = order?.status === 'cancelled';
  const currentStage = order ? getStageIndex(order.status) : 0;

  return (
    <>
      <Navbar />

      {showReceipt && order && (
        <OrderReceiptModal order={order} onClose={() => setShowReceipt(false)} />
      )}

      <main className="container tracking-page" style={{ padding: '40px 20px 80px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: 'var(--text-4xl)', display: 'block', marginBottom: '8px' }}>🚚</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-page-title)', margin: '0 0 10px' }}>
            Rastreo de Pedidos
          </h1>
          <p style={{ color: '#7a746e', fontSize: 'var(--text-base)', maxWidth: '540px', margin: '0 auto' }}>
            Ingresa el número de tu pedido y el correo con el que realizaste la compra para conocer el estado de tu despacho en tiempo real.
          </p>
        </div>

        {/* Formulario de Consulta */}
        <form onSubmit={handleSubmit} style={{
          background: '#ffffff',
          padding: '24px 28px',
          borderRadius: '20px',
          boxShadow: '0 6px 24px rgba(28,26,24,0.08)',
          border: '1px solid #eedec9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
          gap: '14px',
          alignItems: 'end',
          marginBottom: '32px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '6px', color: '#1c1a18' }}>
              Número de Pedido
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ej: 15 o #15"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '6px', color: '#1c1a18' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.cl"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--brand-red-dark)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-bold)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
              height: '46px',
            }}
          >
            {loading ? '🔍 Buscando...' : 'Rastrear →'}
          </button>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '16px 20px',
            borderRadius: '14px',
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: 'var(--text-base)',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Resultado del Rastreo */}
        {order && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(28,26,24,0.09)',
            border: '1px solid #eedec9',
            overflow: 'hidden',
          }}>
            {/* Cabecera del pedido */}
            <div style={{
              background: 'var(--cream, #fdf6ee)',
              padding: '24px 30px',
              borderBottom: '1px solid #eedec9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}>
              <div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--brand-red-dark)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' }}>
                  Detalle del Despacho
                </span>
                <h2 style={{ fontSize: 'var(--text-lg)', margin: '4px 0 0', color: '#1c1a18' }}>
                  Pedido #{order.id}
                </h2>
                <div style={{ fontSize: 'var(--text-sm)', color: '#7a746e', marginTop: '4px' }}>
                  Comprador: <strong>{order.customer_name}</strong> · Destino: <strong>{order.city}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReceipt(true)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #d1d5db',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontWeight: 'var(--weight-bold)',
                  fontSize: 'var(--text-sm)',
                  color: '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}
              >
                📄 Ver resumen del pedido
              </button>
            </div>

            {/* Alerta de Cancelado */}
            {isCancelled ? (
              <div style={{
                background: '#fee2e2',
                padding: '24px',
                margin: '24px 30px',
                borderRadius: '16px',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 'var(--text-2xl)', display: 'block', marginBottom: '8px' }}>❌</span>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Este pedido ha sido cancelado</h3>
                <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)' }}>
                  Si tienes dudas o crees que se trata de un error, revisa los <Link to="/ayuda">canales de atención disponibles</Link>.
                </p>
              </div>
            ) : (
              /* Timeline Interactivo */
              <div style={{ padding: '36px 30px 24px' }}>
                <div className="tracking-timeline-container" style={{
                  display: 'grid',
                  gap: '12px',
                  position: 'relative',
                  marginBottom: '32px',
                }}>
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStage;
                    const isCurrent = idx === currentStage;

                    return (
                      <div key={stage.key} className="tracking-step" style={{
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}>
                        <div className="tracking-step-symbol" style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          background: isCompleted ? '#2c7a49' : '#f3f4f6',
                          color: isCompleted ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--text-lg)',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(44, 122, 73, 0.25)' : 'none',
                          transition: 'all 0.3s ease',
                        }}>
                          {isCompleted ? stage.icon : '○'}
                        </div>

                        <strong style={{
                          display: 'block',
                          fontSize: 'var(--text-sm)',
                          color: isCompleted ? '#1c1a18' : 'var(--text-muted)',
                          marginBottom: '4px',
                        }}>
                          {stage.title}
                        </strong>

                        <span style={{
                          fontSize: 'var(--text-sm)',
                          color: isCurrent ? '#2c7a49' : '#7a746e',
                          fontWeight: isCurrent ? 'var(--weight-bold)' : 'var(--weight-regular)',
                        }}>
                          {stage.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Banner de Estado Actual */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '24px',
                }}>
                  <span style={{ fontSize: 'var(--text-xl)' }}>⚡</span>
                  <div>
                    <strong style={{ color: '#166534', fontSize: 'var(--text-base)' }}>
                      Estado actual: {STAGES[currentStage]?.title}
                    </strong>
                    <div style={{ color: '#15803d', fontSize: 'var(--text-sm)', marginTop: '2px' }}>
                      Dirección de entrega: <strong>{order.address}, {order.city}</strong>. {contact.delivery}
                    </div>
                  </div>
                </div>

                {/* Resumen de Productos en el Paquete */}
                {order.items_data && order.items_data.length > 0 && (
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', color: '#374151', margin: '0 0 12px' }}>
                      Contenido del Paquete:
                    </h3>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {order.items_data.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#fafaf9',
                          borderRadius: '10px',
                          fontSize: 'var(--text-sm)',
                        }}>
                          <div>
                            <strong>{item.quantity}x</strong> {item.title}
                          </div>
                          <span style={{ color: 'var(--brand-red-dark)', fontWeight: 'var(--weight-bold)' }}>
                            {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>
                      Total Pedido: <span style={{ color: 'var(--brand-red-dark)', marginLeft: '8px' }}>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enlace de regreso */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/" style={{ color: '#7a746e', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}>
            ← Volver a la Tienda
          </Link>
        </div>
      </main>
    </>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: 'var(--text-base)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

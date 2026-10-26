import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

const STATUS_LABELS = {
  pending: 'Pedido recibido', processing: 'En preparación', shipped: 'En camino',
  delivered: 'Entregado', completed: 'Completado', cancelled: 'Cancelado',
};

export default function OrderTrackingPage() {
  const location = useLocation();
  const [initialCode] = useState(() => location.state?.trackingToken || new URLSearchParams(location.hash.slice(1)).get('token') || '');
  const [code, setCode] = useState(initialCode);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(initialCode));

  useEffect(() => {
    // Retirar enlaces privados y parámetros antiguos del historial de esta página.
    window.history.replaceState({ ...window.history.state, usr: null }, '', window.location.pathname);
    if (!initialCode) return;
    let active = true;
    api.trackOrder(initialCode).then(data => { if (active) setOrder(data); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try { setOrder(await api.trackOrder(code.trim())); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <>
    <Navbar />
    <main className="container tracking-page" style={{ maxWidth: 760, padding: '48px 20px 80px' }}>
      <h1>Seguimiento de tu pedido</h1>
      <p>Abre el enlace de tu correo o ingresa el código privado recibido al comprar. El código es válido durante 30 días; consérvalo en privado.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, margin: '28px 0' }}>
        <label htmlFor="tracking-code">Código privado de seguimiento</label>
        <input id="tracking-code" value={code} onChange={event => setCode(event.target.value)}
          type="password" autoComplete="off" spellCheck={false} required minLength={40} maxLength={64}
          style={{ width: '100%', padding: 12, border: '1px solid #7a746e', borderRadius: 10 }} />
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Consultando…' : 'Consultar pedido'}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <div aria-live="polite">
        {order && <section style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
          <h2>Pedido #{order.id}</h2>
          <p><strong>{STATUS_LABELS[order.status] || 'En revisión'}</strong></p>
          <p>Pago: {order.payment_status === 'paid' ? 'Confirmado' : 'Pendiente de confirmación'}</p>
        </section>}
      </div>
      <p>Si el enlace venció o necesitas revisar datos de tu compra, utiliza los <Link to="/ayuda">canales de atención de la tienda</Link>.</p>
      <Link to="/">Volver a la tienda</Link>
    </main>
  </>;
}

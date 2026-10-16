import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '../services/productsData';

export default function WebpayModal({ orderAmount, onPaymentSuccess, onCancel }) {
  const [processing, setProcessing] = useState(false);
  const dialogRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel();
      if (event.key === 'Tab') {
        const buttons = [...dialog.querySelectorAll('button:not(:disabled)')];
        if (!buttons.length) { event.preventDefault(); return; }
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener('keydown', onKey);
    return () => { clearTimeout(timerRef.current); dialog.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onCancel]);
  const simulate = () => {
    if (processing) return;
    setProcessing(true);
    timerRef.current = setTimeout(() => onPaymentSuccess({ authorizationCode: `DEMO-${Date.now()}`, bank: 'demo', cardType: 'demo', lastFour: '0000' }), 700);
  };
  return (
    <div className="demo-payment-backdrop">
      <div ref={dialogRef} tabIndex={-1} className="demo-payment" role="dialog" aria-modal="true" aria-labelledby="demo-payment-title" aria-describedby="demo-payment-description">
        <span className="section-kicker">Patagon Store · Demostración</span>
        <h2 id="demo-payment-title">Prueba el proceso de compra</h2>
        <p id="demo-payment-description">Este pago es simulado. No se conecta con bancos, no realiza cobros y no necesita datos de tarjeta.</p>
        <strong>Total de ejemplo: {formatPrice(orderAmount)}</strong>
        <div className="hero-actions">
          <button type="button" className="btn-primary" disabled={processing} onClick={simulate}>{processing ? 'Simulando…' : 'Completar simulación →'}</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Volver al carrito</button>
        </div>
      </div>
    </div>
  );
}

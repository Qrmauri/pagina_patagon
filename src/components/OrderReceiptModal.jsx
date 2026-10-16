import { formatPrice } from '../services/productsData';

export default function OrderReceiptModal({ order, onClose }) {
  if (!order) return null;

  const total = Number(order.total || 0);
  const shipping = Number(order.shipping ?? (total >= 30000 ? 0 : 3990));
  const subtotalNeto = Math.round(total / 1.19);
  const iva = total - subtotalNeto;
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('es-CL');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <style>{`
        .receipt-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(18, 16, 15, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
        }

        .receipt-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 640px;
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .receipt-sheet {
          padding: 36px 32px;
          color: #1f2937;
          font-family: var(--font-body);
          overflow-y: auto;
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 18px;
          margin-bottom: 18px;
        }

        .receipt-sii-box {
          border: 2px solid #dc2626;
          padding: 8px 16px;
          text-align: center;
          color: #dc2626;
          font-weight: var(--weight-bold);
          font-size: var(--text-sm);
          line-height: var(--leading-control);
          border-radius: 6px;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin: 18px 0;
          font-size: var(--text-sm);
        }

        .receipt-table th {
          background: #f3f4f6;
          padding: 8px 10px;
          text-align: left;
          font-weight: var(--weight-bold);
          color: #374151;
        }

        .receipt-table td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .receipt-actions {
          background: #f9fafb;
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }
          .receipt-modal-backdrop {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            background: none !important;
            padding: 0 !important;
            display: block !important;
          }
          .receipt-modal-card {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
          }
          .receipt-sheet, .receipt-sheet * {
            visibility: visible !important;
          }
          .receipt-actions {
            display: none !important;
          }
        }
      `}</style>

      <div className="receipt-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-sheet" id="printable-receipt">
          {/* Encabezado */}
          <div className="receipt-header">
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--brand-red-dark)' }}>
                PATAGON STORE
              </h2>
              <div style={{ fontSize: 'var(--text-sm)', color: '#6b7280' }}>
                Proyecto Patagon Store · Demostración<br />
                Librería, Juguetes y Electrónica<br />
                Sin validez tributaria · Sin cobro real<br />
                Datos comerciales ficticios
              </div>
            </div>

            <div className="receipt-sii-box">
              DOCUMENTO DE EJEMPLO<br />
              RESUMEN DE PEDIDO<br />
              N° {String(order.id).padStart(6, '0')}
            </div>
          </div>

          {/* Datos del Cliente y Despacho */}
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '14px 16px',
            fontSize: 'var(--text-sm)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <div><strong>Cliente:</strong> {order.customer_name}</div>
            <div><strong>Fecha:</strong> {formattedDate}</div>
            <div><strong>Email:</strong> {order.customer_email}</div>
            <div><strong>Teléfono:</strong> {order.customer_phone || 'No registrado'}</div>
            <div>
              <strong>Medio de Pago:</strong>{' '}
              {order.payment_method === 'transferencia' ? 'Transferencia pendiente' : 'Pago de demostración'}
              {order.payment_authorization && (
                <span style={{ fontSize: 'var(--text-sm)', color: '#6b7280', marginLeft: '6px' }}>
                  (Aut: {order.payment_authorization})
                </span>
              )}
            </div>
            {order.coupon_code && (
              <div>
                <strong>Cupón Aplicado:</strong> {order.coupon_code}
              </div>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Dirección de Entrega:</strong> {order.address}, {order.city} (CP: {order.postal_code || 'S/N'})
            </div>
          </div>

          {/* Tabla de Productos */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>Cant.</th>
                <th>Descripción del Producto</th>
                <th style={{ textAlign: 'right', width: '90px' }}>P. Unit.</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items_data && order.items_data.length > 0 ? (
                order.items_data.map((item, idx) => {
                  const qty = Number(item.quantity || 1);
                  const itemPrice = Number(item.price || 0);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'var(--weight-bold)' }}>{qty}</td>
                      <td>{item.title}</td>
                      <td style={{ textAlign: 'right' }}>{formatPrice(itemPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'var(--weight-bold)' }}>{formatPrice(itemPrice * qty)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>
                    Productos adquiridos en el pedido #{order.id}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totales y Desglose Fiscal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: '#6b7280', maxWidth: '300px', lineHeight: 'var(--leading-control)' }}>
              <div style={{ border: '1px dashed #d1d5db', padding: '8px 12px', borderRadius: '6px' }}>
                <strong>Timbre Electrónico S.I.I.</strong><br />
                Res. Ex. N° 80 de 2014 - Verifique documento en www.sii.cl<br />
                Despacho operado por: <em>Transportes Patagon Express</em>
              </div>
            </div>

            <div style={{ minWidth: '220px', marginLeft: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 'var(--text-sm)', color: '#4b5563' }}>
                <span>Subtotal Neto:</span>
                <span>{formatPrice(subtotalNeto)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 'var(--text-sm)', color: '#4b5563' }}>
                <span>I.V.A. (19%):</span>
                <span>{formatPrice(iva)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 'var(--text-sm)', color: 'var(--brand-teal-dark)', fontWeight: 'var(--weight-semibold)' }}>
                  <span>Descuento ({order.coupon_code || 'Cupón'}):</span>
                  <span>- {formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 'var(--text-sm)', color: '#4b5563' }}>
                <span>Costo Envío:</span>
                <span>{shipping === 0 ? 'Gratis ($0)' : formatPrice(shipping)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0 0',
                marginTop: '6px',
                borderTop: '2px solid #1f2937',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--weight-bold)',
                color: '#111827',
              }}>
                <span>TOTAL:</span>
                <span style={{ color: 'var(--brand-red-dark)' }}>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Acciones */}
        <div className="receipt-actions">
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#374151',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            ✕ Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '9px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--brand-red-dark)',
              color: '#ffffff',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(242, 100, 25, 0.3)',
            }}
          >
            🖨️ Imprimir resumen de demostración
          </button>
        </div>
      </div>
    </div>
  );
}

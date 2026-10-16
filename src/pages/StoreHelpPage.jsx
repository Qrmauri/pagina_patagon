import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../services/storeConfig';
import { useStoreContact } from '../hooks/useStoreContact';
import { DEMO_MODE } from '../services/checkout';

export default function StoreHelpPage() {
  const STORE_CONTACT = useStoreContact();
  return <><Navbar /><main className="container store-help">
    <span className="section-kicker">Información de la tienda</span>
    <h1>Contacto y condiciones de compra</h1>
    {DEMO_MODE && <p className="demo-notice">Esta tienda está en demostración. No se realizan cobros ni envíos. Utiliza datos ficticios.</p>}
    <div className="help-grid">
      <section><h2>Atención al cliente</h2><p>{STORE_CONTACT.hours}</p>
        {STORE_CONTACT.whatsapp ? <a className="btn-primary" href={whatsappLink('Hola, tengo una consulta sobre la tienda.', STORE_CONTACT)} target="_blank" rel="noreferrer">Consultar por WhatsApp</a> : <p>El WhatsApp comercial todavía no está disponible.</p>}
        {STORE_CONTACT.email ? <p><a href={`mailto:${STORE_CONTACT.email}`}>{STORE_CONTACT.email}</a></p> : <p>El correo de atención todavía no está disponible.</p>}
      </section>
      <section><h2>Despacho</h2><p>{STORE_CONTACT.delivery}</p><p>El carrito muestra el costo de envío antes de finalizar. En la demo se utiliza una tarifa de $3.990 y envío gratis desde $30.000.</p></section>
      <section><h2>Cambios y devoluciones</h2><p>{STORE_CONTACT.returns}</p></section>
      <section><h2>Retiro en tienda</h2><p>{STORE_CONTACT.pickup}</p></section>
      <section><h2>Pago y seguimiento</h2><p>{DEMO_MODE ? 'Los pagos del checkout son simulados.' : 'Los pedidos por transferencia permanecen pendientes hasta que la tienda confirma el abono. Webpay real todavía no está habilitado.'}</p><Link to="/seguimiento">Consultar un pedido</Link></section>
    </div><Link className="text-link" to="/">Volver al catálogo →</Link>
  </main></>;
}

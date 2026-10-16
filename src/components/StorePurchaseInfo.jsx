import { Link } from 'react-router-dom';
import { useStoreContact } from '../hooks/useStoreContact';
import { whatsappLink } from '../services/storeConfig';
import { DEMO_MODE } from '../services/checkout';

export default function StorePurchaseInfo() {
  const contact = useStoreContact();
  return <section className="store-purchase-info" aria-label="Antes de comprar">
    <h2>Antes de comprar</h2>
    {DEMO_MODE && <p className="store-purchase-demo">Modo demostración: no se realizan cobros ni entregas.</p>}
    <dl><div><dt>Despacho</dt><dd>{contact.delivery}</dd></div><div><dt>Retiro</dt><dd>{contact.pickup}</dd></div></dl>
    <Link to="/ayuda">Ver contacto, horarios y condiciones →</Link>
    {contact.whatsapp && <a href={whatsappLink('Hola, quiero consultar por un producto.', contact)} target="_blank" rel="noreferrer">Consultar por WhatsApp →</a>}
  </section>;
}

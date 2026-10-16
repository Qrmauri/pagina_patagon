import { ArrowRight, Heart, MagnifyingGlass, Plus, ShoppingBag } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import './StorefrontDetails.css';

const steps = [
  { icon: MagnifyingGlass, title: 'Encuentra tu idea', text: 'Explora las categorías y descubre los detalles de cada producto.' },
  { icon: Heart, title: 'Guarda lo que te inspira', text: 'Toca el corazón de un producto para volver a encontrarlo en Favoritos.' },
  { icon: ShoppingBag, title: 'Prepara tu carrito', text: 'Elige tus productos y revisa el total antes de continuar con tu pedido.' },
];

export default function StorefrontDetails() {
  return (
    <div className="storefront-details">
      <section className="idea-journey" aria-labelledby="idea-journey-title">
        <div className="idea-journey-heading">
          <span className="section-kicker">De la inspiración a tu carrito</span>
          <h2 id="idea-journey-title">Tu próxima idea empieza aquí.</h2>
          <p>Explora a tu ritmo. Hay mucho por descubrir.</p>
        </div>
        <ol className="idea-journey-steps">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <div className="idea-journey-marker"><Icon size={28} weight="duotone" aria-hidden="true" /><span>0{index + 1}</span></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <Link to="/favoritos" className="idea-journey-link">Ver mis favoritos <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className="storefront-faq" aria-labelledby="storefront-faq-title">
        <div className="storefront-faq-intro">
          <span className="section-kicker">Te acompañamos</span>
          <h2 id="storefront-faq-title">Antes de empezar,<br />resolvamos tus dudas.</h2>
          <p>Los pequeños detalles también importan al elegir.</p>
          <Link to="/ayuda">Visitar el centro de ayuda <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="storefront-faq-list">
          <details>
            <summary>¿Qué puedo encontrar en Patagon?<Plus size={20} aria-hidden="true" /></summary>
            <p>Reunimos librería, juguetes y electrónica: desde materiales para estudiar y crear hasta juegos y accesorios para tus proyectos. Explora cada categoría desde el menú.</p>
          </details>
          <details>
            <summary>¿Cómo guardo un producto para después?<Plus size={20} aria-hidden="true" /></summary>
            <p>Selecciona el corazón en la tarjeta de un producto. Puedes revisar tu selección en <Link to="/favoritos">Mis favoritos</Link> y agregarla al carrito cuando quieras.</p>
          </details>
          <details>
            <summary>¿Dónde reviso la entrega y las condiciones?<Plus size={20} aria-hidden="true" /></summary>
            <p>En <Link to="/ayuda">Ayuda y contacto</Link> encontrarás información sobre despacho, retiro y cambios. El carrito muestra el costo de envío antes de finalizar.</p>
          </details>
          <details>
            <summary>¿Cómo consulto el estado de mi pedido?<Plus size={20} aria-hidden="true" /></summary>
            <p>Abre <Link to="/seguimiento">Seguimiento de pedidos</Link> y utiliza los datos de tu pedido para consultar su estado.</p>
          </details>
        </div>
      </section>
    </div>
  );
}

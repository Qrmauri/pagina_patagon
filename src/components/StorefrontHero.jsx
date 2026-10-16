import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import BrandFootprint from './BrandFootprint';

export default function StorefrontHero() {
  return (
    <section className="storefront-hero" aria-labelledby="storefront-title">
      <div className="storefront-hero-copy">
        <BrandFootprint className="storefront-footprint" />
        <p className="storefront-eyebrow">Patagon Store <span className="storefront-signature">Un mundo de ideas</span></p>
        <h1 id="storefront-title">Ideas para<br /><span className="storefront-title-accent">crear</span> y jugar.</h1>
        <p className="storefront-description">Del primer cuaderno a tu próximo proyecto. Librería, juguetes y electrónica para aprender y disfrutar cada día.</p>
        <div className="storefront-hero-actions">
          <a href="#productos" className="btn-primary storefront-cta">Explorar productos <ArrowRight size={22} aria-hidden="true" /></a>
          <Link to="/libreria" className="storefront-library-link">Descubrir Librería <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <ul className="storefront-hero-lines" aria-label="Líneas de Librería">
          <li>Escolar</li><li>Oficina</li><li>Manualidades</li><li>Libros</li>
        </ul>
      </div>
      <figure className="storefront-hero-image">
        <img src="/brand/storefront-hero.webp" alt="Ilustración de una fachada turquesa de Patagon Store con libros y juguetes en sus vitrinas" width="1751" height="898" fetchPriority="high" />
        <div className="storefront-hero-seal" aria-hidden="true"><Sparkle size={24} weight="duotone" /><span>Pequeñas cosas.<br /><strong>Grandes ideas.</strong></span></div>
        <figcaption>Ilustración conceptual</figcaption>
      </figure>
    </section>
  );
}

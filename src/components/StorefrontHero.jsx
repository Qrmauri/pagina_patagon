import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import BrandFootprint from './BrandFootprint';
import HeroPhotoCarousel from './HeroPhotoCarousel';
import { PencilStroke } from './BrandDoodles';

export default function StorefrontHero() {
  return (
    <section className="storefront-hero" aria-labelledby="storefront-title">
      <div className="storefront-hero-copy">
        <BrandFootprint className="storefront-footprint" />
        <p className="storefront-eyebrow">Patagon Store <span className="storefront-signature">Un mundo de ideas</span></p>
        <h1 id="storefront-title">Ideas para<br /><span className="storefront-title-accent">crear<PencilStroke /></span> y jugar.</h1>
        <p className="storefront-description">Del primer cuaderno a tu próximo proyecto. Librería, juguetes y electrónica para aprender y disfrutar cada día.</p>
        <div className="storefront-hero-actions">
          <a href="#productos" className="btn-primary storefront-cta">Explorar productos <ArrowRight size={22} aria-hidden="true" /></a>
          <Link to="/libreria" className="storefront-library-link">Descubrir Librería <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <ul className="storefront-hero-lines" aria-label="Líneas de Librería">
          <li>Escolar</li><li>Oficina</li><li>Manualidades</li><li>Libros</li>
        </ul>
      </div>
      <HeroPhotoCarousel />
    </section>
  );
}

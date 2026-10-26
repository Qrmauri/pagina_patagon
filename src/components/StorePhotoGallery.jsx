import BrandText from './BrandText';
import { ArrowUpRight, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import './StorePhotoGallery.css';

const photos = [
  { name: 'interior', title: 'Un mundo por descubrir', detail: 'Una mirada al interior de Patagon.', alt: 'Interior de Patagon Store con mostrador, útiles de librería y estantes de accesorios', width: 1600, height: 1200 },
  { name: 'fachada', title: 'Nuestra fachada', detail: 'El turquesa que nos identifica.', alt: 'Fachada turquesa de Patagon Store con su letrero de colores y vitrinas', width: 1600, height: 2133 },
  { name: 'libreria', title: 'Para estudiar y crear', detail: 'Librería y materiales para tus ideas.', alt: 'Estantes de librería con papelería, materiales y artículos de escritorio', width: 1600, height: 2133 },
  { name: 'instrumentos', title: 'También hay música', detail: 'Un rincón con instrumentos.', alt: 'Guitarras y ukeleles expuestos en el sector de instrumentos de Patagon', width: 1600, height: 1200 },
  { name: 'accesorios', title: 'Detalles para tu día', detail: 'Accesorios y tecnología en el local.', alt: 'Exhibidor de fundas y accesorios para teléfonos dentro de la tienda', width: 1600, height: 2133 },
];

export default function StorePhotoGallery() {
  return <section id="conoce-patagon" className="store-photos" aria-labelledby="store-photos-title">
    <div className="store-photos-heading">
      <div><span className="section-kicker">Así es Patagon</span><h2 id="store-photos-title"><BrandText text="Detrás de cada idea, una tienda real." /></h2></div>
      <p>Conoce nuestros espacios, colores y rincones. Estas son fotografías del local.</p>
    </div>
    <div className="store-photos-grid">
      {photos.map((photo, index) => <figure key={photo.name} className={`store-photo store-photo--${photo.name}${index === 0 ? ' store-photo--main' : ''}`}>
        <a href={`/brand/store/${photo.name}-1600.webp`} target="_blank" rel="noopener noreferrer" aria-label={`Ampliar: ${photo.title}. Abre la fotografía en otra pestaña.`}>
          <img src={`/brand/store/${photo.name}-960.webp`} srcSet={`/brand/store/${photo.name}-640.webp 640w, /brand/store/${photo.name}-960.webp 960w, /brand/store/${photo.name}-1600.webp 1600w`} sizes={index === 0 ? '(max-width: 1024px) calc(100vw - 32px), 50vw' : '(max-width: 1024px) calc(50vw - 24px), 25vw'} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
          <span className="store-photo-expand" aria-hidden="true"><ArrowUpRight size={20} /></span>
        </a>
        <figcaption><h3><BrandText text={photo.title} /></h3><p>{photo.detail}</p></figcaption>
      </figure>)}
    </div>
    <div className="store-photos-note"><p>Abre una foto para verla completa. Consulta el catálogo para conocer los productos publicados y su disponibilidad.</p><Link to="/ayuda">Contacto e información de la tienda <ArrowRight size={18} aria-hidden="true" /></Link></div>
  </section>;
}

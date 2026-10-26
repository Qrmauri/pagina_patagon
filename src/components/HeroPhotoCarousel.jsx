import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { CaretLeft, CaretRight, Pause, Play, Sparkle } from '@phosphor-icons/react';
import { carouselReducer, swipeDirection } from '../services/heroCarousel';
import './HeroPhotoCarousel.css';

const slides = [
  { name: 'fachada', title: 'Nuestra fachada', alt: 'Fachada real de Patagon Store, con revestimiento turquesa, letrero de colores y vitrinas', height: 2133, position: '50% 40%' },
  { name: 'interior', title: 'Dentro de Patagon', alt: 'Interior de Patagon con mostrador, estantes y materiales de librería', height: 1200, position: '50% 55%' },
  { name: 'libreria', title: 'Librería y materiales', alt: 'Pasillo de librería con papelería y artículos de escritorio', height: 2133, position: '50% 45%' },
  { name: 'instrumentos', title: 'Un rincón musical', alt: 'Guitarras y ukeleles en el sector de instrumentos de Patagon', height: 1200, position: '50% 50%' },
  { name: 'accesorios', title: 'Accesorios y tecnología', alt: 'Exhibidor con fundas y accesorios para teléfonos', height: 2133, position: '50% 45%' },
];
const motionQuery = '(prefers-reduced-motion: reduce)';
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
function subscribeMotion(notify) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const visibilitySnapshot = () => document.hidden;
function subscribeVisibility(notify) {
  document.addEventListener('visibilitychange', notify);
  return () => document.removeEventListener('visibilitychange', notify);
}

export default function HeroPhotoCarousel() {
  const [state, dispatch] = useReducer(carouselReducer, { index: 0, playing: true, count: slides.length });
  const [hovered, setHovered] = useState(false);
  const start = useRef(null);
  const reduced = useSyncExternalStore(subscribeMotion, reducedSnapshot, () => true);
  const hidden = useSyncExternalStore(subscribeVisibility, visibilitySnapshot, () => true);
  const rotating = state.playing && !hovered && !reduced && !hidden;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 6500);
    return () => window.clearInterval(timer);
  }, [rotating]);

  const keyboard = event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      dispatch({ type: event.key === 'ArrowLeft' ? 'previous' : 'next' });
    }
  };
  const pointerDown = event => {
    if (event.pointerType === 'mouse' || !event.isPrimary) return;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp = event => {
    if (!start.current) return;
    const direction = swipeDirection(start.current, { x: event.clientX, y: event.clientY });
    start.current = null;
    if (direction) dispatch({ type: direction });
  };

  return <figure className="storefront-hero-image storefront-hero-image--real hero-photo-carousel" role="region" aria-roledescription="carrusel" aria-label="Fotografías de Patagon Store" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={event => { if (!event.target.closest('[data-rotation-control]')) dispatch({ type: 'pause' }); }} onKeyDown={keyboard}>
    <div className="hero-photo-viewport" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { start.current = null; }}>
      <div className="hero-photo-track" style={{ transform: `translateX(-${state.index * 100}%)` }}>
        {slides.map((slide, index) => <div key={slide.name} className="hero-photo-slide" role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de ${slides.length}: ${slide.title}`} aria-hidden={state.index !== index}>
          <img src={`/brand/store/${slide.name}-1600.webp`} srcSet={`/brand/store/${slide.name}-640.webp 640w, /brand/store/${slide.name}-960.webp 960w, /brand/store/${slide.name}-1600.webp 1600w`} sizes="(max-width: 768px) 100vw, 62vw" alt={slide.alt} width="1600" height={slide.height} fetchPriority={index === 0 ? 'high' : 'low'} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" style={{ objectPosition: slide.position }} />
        </div>)}
      </div>
    </div>
    <div className="storefront-hero-seal" aria-hidden="true"><Sparkle size={24} weight="duotone" /><span>Pequeñas cosas.<br /><strong>Grandes ideas.</strong></span></div>
    <button type="button" className="hero-photo-arrow hero-photo-arrow--previous" aria-label="Ver foto anterior" onClick={() => dispatch({ type: 'previous' })}><CaretLeft size={24} aria-hidden="true" /></button>
    <button type="button" className="hero-photo-arrow hero-photo-arrow--next" aria-label="Ver foto siguiente" onClick={() => dispatch({ type: 'next' })}><CaretRight size={24} aria-hidden="true" /></button>
    <div className="hero-photo-controls">
      <span className="hero-photo-status" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">{state.index + 1} / {slides.length}<span> · {slides[state.index].title}</span></span>
      <div className="hero-photo-dots" role="group" aria-label="Elegir fotografía">{slides.map((slide, index) => <button key={slide.name} type="button" aria-label={`Ver foto ${index + 1}: ${slide.title}`} aria-pressed={state.index === index} onClick={() => dispatch({ type: 'select', index })}><span /></button>)}</div>
      {!reduced && <button type="button" data-rotation-control="true" className="hero-photo-play" aria-label={state.playing ? 'Pausar cambio automático de fotos' : 'Reproducir fotos automáticamente'} onClick={() => dispatch({ type: 'toggle' })}>{state.playing ? <Pause size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}</button>}
    </div>
    <figcaption><a href="#conoce-patagon">Conoce nuestra tienda →</a></figcaption>
  </figure>;
}

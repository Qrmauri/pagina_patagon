import { ArrowRight, PencilSimple, Lightning, PuzzlePiece } from '@phosphor-icons/react';
import BrandFootprint from './BrandFootprint';

export default function PatagonStory() {
  return <section id="nuestra-historia" className="patagon-story" aria-labelledby="patagon-story-title">
    <div className="patagon-story-copy">
      <span className="section-kicker"><BrandFootprint className="brand-kicker-mark" /> Una tienda con huella propia</span>
      <h2 id="patagon-story-title">Las buenas ideas<br />dejan huella.</h2>
      <p>Patagon también se descubre en sus rincones: la fachada turquesa, los estantes de papelería, las guitarras y los accesorios. Las fotografías de esta página muestran esos espacios del local.</p>
      <p>Aquí reunimos librería, juguetes y electrónica para estudiar, crear y disfrutar. El color y la huella de nuestro letrero acompañan ese recorrido, desde la entrada de la tienda hasta esta página.</p>
      <a href="#conoce-patagon" className="patagon-story-link">Recorre nuestra tienda <ArrowRight size={20} aria-hidden="true" /></a>
    </div>
    <div className="patagon-story-art" aria-hidden="true">
      <span className="patagon-story-stamp">Patagon</span>
      <BrandFootprint className="patagon-story-footprint" />
      <span className="patagon-story-token patagon-story-token--pencil"><PencilSimple size={36} weight="duotone" /></span>
      <span className="patagon-story-token patagon-story-token--puzzle"><PuzzlePiece size={36} weight="duotone" /></span>
      <span className="patagon-story-token patagon-story-token--spark"><Lightning size={32} weight="fill" /></span>
      <span className="patagon-story-caption">Crear. Aprender. Jugar.</span>
    </div>
  </section>;
}

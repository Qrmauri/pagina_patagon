import { Link } from 'react-router-dom';
import { ArrowRight, PencilSimple, Lightning, PuzzlePiece } from '@phosphor-icons/react';
import BrandFootprint from './BrandFootprint';

export default function PatagonStory() {
  return <section className="patagon-story" aria-labelledby="patagon-story-title">
    <div className="patagon-story-copy">
      <span className="section-kicker">El espíritu Patagon</span>
      <h2 id="patagon-story-title">Las buenas ideas<br />dejan huella.</h2>
      <p>Un cuaderno que empieza, un juego que inspira, una herramienta que ayuda. En Patagon reunimos librería, juguetes y electrónica para acompañar tus ideas de cada día.</p>
      <Link to="/libreria" className="patagon-story-link">Encuentra tu próxima idea <ArrowRight size={20} aria-hidden="true" /></Link>
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

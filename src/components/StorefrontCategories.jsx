import { Link } from 'react-router-dom';
import { CaretRight, PencilSimple, PuzzlePiece, Lightning } from '@phosphor-icons/react';
import BrandText from './BrandText';

const categories = [
  { title: 'Librería', description: 'Para estudiar, trabajar y crear', path: '/libreria', accent: 'gold', icon: PencilSimple },
  { title: 'Juguetes', description: 'Diversión para todas las edades', path: '/juguetes', accent: 'red', icon: PuzzlePiece },
  { title: 'Electrónica', description: 'Tecnología para tu día a día', path: '/electronica', accent: 'teal', icon: Lightning },
];

export default function StorefrontCategories() {
  return <section id="categorias" className="storefront-categories" aria-label="Explora las categorías">
    {categories.map(({ icon: Icon, ...category }) => <Link to={category.path} key={category.path} className={`storefront-category storefront-category--${category.accent}`}>
      <span className="storefront-category-icon" aria-hidden="true"><Icon size={38} weight="duotone" /></span>
      <span><strong><BrandText text={category.title} /></strong><small>{category.description}</small></span>
      <CaretRight size={22} aria-hidden="true" />
    </Link>)}
  </section>;
}

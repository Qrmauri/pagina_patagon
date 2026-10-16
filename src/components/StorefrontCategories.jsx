import { Link } from 'react-router-dom';
import { CaretRight, PencilSimple } from '@phosphor-icons/react';

const categories = [
  { title: 'Librería', description: 'Para estudiar, trabajar y crear', path: '/libreria', accent: 'gold' },
  { title: 'Juguetes', description: 'Diversión para todas las edades', path: '/juguetes', image: '/products/illustrations/peluche-clasico.webp' },
  { title: 'Electrónica', description: 'Tecnología para tu día a día', path: '/electronica', image: '/products/illustrations/audifonos-premium.webp' },
];

export default function StorefrontCategories() {
  return <section id="categorias" className="storefront-categories" aria-label="Explora las categorías">
    {categories.map(category => <Link to={category.path} key={category.path} className={`storefront-category storefront-category--${category.accent || (category.path === '/juguetes' ? 'red' : 'teal')}`}>
      {category.image ? <img src={category.image} width="66" height="66" alt="" /> : <span className="storefront-stationery-icon" aria-hidden="true"><PencilSimple size={38} weight="duotone" /></span>}
      <span><strong>{category.title}</strong><small>{category.description}</small></span>
      <CaretRight size={22} aria-hidden="true" />
    </Link>)}
  </section>;
}

import BrandText from './BrandText';
import { Link } from 'react-router-dom';
import { Backpack, Briefcase, Palette, Gift, ArrowRight } from '@phosphor-icons/react';
import BrandFootprint from './BrandFootprint';
import { SHOPPING_NEEDS } from '../services/shoppingNeeds';
import './ShoppingNeeds.css';

const icons = { escolar: Backpack, oficina: Briefcase, crear: Palette, regalos: Gift };

export default function ShoppingNeeds() {
  return <section className="shopping-needs" aria-labelledby="shopping-needs-title">
    <div className="shopping-needs-heading">
      <div><span className="section-kicker">Una idea, un comienzo</span><h2 id="shopping-needs-title"><BrandText text="¿Qué tienes en mente?" /></h2></div>
      <p>Encuentra lo que necesitas para estudiar, trabajar, crear o sorprender.</p>
    </div>
    <div className="shopping-needs-grid">
      {SHOPPING_NEEDS.map(need => {
        const Icon = icons[need.id];
        return <Link key={need.id} to={need.id === 'escolar' ? '/lista-escolar' : `${need.path}?necesidad=${need.id}`} className={`shopping-need shopping-need--${need.color}`}>
          <BrandFootprint className="shopping-need-footprint" />
          <span className="shopping-need-icon"><Icon size={32} weight="duotone" aria-hidden="true" /></span>
          <h3>{need.title}</h3><p>{need.description}</p>
          <span className="shopping-need-action">{need.id === 'escolar' ? 'Armar lista escolar' : 'Explorar'} <ArrowRight size={20} aria-hidden="true" /></span>
        </Link>;
      })}
    </div>
    <div className="shopping-needs-signature" aria-hidden="true"><i /><i /><i /><span>Ideas que dejan huella.</span></div>
  </section>;
}

import BrandFootprint from './BrandFootprint';
import './BrandDoodles.css';

export function PencilStroke({ className = '' }) {
  return <svg className={`brand-pencil-stroke ${className}`} viewBox="0 0 180 40" fill="none" aria-hidden="true" focusable="false">
    <path d="M8 23C39 12 105 10 170 16M14 28C53 20 116 19 163 21" />
    <path d="M29 33C72 26 115 27 145 28" />
  </svg>;
}

export default function BrandDoodles() {
  return <div className="brand-doodle-divider" aria-hidden="true">
    <PencilStroke />
    <div className="brand-doodle-trail">
      <BrandFootprint /><BrandFootprint /><BrandFootprint />
    </div>
    <PencilStroke />
  </div>;
}

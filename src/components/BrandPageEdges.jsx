import BrandFootprint from './BrandFootprint';
import './BrandPageEdges.css';

function PencilMarks() {
  return <svg className="brand-edge-pencil" viewBox="0 0 60 48" fill="none" focusable="false">
    <path d="M8 16C21 11 34 13 50 8M11 24C24 19 35 22 48 16" />
    <path d="M15 36C26 31 33 32 44 28" />
  </svg>;
}

export default function BrandPageEdges() {
  return <div className="brand-page-edges" aria-hidden="true">
    <div className="brand-edge-column brand-edge-column--left">
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--teal" />
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--gold" />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--red" />
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--teal" />
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--gold" />
    </div>
    <div className="brand-edge-column brand-edge-column--right">
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--red" />
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--gold" />
      <PencilMarks />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--teal" />
      <BrandFootprint className="brand-edge-footprint brand-edge-footprint--red" />
      <PencilMarks />
    </div>
  </div>;
}

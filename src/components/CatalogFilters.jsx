export default function CatalogFilters({ filters, onChange }) {
  const set = (name, value) => onChange({ ...filters, [name]: value });
  return <div className="catalog-filters">
    <label>Buscar<input type="search" value={filters.search} onChange={e => set('search', e.target.value)} placeholder="Nombre o característica" /></label>
    <label>Precio mínimo<input type="number" min="0" step="1" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} placeholder="Sin mínimo" /></label>
    <label>Precio máximo<input type="number" min="0" step="1" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} placeholder="Sin máximo" /></label>
    <label>Ordenar<select value={filters.sort} onChange={e => set('sort', e.target.value)}><option value="default">Catálogo</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="title-asc">Nombre A–Z</option></select></label>
    <label className="availability-filter"><input type="checkbox" checked={filters.available} onChange={e => set('available', e.target.checked)} /> Solo disponibles</label>
    <button type="button" className="btn-secondary" onClick={() => onChange({ search: '', minPrice: '', maxPrice: '', sort: 'default', available: false })}>Limpiar filtros</button>
  </div>;
}

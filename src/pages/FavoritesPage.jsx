import BrandFootprint from '../components/BrandFootprint';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { useFavorites } from '../hooks/useFavorites';
import { useProducts } from '../hooks/useProducts';

export default function FavoritesPage() {
  const { ids } = useFavorites();
  const { products, loading } = useProducts();
  const [preview, setPreview] = useState(null);
  const saved = products.filter(product => ids.includes(String(product.id)));
  return <><Navbar /><main className="container store-help favorites-page">
    <span className="section-kicker">Tus ideas para después</span><h1>Mis favoritos</h1>
    <p>Guarda lo que te gusta y vuelve cuando quieras. Esta lista se conserva en este navegador.</p>
    <p role="status">{saved.length} {saved.length === 1 ? 'producto guardado' : 'productos guardados'}</p>
    {loading && <p role="status">Actualizando el catálogo…</p>}
    {saved.length ? <div className="products-grid">{saved.map(product => <ProductCard key={product.id} product={product} onQuickView={setPreview} />)}</div> : <div className="empty-results"><BrandFootprint className="brand-empty-mark" /><strong>Tu próxima idea te espera</strong><p>Usa el corazón de un producto para guardarlo aquí. Los artículos retirados del catálogo no se muestran.</p><Link to="/#productos" className="btn-primary">Explorar productos</Link></div>}
    <QuickViewModal product={preview} onClose={() => setPreview(null)} />
  </main></>;
}

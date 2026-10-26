import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Backpack, Check, ShoppingCart } from '@phosphor-icons/react';
import Navbar from '../components/Navbar';
import BrandText from '../components/BrandText';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../services/productsData';
import { schoolListRows } from '../services/schoolList';
import './SchoolListPage.css';

export default function SchoolListPage() {
  const { products, loading, refreshProducts } = useProducts();
  const { cart, addToCart, openDrawer } = useCart();
  const { addToast } = useToast();
  const [selection, setSelection] = useState({});
  const rows = schoolListRows(products, cart, selection);
  const selected = rows.filter(row => row.quantity > 0);
  const units = selected.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = selected.reduce((sum, row) => sum + row.total, 0);
  const setQuantity = (id, value) => setSelection(previous => ({ ...previous, [id]: value }));

  const addList = () => {
    let added = 0;
    for (const row of selected) added += addToCart(row.product, row.quantity, false);
    if (!added) return;
    setSelection({});
    addToast(`Agregamos ${added} ${added === 1 ? 'unidad' : 'unidades'} de tu lista escolar al carrito.`, 'success');
    openDrawer();
  };

  return <>
    <Navbar />
    <main className="container school-list-page">
      <nav className="school-breadcrumb" aria-label="Ruta de navegación"><Link to="/">Inicio</Link><span aria-hidden="true">/</span><Link to="/libreria">Librería</Link><span aria-hidden="true">/</span><span aria-current="page">Lista escolar</span></nav>
      <header className="school-list-header">
        <div><span className="section-kicker">Un nuevo comienzo</span><h1><BrandText text="Arma tu lista escolar" /></h1><p>Tu lista del colegio, a tu ritmo. Marca los útiles que necesitas, elige las cantidades y agrégalos juntos al carrito.</p><span className="school-list-note">Selección del catálogo actual. Revisa los materiales que solicita tu colegio.</span></div>
        <Backpack size={100} weight="duotone" aria-hidden="true" />
      </header>

      {loading && !rows.length ? <p role="status">Cargando útiles escolares…</p> : !rows.length ? <section className="school-empty"><h2>Aún no hay útiles escolares publicados</h2><p>Cuando se agreguen al catálogo, podrás armar tu lista aquí.</p><button type="button" className="btn-primary" onClick={() => refreshProducts()}>Volver a consultar</button><Link to="/libreria">Explorar Librería →</Link></section> :
        <div className="school-list-layout">
          <section aria-labelledby="school-products-title">
            <div className="school-list-toolbar"><h2 id="school-products-title">Elige tus útiles</h2><button type="button" onClick={() => setSelection(Object.fromEntries(rows.map(row => [row.product.id, row.remaining ? 1 : 0])))}>Seleccionar disponibles</button><button type="button" disabled={!selected.length} onClick={() => setSelection({})}>Limpiar selección</button></div>
            <ul className="school-products">
              {rows.map(({ product, remaining, quantity, total }) => <li key={product.id} className={`school-product ${quantity ? 'is-selected' : ''}`}>
                <input type="checkbox" aria-label={`Seleccionar ${product.title}`} checked={quantity > 0} disabled={!remaining} onChange={event => setQuantity(product.id, event.target.checked ? 1 : 0)} />
                <img src={product.image || '/product-placeholder.svg'} alt="" width="72" height="72" loading="lazy" />
                <div className="school-product-copy"><Link to={`/producto/${product.id}`}>{product.title}</Link><span>{formatPrice(product.price)} por unidad</span><small>{remaining ? `${remaining} disponibles para agregar` : Number(product.stock) > 0 ? 'Stock máximo en tu carrito' : 'Agotado'}</small></div>
                <label className="school-quantity">Cantidad<input type="number" min="1" max={remaining || 1} step="1" value={quantity || 1} disabled={!quantity} aria-label={`Cantidad de ${product.title}`} onChange={event => {
                  const value = Number(event.target.value);
                  setQuantity(product.id, Math.min(remaining, Math.max(1, Math.floor(value) || 1)));
                }} /></label>
                <strong className="school-line-total">{formatPrice(total)}</strong>
              </li>)}
            </ul>
          </section>
          <aside className="school-summary" aria-labelledby="school-summary-title">
            <span className="school-summary-icon"><Check size={28} weight="bold" aria-hidden="true" /></span>
            <h2 id="school-summary-title">Tu mochila empieza aquí</h2>
            <div aria-live="polite" aria-atomic="true"><p>{selected.length} {selected.length === 1 ? 'producto seleccionado' : 'productos seleccionados'} · {units} {units === 1 ? 'unidad' : 'unidades'}</p><div className="school-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div></div>
            <p className="school-summary-note">Solo esta selección. El envío y los descuentos se calculan en el carrito.</p>
            <button type="button" className="btn-primary" disabled={!selected.length} onClick={addList}><ShoppingCart size={22} aria-hidden="true" /> Agregar lista al carrito</button>
            <Link to="/carrito">Revisar mi carrito →</Link>
            <small>Las cantidades respetan el stock y lo que ya tienes en el carrito.</small>
          </aside>
        </div>}
      <Link className="school-back" to="/libreria">← Seguir explorando Librería</Link>
    </main>
  </>;
}

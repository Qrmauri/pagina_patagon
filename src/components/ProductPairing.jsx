import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatPrice } from '../services/productsData';

export default function ProductPairing({ products }) {
  const { cart, addToCart } = useCart();
  const { addToast } = useToast();
  const toy = products.find(p => p.category === 'juguetes' && Number(p.stock) > 0);
  const book = products.find(p => p.category === 'libros' && Number(p.stock) > 0);
  if (!toy || !book) return null;
  const pair = [toy, book];
  const canAdd = pair.every(p => Number(p.stock) > (cart.find(i => i.id === p.id)?.quantity || 0));
  const addPair = () => {
    if (!canAdd) return;
    addToCart(toy, 1, false);
    addToCart(book, 1, true);
    addToast('Agregamos los dos productos. Revisa el total y el envío en el carrito.', 'success');
  };
  return <section className="product-pairing"><div><span className="section-kicker">Ideas para regalar</span><h2>Para aprender y jugar</h2><p>Combina dos productos del catálogo. Se venden a su precio habitual.</p>
    <div className="pair-items">{pair.map(p => <Link key={p.id} to={`/producto/${p.id}`}><img src={p.image || '/product-placeholder.svg'} alt={p.title} loading="lazy" width="100" height="100" /><span>{p.title}<strong>{formatPrice(p.price)}</strong></span></Link>)}</div>
  </div><div><strong className="pair-total">{formatPrice(Number(toy.price) + Number(book.price))}</strong><small>Productos · envío calculado en el carrito</small><button className="btn-primary" type="button" disabled={!canAdd} onClick={addPair}>{canAdd ? 'Agregar ambos al carrito' : 'Cantidad máxima en el carrito'}</button></div></section>;
}

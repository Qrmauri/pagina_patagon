import { filterByNeed } from './shoppingNeeds.js';
import { availableStock } from './cart.js';
import { parsePrice } from './productsData.js';

export function schoolListRows(products, cart, selection) {
  return filterByNeed(products, 'escolar').map(product => {
    const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
    const remaining = Math.max(0, availableStock(product) - inCart);
    const requested = Number(selection[product.id]);
    const quantity = Number.isFinite(requested) ? Math.min(remaining, Math.max(0, Math.floor(requested))) : 0;
    return { product, remaining, quantity, total: quantity * parsePrice(product.price) };
  });
}

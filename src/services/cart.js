import { parsePrice } from './productsData.js';

export function availableStock(product) {
  return Math.max(0, Math.floor(Number(product?.stock) || 0));
}

function quantityWithinStock(product, quantity) {
  return Math.min(availableStock(product), Math.max(1, Math.floor(Number(quantity) || 1)));
}

export function addCartItem(cart, product, quantity = 1) {
  const existing = cart.find((item) => item.id === product.id);
  const nextQuantity = quantityWithinStock(product, (existing?.quantity || 0) + Math.max(1, Math.floor(Number(quantity) || 1)));
  if (!nextQuantity) return cart;
  const nextItem = { ...product, quantity: nextQuantity, numericPrice: parsePrice(product.price) };
  return existing ? cart.map((item) => item.id === product.id ? nextItem : item) : [...cart, nextItem];
}

export function setCartQuantity(cart, id, quantity) {
  return cart.flatMap((item) => {
    if (item.id !== id) return [item];
    const nextQuantity = Number(quantity) <= 0 ? 0 : quantityWithinStock(item, quantity);
    return nextQuantity ? [{ ...item, quantity: nextQuantity }] : [];
  });
}

export function reconcileCart(savedCart, products) {
  const previous = Array.isArray(savedCart) ? savedCart : [];
  const catalog = new Map(products.map((product) => [String(product.id), product]));
  const cart = previous.flatMap((item) => {
    const product = item && catalog.get(String(item.id));
    if (!product || !availableStock(product)) return [];
    return [{ ...product, quantity: quantityWithinStock(product, item.quantity), numericPrice: parsePrice(product.price) }];
  });
  const changed = previous.length !== cart.length || cart.some((item, index) => {
    const old = previous[index];
    return String(old?.id) !== String(item.id) || old.quantity !== item.quantity || parsePrice(old.price) !== item.numericPrice;
  });
  return { cart, changed };
}

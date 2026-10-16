import { useState, useEffect, useMemo, useCallback } from 'react';
import { CartContext } from './cart-context';
import { addCartItem, availableStock, reconcileCart, setCartQuantity } from '../services/cart';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../hooks/useToast';
import { DEMO_MODE } from '../services/checkout';

export function CartProvider({ children }) {
  const { products, refreshProducts } = useProducts();
  const { addToast } = useToast();
  const [savedCart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parseando carrito de localStorage:', e);
      }
    }
    return [];
  });
  const cart = useMemo(() => reconcileCart(savedCart, products).cart, [savedCart, products]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, openDrawer = true) => {
    const current = products.find((item) => item.id === product.id);
    const existingQuantity = cart.find((item) => item.id === product.id)?.quantity || 0;
    const requested = Math.max(1, Math.floor(Number(quantity) || 1));
    const added = Math.min(requested, Math.max(0, availableStock(current) - existingQuantity));
    if (added < requested) addToast(added ? `Solo se agregaron ${added} unidades: alcanzaste el stock disponible.` : 'No hay más unidades disponibles de este producto.', 'warning');
    if (!added) return 0;
    setCart((previous) => addCartItem(reconcileCart(previous, products).cart, current, requested));
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
    return added;
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((item) => item.id === productId);
    if (Number(quantity) > availableStock(product)) addToast('La cantidad se ajustó al stock disponible.', 'warning');
    setCart((previous) => setCartQuantity(reconcileCart(previous, products).cart, productId, quantity));
  };

  const refreshCart = async () => {
    const latest = await refreshProducts(!DEMO_MODE);
    const result = reconcileCart(cart, latest || products);
    setCart(result.cart);
    return result;
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.numericPrice;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const value = {
    cart,
    isDrawerOpen,
    setIsDrawerOpen,
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer,
    addToCart,
    removeFromCart,
    updateQuantity,
    refreshCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

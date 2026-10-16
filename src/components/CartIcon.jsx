import { useCart } from '../hooks/useCart';
import { ShoppingCart } from '@phosphor-icons/react';

export default function CartIcon() {
  const { getTotalItems, openDrawer } = useCart();
  const totalItems = getTotalItems();

  return (
    <button
      onClick={openDrawer}
      className="cart-icon-btn"
      aria-label={`Abrir carrito con ${totalItems} productos`}
    >
      <div className="cart-icon">
        <ShoppingCart size={32} weight="regular" aria-hidden="true" />
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </div>
    </button>
  );
}

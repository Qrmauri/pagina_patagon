import { useCart } from '../hooks/useCart';

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
        🛒
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </div>
    </button>
  );
}

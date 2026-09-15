import { useState } from 'react'
import Navbar from '../components/Navbar'
import ProductGallery from '../components/ProductGallery'
import CartDrawer from '../components/CartDrawer'
import QuickViewModal from '../components/QuickViewModal'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../services/productsData'

function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1, true);
    addToast(`"${product.title}" agregado al carrito`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="card product-card-hover">
      <div className="card-media">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop'}
          alt={product.title}
          className="card-image"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop';
          }}
        />
        <button
          className="quickview-trigger-btn"
          onClick={() => onQuickView(product)}
          title="Vista rápida"
        >
          👁 Vista Rápida
        </button>
      </div>
      <div className="card-content">
        <span className="card-category">{product.category}</span>
        <h3 className="card-title">{product.title}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-price">{formatPrice(product.price)}</div>
        <button 
          onClick={handleAdd}
          className="add-to-cart-btn"
          style={added ? { background: '#2c7a49', borderColor: '#2c7a49' } : {}}
        >
          {added ? '✓ ¡Agregado!' : '🛒 Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

export default function CategoryPage({ title, emoji, category }) {
  const { products } = useProducts();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const filteredProducts = products.filter(
    (product) => product.category?.toLowerCase() === category?.toLowerCase()
  );

  const galleryImages = filteredProducts
    .filter((p) => p.image)
    .map((product) => ({
      src: product.image,
      alt: product.title,
    }));

  return (
    <>
      <Navbar />
      <CartDrawer />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <main>
        <div className="container">
          <section style={{ padding: '60px 0 30px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '44px', marginBottom: '12px' }}>
              {emoji} {title}
            </h1>
            <p style={{ color: '#7a746e', fontSize: '18px', marginBottom: '30px' }}>
              Explora nuestras selecciones de {title.toLowerCase()} ({filteredProducts.length} productos)
            </p>
          </section>

          {galleryImages.length > 0 && (
            <ProductGallery title={`Imágenes de ${title}`} images={galleryImages} />
          )}

          <section id="productos" style={{ marginTop: '40px', marginBottom: '80px' }}>
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '18px' }}>
                  <p style={{ fontSize: '18px', color: '#7a746e' }}>
                    Aún no hay productos en la categoría <strong>{title}</strong>.
                  </p>
                  <p style={{ color: '#9ca3af', marginTop: '8px' }}>
                    Puedes agregar nuevos productos desde la sección de Gestión.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

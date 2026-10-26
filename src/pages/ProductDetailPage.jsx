import BrandText from '../components/BrandText';
import { categoryLabel } from '../services/categoryLabels';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { whatsappLink } from '../services/storeConfig';
import { useStoreContact } from '../hooks/useStoreContact';
import { productImages, SPECIFICATION_LABELS } from '../services/productExperience';
import StorePurchaseInfo from '../components/StorePurchaseInfo';
import { formatPrice, isProductIllustration } from '../services/productsData';

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetail key={id} />;
}

function ProductDetail() {
  const STORE_CONTACT = useStoreContact();
  const [selectedImage, setSelectedImage] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, active: false });

  // Buscar el producto por id
  const product = products.find((p) => String(p.id) === String(id));

  // Resetear cantidad al cambiar de producto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading && !product) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '120px 20px', minHeight: '60vh' }}>
          <div style={{ fontSize: 'var(--text-2xl)', marginBottom: '16px' }}>⏳</div>
          <p role="status">Cargando producto...</p>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
          <div style={{ fontSize: 'var(--text-4xl)', marginBottom: '16px' }}>📦</div>
          <h1 style={{ fontSize: 'var(--text-page-title)', color: '#1c1a18', marginBottom: '12px' }}>Producto no encontrado</h1>
          <p style={{ color: '#7a746e', marginBottom: '24px' }}>
            El producto que buscas no existe o ha sido retirado de nuestro catálogo.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              background: 'var(--brand-teal-dark)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 'var(--weight-bold)',
              textDecoration: 'none',
            }}
          >
            ← Volver a la Tienda
          </Link>
        </div>
      </>
    );
  }

  const isOutOfStock = typeof product.stock === 'number' && product.stock === 0;
  const images = productImages(product);
  const activeImage = Math.min(selectedImage, images.length - 1);
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;
  const maxAvailable = typeof product.stock === 'number' ? product.stock : 99;
  const categoryPath = { juguetes: '/juguetes', libros: '/libreria', 'electrónica': '/electronica' }[product.category] || '/';

  // Productos relacionados de la misma categoría (excluyendo el actual)
  const relatedProducts = products
    .filter((p) => p.category?.toLowerCase() === product.category?.toLowerCase() && String(p.id) !== String(product.id))
    .slice(0, 3);

  // Manejador del zoom de imagen interactivo
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setZoomPos((prev) => ({ ...prev, active: false }));
  };

  // Acciones de compra
  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast(`"${product.title}" está agotado actualmente`, 'warning');
      return;
    }
    const added = addToCart(product, quantity, true);
    if (!added) return;
    addToast(`¡${added} x "${product.title}" agregado(s) al carrito!`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      addToast(`"${product.title}" está agotado actualmente`, 'warning');
      return;
    }
    if (!addToCart(product, quantity, false)) return;
    navigate('/carrito');
  };

  // Enlace para consultar por WhatsApp con mensaje pre-rellenado
  const whatsappUrl = whatsappLink(`Hola, tengo una consulta sobre ${product.title}.`, STORE_CONTACT);

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '80vh', padding: '30px 20px 80px', background: 'var(--page-background)' }}>
        <div className="product-detail-surface" style={{ maxWidth: '1180px', margin: '0 auto' }}>
          
          {/* Breadcrumbs de Navegación */}
          <nav style={{ fontSize: 'var(--text-sm)', color: '#7a746e', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#7a746e', textDecoration: 'none' }}>Inicio</Link>
            <span>/</span>
            <Link to={categoryPath} style={{ color: '#7a746e', textDecoration: 'none', textTransform: 'capitalize' }}>
              {categoryLabel(product.category)}
            </Link>
            <span>/</span>
            <span style={{ color: '#1c1a18', fontWeight: 'var(--weight-semibold)' }}>{product.title}</span>
          </nav>

          {/* Grid Principal: Galería a la izquierda, Compra a la derecha */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: '48px',
              background: '#ffffff',
              padding: 'clamp(12px, 3vw, 28px)',
              borderRadius: '24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              border: '1px solid #ede8e1',
              alignItems: 'start',
            }}
          >
            {/* COLUMNA 1: Imagen con Visor y Zoom Interactivo */}
            <div>
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#f4f0eb',
                  border: '1px solid #ede8e1',
                  cursor: isOutOfStock ? 'default' : 'crosshair',
                }}
              >
                <img
                  key={images[activeImage]}
                  src={images[activeImage]}
                  alt={`${product.title}, fotografía ${activeImage + 1} de ${images.length}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: zoomPos.active ? 'transform 0.05s ease-out' : 'transform 0.3s ease-in-out',
                    transform: zoomPos.active ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/product-placeholder.svg';
                  }}
                />

                {/* Badge de Stock en Imagen */}
                {isOutOfStock ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-bold)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                    }}
                  >
                    Agotado
                  </span>
                ) : isLowStock ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: '#f59e0b',
                      color: '#fff',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-bold)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                    }}
                  >
                    ¡Últimas {product.stock} un.!
                  </span>
                ) : null}
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {isProductIllustration(product) ? 'Imagen ilustrativa del producto' : '🔍 Pasa el cursor sobre la imagen para ampliar los detalles'}
              </div>
              {images.length > 1 && <div className="product-gallery-thumbnails" role="group" aria-label="Fotografías del producto">{images.map((src, index) => <button key={src} type="button" aria-label={`Ver fotografía ${index + 1} de ${product.title}`} aria-pressed={activeImage === index} onClick={() => { setSelectedImage(index); handleMouseLeave(); }}><img src={src} alt="" width="72" height="72" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg'; }} /></button>)}</div>}
            </div>

            {/* COLUMNA 2: Información, Precio, Selector de Cantidad y Botones */}
            <div>
              {/* Categoría y SKU */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    background: '#f4ede4',
                    color: '#8c5936',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--weight-bold)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-label)',
                    padding: '4px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {categoryLabel(product.category)}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>SKU: PAT-{String(product.id).padStart(4, '0')}</span>
              </div>

              {/* Título */}
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-page-title)',
                  color: '#1c1a18',
                  lineHeight: 'var(--leading-heading)',
                  marginBottom: '12px',
                }}
              >
                <BrandText text={product.title} />
              </h1>

              {/* Valoración / Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>Sin reseñas verificadas del producto</span>
              </div>

              {/* Precio */}
              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: 'var(--text-3xl)',
                    fontWeight: 'var(--weight-bold)',
                    color: '#1c1a18',
                    letterSpacing: 'var(--tracking-heading)',
                  }}
                >
                  {formatPrice(product.price)}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e', marginLeft: '10px' }}>IVA incluido</span>
              </div>

              {/* Estado de Inventario */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#ecfdf5',
                  color: isOutOfStock ? '#991b1b' : isLowStock ? '#92400e' : '#065f46',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                }}
              >
                <span>{isOutOfStock ? '❌' : isLowStock ? '⚠️' : '✔'}</span>
                <span>
                  {isOutOfStock
                    ? 'Agotado temporalmente'
                    : isLowStock
                    ? `¡Stock crítico! Solo quedan ${product.stock} unidades`
                    : `Disponible (${product.stock} unidades registradas)`}
                </span>
              </div>

              {/* Descripción Corta */}
              <p style={{ color: '#4b5563', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-body)', marginBottom: '28px' }}>
                {product.description}
              </p>

              {/* Selector de Cantidad */}
              {!isOutOfStock && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: '#374151', marginBottom: '8px' }}>
                    Cantidad:
                  </label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '10px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      style={{
                        padding: '10px 18px',
                        background: '#f9fafb',
                        border: 'none',
                        fontSize: 'var(--text-lg)',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                        color: quantity <= 1 ? '#9ca3af' : '#111827',
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: '50px',
                        textAlign: 'center',
                        fontWeight: 'var(--weight-bold)',
                        fontSize: 'var(--text-base)',
                        color: '#111827',
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                      disabled={quantity >= maxAvailable}
                      style={{
                        padding: '10px 18px',
                        background: '#f9fafb',
                        border: 'none',
                        fontSize: 'var(--text-lg)',
                        cursor: quantity >= maxAvailable ? 'not-allowed' : 'pointer',
                        color: quantity >= maxAvailable ? '#9ca3af' : '#111827',
                      }}
                    >
                      +
                    </button>
                  </div>
                  {quantity >= maxAvailable && (
                    <span style={{ fontSize: 'var(--text-sm)', color: '#f59e0b', marginLeft: '12px' }}>
                      Máximo disponible alcanzado
                    </span>
                  )}
                </div>
              )}

              {/* Botones de Acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    style={{
                      padding: '16px 20px',
                      background: isOutOfStock ? '#d1d5db' : 'var(--brand-teal-dark)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-base)',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      boxShadow: isOutOfStock ? 'none' : '0 4px 14px rgba(44,122,73,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    🛍️ Agregar al Carrito
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    style={{
                      padding: '16px 20px',
                      background: isOutOfStock ? '#e5e7eb' : '#1c1a18',
                      color: isOutOfStock ? '#9ca3af' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-base)',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ⚡ Comprar Ahora
                  </button>
                </div>

                {/* Botón WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px 20px',
                    background: '#25D366',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: 'var(--text-sm)',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-lg)' }}>💬</span>
                  {STORE_CONTACT.whatsapp ? 'Consultar por WhatsApp' : 'Contacto y condiciones'}
                </a>
              </div>

              {/* Beneficios de Compra */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  background: '#f9f6f1',
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1px solid #ede8e1',
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-lg)' }}>🚚</span>
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: '#1c1a18' }}>Información de entrega</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>Consulta zonas y plazos en Ayuda</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-lg)' }}>📄</span>
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: '#1c1a18' }}>Resumen de demostración</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>Descarga en PDF al finalizar</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-lg)' }}>🛡️</span>
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: '#1c1a18' }}>Cambios y devoluciones</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>Consulta nuestras condiciones</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="product-specs"><h2><BrandText text="Características del producto" /></h2>
            {Object.entries(SPECIFICATION_LABELS).some(([key]) => product.specifications?.[key]) && <dl className="product-fact-list">{Object.entries(SPECIFICATION_LABELS).map(([key, label]) => product.specifications?.[key] ? <div key={key}><dt>{label}</dt><dd>{product.specifications[key]}</dd></div> : null)}</dl>}
            {product.characteristics ? <p style={{ whiteSpace: 'pre-line' }}>{product.characteristics}</p> : <p>Consulta los datos disponibles de la ficha. Si necesitas otra medida o información de compatibilidad, consulta antes de comprar.</p>}<Link to="/ayuda">Consultar condiciones y contacto →</Link></section>
          <StorePurchaseInfo />
          <h2 className="product-information-heading"><BrandText text="Información del producto" /></h2>
          {/* Pestañas de Información Adicional */}
          <div
            style={{
              marginTop: '40px',
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #ede8e1',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <div className="product-info-tabs" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #ede8e1', paddingBottom: '16px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('descripcion')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                  color: activeTab === 'descripcion' ? 'var(--brand-teal-dark)' : '#7a746e',
                  borderBottom: activeTab === 'descripcion' ? '3px solid var(--brand-teal-dark)' : '3px solid transparent',
                }}
              >
                📝 Descripción & Características
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('envios')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                  color: activeTab === 'envios' ? 'var(--brand-teal-dark)' : '#7a746e',
                  borderBottom: activeTab === 'envios' ? '3px solid var(--brand-teal-dark)' : '3px solid transparent',
                }}
              >
                🚚 Envíos y Entregas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('garantia')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-bold)',
                  cursor: 'pointer',
                  paddingBottom: '8px',
                  color: activeTab === 'garantia' ? 'var(--brand-teal-dark)' : '#7a746e',
                  borderBottom: activeTab === 'garantia' ? '3px solid var(--brand-teal-dark)' : '3px solid transparent',
                }}
              >
                🛡️ Garantía & Cambios
              </button>
            </div>

            {activeTab === 'descripcion' && (
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '12px', color: '#1c1a18' }}>Acerca de este producto</h3>
                <p style={{ color: '#4b5563', lineHeight: 'var(--leading-body)', fontSize: 'var(--text-base)', marginBottom: '16px' }}>
                  {product.description}
                </p>
                <ul style={{ color: '#4b5563', lineHeight: 'var(--leading-body)', fontSize: 'var(--text-sm)', paddingLeft: '20px' }}>
                  <li>Categoría de catálogo: <strong>{categoryLabel(product.category)}</strong></li>
                  <li>Código identificador: <strong>PAT-{String(product.id).padStart(4, '0')}</strong></li>
                  <li>Disponibilidad registrada: <strong>{product.stock} unidades</strong></li>
                  
                </ul>
              </div>
            )}

            {activeTab === 'envios' && <p>{STORE_CONTACT.delivery}</p>}
            {activeTab === 'garantia' && <p>{STORE_CONTACT.returns}</p>}
          </div>

          {/* Sección de Productos Relacionados */}
          {relatedProducts.length > 0 && (
            <div style={{ marginTop: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', color: '#1c1a18' }}>✨ También te podría interesar</h2>
                <Link
                  to={categoryPath}
                  style={{ color: 'var(--brand-teal-dark)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}
                >
                  Ver más en {categoryLabel(product.category)} →
                </Link>
              </div>

              <div className="products-grid">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useProducts } from '../hooks/useProducts'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../services/productsData'
import { api } from '../services/api'

const emptyProduct = {
  id: null,
  title: '',
  category: 'juguetes',
  price: '',
  description: '',
  image: '',
}

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault, backendAvailable } = useProducts()
  const { addToast } = useToast()
  const [form, setForm] = useState(emptyProduct)
  const [isEditing, setIsEditing] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' | 'url'
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders' | 'reviews'
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [testimonials, setTestimonials] = useState([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(false)

  useEffect(() => {
    if (activeTab === 'orders' && backendAvailable) {
      setLoadingOrders(true)
      api.getOrders()
        .then((data) => setOrders(data || []))
        .catch((err) => console.error('Error cargando pedidos:', err))
        .finally(() => setLoadingOrders(false))
    } else if (activeTab === 'reviews') {
      setLoadingTestimonials(true)
      api.getTestimonials()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTestimonials(data)
          } else {
            // Cargar de localStorage como fallback
            const saved = localStorage.getItem('patagon-testimonials')
            if (saved) setTestimonials(JSON.parse(saved))
          }
        })
        .catch(() => {
          const saved = localStorage.getItem('patagon-testimonials')
          if (saved) setTestimonials(JSON.parse(saved))
        })
        .finally(() => setLoadingTestimonials(false))
    }
  }, [activeTab, backendAvailable])

  const showFeedback = (msg, type = 'success') => {
    addToast(msg, type)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar formato (JPEG / PNG)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      showFeedback('Por favor selecciona una imagen válida en formato JPEG o PNG.', 'error')
      event.target.value = ''
      return
    }

    // Tamaño máximo sugerido (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showFeedback('La imagen no debe superar los 10MB.', 'error')
      event.target.value = ''
      return
    }

    setImageFile(file)

    // Crear vista previa y Base64 para modo offline
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setImagePreview(dataUrl)
      setForm((prev) => ({ ...prev, image: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setForm((prev) => ({ ...prev, image: '' }))
  }

  const resetForm = () => {
    setForm(emptyProduct)
    setIsEditing(false)
    setImageFile(null)
    setImagePreview('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const productPayload = {
      ...form,
      imageFile: imageFile,
    }

    if (isEditing) {
      await updateProduct(form.id, productPayload)
      showFeedback('¡Producto actualizado con éxito!')
    } else {
      await addProduct(productPayload)
      showFeedback('¡Producto agregado al catálogo!')
    }
    resetForm()
  }

  const handleEdit = (product) => {
    setForm({
      ...product,
      price: product.price ? String(product.price).replace(/[^0-9]/g, '') : '',
    })
    setIsEditing(true)
    setImageFile(null)
    setImagePreview(product.image || '')
    window.scrollTo({ top: 100, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto del catálogo?')) {
      deleteProduct(id)
      if (form.id === id) resetForm()
      showFeedback('Producto eliminado.')
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm('¿Deseas eliminar esta reseña de cliente?')) {
      try {
        if (backendAvailable) {
          await api.deleteTestimonial(id)
        }
      } catch (err) {
        console.warn('Eliminando reseña localmente:', err.message)
      }
      setTestimonials((prev) => {
        const updated = prev.filter((t) => t.id !== id)
        localStorage.setItem('patagon-testimonials', JSON.stringify(updated))
        return updated
      })
      showFeedback('Reseña eliminada.')
    }
  }

  const handleResetCatalog = () => {
    if (window.confirm('¿Restablecer el catálogo a los productos originales de muestra?')) {
      resetToDefault()
      resetForm()
      showFeedback('Catálogo restablecido.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '40px 20px 80px' }}>
        <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '38px', marginBottom: '8px', fontFamily: 'var(--font-display, Georgia, serif)' }}>
              Gestión de Catálogo
            </h1>
            <p style={{ color: '#7a746e', fontSize: '17px', margin: '4px 0 10px' }}>
              Crea, edita o elimina productos. Los cambios se reflejarán de inmediato en la tienda y en todas las categorías.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: backendAvailable ? '#e8f7ee' : '#fef3c7', padding: '5px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, color: backendAvailable ? '#2c7a49' : '#b45309' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: backendAvailable ? '#22c55e' : '#f59e0b' }}></span>
              {backendAvailable ? 'Backend Django conectado (http://127.0.0.1:8000/api)' : 'Modo local activo (Inicia Django para persistir en SQLite)'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetCatalog}
            style={{ ...secondaryButtonStyle, fontSize: '14px', padding: '8px 16px', borderColor: '#d1d5db' }}
          >
            ↺ Restablecer catálogo original
          </button>
        </section>

        {/* Pestañas de administración */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '2px solid #eedec9', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'products' ? '#f26419' : 'transparent',
              color: activeTab === 'products' ? '#fff' : '#1c1a18',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📦 Catálogo de Productos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('orders')
              setLoadingOrders(true)
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'orders' ? '#f26419' : 'transparent',
              color: activeTab === 'orders' ? '#fff' : '#1c1a18',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📋 Pedidos de Clientes {orders.length > 0 && `(${orders.length})`}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('reviews')
              setLoadingTestimonials(true)
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'reviews' ? '#f26419' : 'transparent',
              color: activeTab === 'reviews' ? '#fff' : '#1c1a18',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            💬 Reseñas de Clientes {testimonials.length > 0 && `(${testimonials.length})`}
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            <form onSubmit={handleSubmit} style={{
              display: 'grid',
              gap: '16px',
              background: '#fff',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 4px 24px rgba(28,26,24,.09)',
              marginBottom: '40px',
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>
                {isEditing ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Título del Producto</span>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ej. Consola portátil retro"
                    style={inputStyle}
                    required
                  />
                </label>

                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Categoría</span>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    <option value="juguetes">Juguetes</option>
                    <option value="electrónica">Electrónica</option>
                    <option value="libros">Librería (libros)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Precio (CLP)</span>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ej. 19990"
                    style={inputStyle}
                    required
                  />
                </label>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700 }}>Foto del Producto</span>
                    <div style={{ display: 'inline-flex', gap: '6px', fontSize: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        style={{
                          background: uploadMode === 'file' ? '#f26419' : '#f3f4f6',
                          color: uploadMode === 'file' ? '#fff' : '#4b5563',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        📁 Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        style={{
                          background: uploadMode === 'url' ? '#f26419' : '#f3f4f6',
                          color: uploadMode === 'url' ? '#fff' : '#4b5563',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        🔗 URL Externa
                      </button>
                    </div>
                  </div>

                  {uploadMode === 'file' ? (
                    <div>
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #d1d5db',
                        borderRadius: '10px',
                        padding: '16px',
                        cursor: 'pointer',
                        background: '#fafaf9',
                        transition: 'border-color 0.2s',
                        textAlign: 'center',
                      }}>
                        <span style={{ fontSize: '24px', marginBottom: '4px' }}>📷</span>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#1c1a18' }}>
                          Haz clic para seleccionar imagen
                        </span>
                        <span style={{ fontSize: '11px', color: '#7a746e', marginTop: '2px' }}>
                          Acepta formatos <strong>JPEG</strong> o <strong>PNG</strong> (hasta 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  ) : (
                    <input
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/..."
                      style={inputStyle}
                    />
                  )}
                </div>
              </div>

              {/* Vista previa de imagen si existe */}
              {(imagePreview || form.image) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: '#fdf6ee',
                  border: '1px solid #eedec9',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}>
                  <img
                    src={imagePreview || form.image}
                    alt="Vista previa"
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #ddd' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1c1a18' }}>
                      {imageFile ? `Archivo: ${imageFile.name}` : 'Imagen seleccionada'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7a746e' }}>
                      {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB · Listo para guardar` : 'Vista previa activa'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}

              <label>
                <span style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Descripción</span>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Escribe una breve descripción atractiva..."
                  style={{ ...inputStyle, minHeight: '100px' }}
                  required
                />
              </label>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                <button type="submit" style={primaryButtonStyle}>
                  {isEditing ? 'Guardar Cambios' : 'Publicar Producto'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '26px' }}>
                  Productos en Tienda ({products.length})
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {products.map((product) => (
                  <div key={product.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr auto',
                    gap: '16px',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 20px rgba(28,26,24,.07)',
                  }}>
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop'}
                      alt={product.title}
                      onError={(event) => {
                        event.currentTarget.src = 'https://images.unsplash.com/photo-1596460107916-430662021049?w=400&auto=format&fit=crop';
                      }}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }}
                    />

                    <div>
                      <strong style={{ fontSize: '18px' }}>{product.title}</strong>
                      <div style={{ color: '#7a746e', fontSize: '14px', textTransform: 'capitalize', marginTop: '2px' }}>
                        {product.category}
                      </div>
                      <div style={{ marginTop: '4px', fontWeight: 700, color: '#f26419', fontSize: '17px' }}>
                        {formatPrice(product.price)}
                      </div>
                      <div style={{ marginTop: '6px', color: '#4a4540', fontSize: '14px' }}>
                        {product.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button type="button" onClick={() => handleEdit(product)} style={secondaryButtonStyle}>
                        Editar
                      </button>
                      <button type="button" onClick={() => handleDelete(product.id)} style={dangerButtonStyle}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : activeTab === 'orders' ? (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '26px' }}>
                Registro de Pedidos Recibidos ({orders.length})
              </h2>
            </div>

            {!backendAvailable ? (
              <div style={{ background: '#fff', padding: '36px', borderRadius: '18px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>⚠️</span>
                <h3>Backend Django no disponible</h3>
                <p style={{ color: '#7a746e', maxWidth: '500px', margin: '8px auto 16px' }}>
                  Inicia el servidor Django (ejecuta <code>start-backend.bat</code>) para sincronizar y almacenar de forma persistente los pedidos en la base de datos SQLite.
                </p>
              </div>
            ) : loadingOrders ? (
              <p style={{ textAlign: 'center', color: '#7a746e' }}>Cargando pedidos desde Django...</p>
            ) : orders.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '18px', textAlign: 'center', color: '#7a746e' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📬</span>
                <h3>Aún no hay pedidos registrados</h3>
                <p style={{ fontSize: '14px', marginTop: '6px' }}>Los pedidos que tus clientes completen en el carrito aparecerán listados aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {orders.map((order) => (
                  <div key={order.id} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 4px 20px rgba(28,26,24,.07)',
                    border: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#1c1a18' }}>Pedido #{order.id}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '13px', color: '#7a746e' }}>
                          {new Date(order.created_at).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          background: order.status === 'completed' ? '#e8f7ee' : '#fef3c7',
                          color: order.status === 'completed' ? '#2c7a49' : '#b45309',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          {order.status || 'Pendiente'}
                        </span>
                        <strong style={{ fontSize: '20px', color: '#f26419' }}>
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '14px', color: '#4a4540', marginBottom: '14px' }}>
                      <div><strong>Cliente:</strong> {order.customer_name}</div>
                      <div><strong>Email:</strong> {order.customer_email}</div>
                      <div><strong>Teléfono:</strong> {order.customer_phone}</div>
                      <div><strong>Dirección:</strong> {order.address}, {order.city}</div>
                    </div>

                    {order.items_data && order.items_data.length > 0 && (
                      <div style={{ background: '#fdf6ee', padding: '12px 16px', borderRadius: '12px', fontSize: '13px' }}>
                        <strong style={{ display: 'block', marginBottom: '6px' }}>Productos comprados:</strong>
                        <ul style={{ paddingLeft: '18px', margin: 0 }}>
                          {order.items_data.map((item, idx) => (
                            <li key={idx}>
                              {item.quantity}x {item.title} ({formatPrice(item.price)} c/u)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '26px' }}>
                  Opiniones y Reseñas de Clientes ({testimonials.length})
                </h2>
                <p style={{ color: '#7a746e', fontSize: '15px', marginTop: '4px' }}>
                  Aquí puedes moderar los comentarios y calificaciones dejados por los compradores en la tienda.
                </p>
              </div>
            </div>

            {loadingTestimonials ? (
              <p style={{ textAlign: 'center', color: '#7a746e', padding: '30px' }}>Cargando opiniones...</p>
            ) : testimonials.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '18px', textAlign: 'center', color: '#7a746e' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>💬</span>
                <h3>Aún no hay comentarios publicados</h3>
                <p style={{ fontSize: '14px', marginTop: '6px' }}>
                  Cuando los clientes comenten su experiencia en la tienda principal, sus reseñas aparecerán aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {testimonials.map((review) => (
                  <div key={review.id || review.created_at} style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 4px 20px rgba(28,26,24,.07)',
                    border: '1px solid #f3f4f6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{review.avatar || '👤'}</span>
                        <div>
                          <strong style={{ fontSize: '16px', color: '#1c1a18' }}>{review.name}</strong>
                          <div style={{ fontSize: '13px', color: '#7a746e' }}>
                            {review.city ? `${review.city}, Chile` : 'Chile'} · {review.created_at ? new Date(review.created_at).toLocaleDateString('es-CL') : 'Reciente'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {(() => {
                          const safeRating = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5)));
                          return (
                            <div style={{ color: '#f59e0b', fontSize: '18px', letterSpacing: '2px' }}>
                              {'★'.repeat(safeRating)}
                              <span style={{ color: '#e5e7eb' }}>
                                {'★'.repeat(Math.max(0, 5 - safeRating))}
                              </span>
                            </div>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(review.id)}
                          style={dangerButtonStyle}
                          title="Eliminar este comentario"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>

                    <p style={{
                      margin: 0,
                      color: '#4a4540',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      background: '#fafaf9',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontStyle: 'italic',
                    }}>
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '15px',
  fontFamily: 'inherit',
}

const primaryButtonStyle = {
  background: '#f26419',
  color: '#fff',
  border: 'none',
  borderRadius: '999px',
  padding: '11px 22px',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  background: '#fff',
  color: '#1c1a18',
  border: '1px solid #1c1a18',
  borderRadius: '999px',
  padding: '9px 18px',
  fontWeight: 600,
  cursor: 'pointer',
}

const dangerButtonStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: '999px',
  padding: '9px 18px',
  fontWeight: 600,
  cursor: 'pointer',
}

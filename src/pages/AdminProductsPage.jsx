import { categoryLabel } from '../services/categoryLabels';
import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import OrderReceiptModal from '../components/OrderReceiptModal'
import { useProducts } from '../hooks/useProducts'
import { useToast } from '../hooks/useToast'
import { formatPrice, withCatalogIllustration } from '../services/productsData'
import { summarizeSales } from '../services/store'
import { api } from '../services/api'
import { SHOPPING_NEEDS } from '../services/shoppingNeeds'
import { SPECIFICATION_LABELS } from '../services/productExperience'
import StoreSettingsForm from '../components/StoreSettingsForm'

const emptyProduct = {
  id: null,
  title: '',
  category: 'juguetes',
  price: '',
  stock: '10',
  description: '',
  characteristics: '',
  shopping_needs: [],
  specifications: {},
  galleryText: '',
  cost_price: '',
  image: '',
}

const STATUS_CONFIG = {
  pending: { label: '⏳ Pendiente', bg: '#fef3c7', color: '#b45309' },
  processing: { label: '⚙️ En preparación', bg: '#dbeafe', color: '#1d4ed8' },
  shipped: { label: '🚚 Enviado', bg: '#ede9fe', color: '#6d28d9' },
  delivered: { label: '✅ Entregado', bg: '#dcfce7', color: '#15803d' },
  completed: { label: '✓ Completado', bg: '#dcfce7', color: '#15803d' },
  cancelled: { label: '❌ Cancelado', bg: '#fee2e2', color: '#b91c1c' },
}

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault, backendAvailable } = useProducts()
  const { addToast } = useToast()
  const [form, setForm] = useState(emptyProduct)
  const [isEditing, setIsEditing] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' | 'url'
  const [activeTab, setActiveTab] = useState('analytics') // 'analytics' | 'products' | 'orders' | 'reviews'
  const [confirmingPayment, setConfirmingPayment] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null)
  const [testimonials, setTestimonials] = useState([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(false)

  useEffect(() => {
    if ((activeTab === 'orders' || activeTab === 'analytics') && backendAvailable) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sincroniza el indicador con la solicitud externa de pedidos.
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

  // Exportar pedidos a CSV (Excel UTF-8)
  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      addToast('No hay pedidos registrados para exportar.', 'warning')
      return
    }

    const headers = [
      'ID Pedido',
      'Fecha',
      'Cliente',
      'Email',
      'Telefono',
      'Direccion',
      'Ciudad',
      'Codigo Postal',
      'Subtotal',
      'Descuento',
      'Envio',
      'Total',
      'Metodo de Pago',
      'Autorizacion',
      'Estado',
      'Productos'
    ]

    const rows = orders.map((o) => {
      const itemsList = (o.items_data || []).map((it) => `${it.title} (x${it.quantity})`).join('; ')
      return [
        `#${o.id}`,
        o.created_at ? new Date(o.created_at).toLocaleString('es-CL') : '',
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${(o.customer_email || '').replace(/"/g, '""')}"`,
        `"${(o.customer_phone || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${(o.city || '').replace(/"/g, '""')}"`,
        `"${(o.postal_code || '').replace(/"/g, '""')}"`,
        o.subtotal || o.total,
        o.discount_amount || 0,
        o.shipping || 0,
        o.total,
        o.payment_method || 'webpay',
        o.payment_authorization || 'N/A',
        o.status,
        `"${itemsList.replace(/"/g, '""')}"`
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `pedidos_patagon_store_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('¡Archivo CSV de pedidos generado y descargado!', 'success')
  }

  const showFeedback = (msg, type = 'success') => {
    addToast(msg, type)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value, ...(name === 'category' ? { shopping_needs: [] } : {}) }))
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

    try {
    if (isEditing) {
      await updateProduct(form.id, productPayload)
      showFeedback('¡Producto actualizado con éxito!')
    } else {
      await addProduct(productPayload)
      showFeedback('¡Producto agregado al catálogo!')
    }
    resetForm()
    } catch (err) { showFeedback(err.message, 'error') }
  }

  const handleEdit = async (product) => {
    try {
      if (backendAvailable) product = withCatalogIllustration(await api.getProduct(product.id))
    } catch (err) { showFeedback(err.message, 'error'); return }
    setForm({
      ...product,
      characteristics: product.characteristics || '',
      shopping_needs: product.shopping_needs || [],
      specifications: product.specifications || {},
      galleryText: (product.gallery || []).join('\n'),
      cost_price: product.cost_price ?? '',
      price: product.price ? String(product.price).replace(/[^0-9]/g, '') : '',
      stock: product.stock !== undefined ? String(product.stock) : '10',
    })
    setIsEditing(true)
    setImageFile(null)
    setImagePreview(product.image || '')
    window.scrollTo({ top: 100, behavior: 'smooth' })
  }

  const confirmTransfer = async (order) => {
    if (!window.confirm(`¿Verificaste el abono de ${formatPrice(order.total)} del pedido #${order.id} en la cuenta bancaria?`)) return
    setConfirmingPayment(order.id)
    try {
      const confirmed = await api.confirmTransfer(order.id)
      setOrders(previous => previous.map(item => item.id === order.id ? confirmed : item))
      showFeedback('Abono confirmado y métricas actualizadas.')
    } catch (err) { showFeedback(err.message, 'error') }
    finally { setConfirmingPayment(null) }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (backendAvailable) {
        await api.updateOrderStatus(orderId, newStatus)
      }
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      )
      showFeedback(`Pedido #${orderId} actualizado a "${STATUS_CONFIG[newStatus]?.label || newStatus}"`, 'success')
    } catch (err) {
      showFeedback(`Error actualizando pedido: ${err.message}`, 'error')
    }
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

  const handleResetCatalog = async () => {
    if (!window.confirm('¿Añadir los ejemplos de demostración que falten? Tus productos y precios existentes se conservan.')) return
    try {
      await resetToDefault()
      resetForm()
      showFeedback('Ejemplos añadidos. Los productos existentes se conservaron.')
    } catch (err) { showFeedback(err.message, 'error') }
  }

  // Métricas analíticas
  const sales = summarizeSales(orders)
  const validOrders = sales.paid
  const totalRevenue = sales.revenue
  const avgTicket = sales.average
  const criticalStockProducts = products.filter((p) => typeof p.stock === 'number' && p.stock <= 3)
  const totalStockUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)

  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const categoryStats = ['juguetes', 'electrónica', 'libros'].map((cat) => {
    const prods = products.filter((p) => p.category?.toLowerCase() === cat)
    const stockCount = prods.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
    return { category: cat, count: prods.length, stock: stockCount }
  })

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      backendAvailable={backendAvailable}
      pendingOrdersCount={orders.filter((o) => o.status === 'pending').length}
    >
      {selectedOrderReceipt && (
        <OrderReceiptModal
          order={selectedOrderReceipt}
          onClose={() => setSelectedOrderReceipt(null)}
        />
      )}
      <div>
        <section style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#64748b', fontSize: 'var(--text-base)', margin: 0 }}>
              Gestiona el catálogo, analiza el rendimiento comercial y supervisa los pedidos en tiempo real.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetCatalog}
            style={{ ...secondaryButtonStyle, fontSize: 'var(--text-sm)', padding: '8px 16px', borderColor: '#cbd5e1' }}
          >
            + Añadir ejemplos demo
          </button>
        </section>

        {/* Pestañas de administración */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', borderBottom: '2px solid #eedec9', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'analytics' ? '#2563eb' : 'transparent',
              color: activeTab === 'analytics' ? '#fff' : '#1c1a18',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📊 Métricas & Analítica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'products' ? 'var(--brand-red-dark)' : 'transparent',
              color: activeTab === 'products' ? '#fff' : '#1c1a18',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📦 Catálogo ({products.length})
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
              background: activeTab === 'orders' ? 'var(--brand-red-dark)' : 'transparent',
              color: activeTab === 'orders' ? '#fff' : '#1c1a18',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📋 Pedidos {orders.length > 0 && `(${orders.length})`}
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
              background: activeTab === 'reviews' ? 'var(--brand-red-dark)' : 'transparent',
              color: activeTab === 'reviews' ? '#fff' : '#1c1a18',
              fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-base)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            💬 Reseñas {testimonials.length > 0 && `(${testimonials.length})`}
          </button>
        </div>

        {activeTab === 'settings' ? <StoreSettingsForm /> : activeTab === 'analytics' ? (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Cabecera Analítica */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', margin: 0, color: '#0f172a' }}>
                  📈 Desempeño Comercial y Resumen Operativo
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 'var(--text-sm)' }}>
                  Indicadores clave calculados a partir de los pedidos y stock registrados.
                </p>
              </div>

              <button
                type="button"
                onClick={exportOrdersToCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--brand-teal-dark)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 'var(--weight-bold)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
                }}
              >
                📥 Exportar Pedidos a CSV (Excel)
              </button>
            </div>

            {!backendAvailable && <p className="demo-notice">Conecta el backend para consultar resultados. Los pedidos de demostración no se cuentan como ventas.</p>}
            <section className="sales-summary"><div><h3>Margen de productos</h3><strong>{sales.productMargin == null ? 'Costos pendientes' : formatPrice(sales.productMargin)}</strong><p>Venta neta de descuentos menos costo unitario registrado al pedir. Excluye despacho, comisiones, publicidad e impuestos; no es utilidad neta.</p></div><div><h3>Productos más vendidos</h3>{sales.bestSellers.length ? <ul>{sales.bestSellers.map(item => <li key={item.id}>{item.title}: {item.quantity} unidades</li>)}</ul> : <p>Aún no hay ventas con pago confirmado.</p>}</div></section>
            {/* Tarjetas de KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 13.75rem), 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#64748b', textTransform: 'uppercase' }}>Ventas de productos pagados</span>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: '#0f172a', margin: '8px 0 4px' }}>
                  {formatPrice(totalRevenue)}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-teal-dark)', fontWeight: 'var(--weight-semibold)' }}>
                  ✓ {validOrders.length} pagos confirmados · sin envío
                </span>
              </div>

              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#64748b', textTransform: 'uppercase' }}>Total de Pedidos</span>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: '#2563eb', margin: '8px 0 4px' }}>
                  {orders.length}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: statusCounts.pending > 0 ? '#b45309' : '#64748b', fontWeight: 'var(--weight-semibold)' }}>
                  {statusCounts.pending} pedidos pendientes
                </span>
              </div>

              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#64748b', textTransform: 'uppercase' }}>Ticket Promedio</span>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: '#0f172a', margin: '8px 0 4px' }}>
                  {formatPrice(avgTicket)}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: '#64748b' }}>
                  Promedio por compra
                </span>
              </div>

              <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#64748b', textTransform: 'uppercase' }}>Stock en Alerta</span>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: criticalStockProducts.length > 0 ? '#dc2626' : '#16a34a', margin: '8px 0 4px' }}>
                  {criticalStockProducts.length}
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: criticalStockProducts.length > 0 ? '#dc2626' : '#16a34a', fontWeight: 'var(--weight-semibold)' }}>
                  {criticalStockProducts.length > 0 ? 'Productos con stock ≤ 3 un.' : 'Inventario en nivel óptimo'}
                </span>
              </div>
            </div>

            {/* Paneles de Barras de Distribución */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', marginBottom: '16px', color: '#0f172a' }}>
                  Distribución de Pedidos por Estado
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { key: 'pending', label: 'Pendientes', count: statusCounts.pending, color: '#f59e0b' },
                    { key: 'processing', label: 'En Preparación', count: statusCounts.processing, color: '#3b82f6' },
                    { key: 'shipped', label: 'Enviados', count: statusCounts.shipped, color: '#8b5cf6' },
                    { key: 'delivered', label: 'Entregados', count: statusCounts.delivered, color: '#10b981' },
                    { key: 'cancelled', label: 'Cancelados', count: statusCounts.cancelled, color: '#ef4444' },
                  ].map((s) => {
                    const pct = orders.length > 0 ? Math.round((s.count / orders.length) * 100) : 0
                    return (
                      <div key={s.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'var(--weight-semibold)', color: '#334155' }}>{s.label} ({s.count})</span>
                          <span style={{ color: '#64748b' }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: '999px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', marginBottom: '16px', color: '#0f172a' }}>
                  Inventario y Stock por Categoría
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {categoryStats.map((c) => {
                    const pct = totalStockUnits > 0 ? Math.round((c.stock / totalStockUnits) * 100) : 0
                    const emoji = c.category === 'juguetes' ? '🧸' : c.category === 'electrónica' ? '⚡' : '📚'
                    return (
                      <div key={c.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'var(--weight-semibold)', color: '#334155', textTransform: 'capitalize' }}>
                            {emoji} {categoryLabel(c.category)} ({c.count} productos)
                          </span>
                          <span style={{ fontWeight: 'var(--weight-bold)', color: '#0f172a' }}>{c.stock} un. ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-red-dark)', borderRadius: '999px', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tabla de Órdenes Recientes */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', margin: 0, color: '#0f172a' }}>
                  Últimos Pedidos Registrados
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
                >
                  Ver todos los pedidos →
                </button>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '20px' }}>
                  Aún no se han recibido pedidos en el sistema.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Folio</th>
                      <th style={{ padding: '10px' }}>Cliente</th>
                      <th style={{ padding: '10px' }}>Método de Pago</th>
                      <th style={{ padding: '10px' }}>Total</th>
                      <th style={{ padding: '10px' }}>Estado</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Boleta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => {
                      const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 'var(--weight-bold)' }}>#{o.id}</td>
                          <td style={{ padding: '10px' }}>{o.customer_name}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ fontSize: 'var(--text-sm)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                              {o.payment_method === 'transferencia' ? '🏦 Transferencia' : '💳 Webpay Plus'}
                            </span>
                          </td>
                          <td style={{ padding: '10px', fontWeight: 'var(--weight-bold)', color: 'var(--brand-teal-dark)' }}>{formatPrice(o.total)}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 8px', borderRadius: '6px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>
                              {cfg.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderReceipt(o)}
                              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}
                            >
                              📄 Ver resumen
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        ) : activeTab === 'products' ? (
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
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: '4px' }}>
                {isEditing ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}
              </h2>
              <p className="admin-catalog-guidance">Completa las selecciones de compra, fotos y ficha técnica con datos reales. Los ejemplos de librería se pueden añadir con «Añadir ejemplos demo»; esa acción conserva los productos existentes.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15.625rem), 1fr))', gap: '16px' }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--weight-bold)' }}>Título del Producto</span>
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
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--weight-bold)' }}>Categoría</span>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    <option value="juguetes">Juguetes</option>
                    <option value="electrónica">Electrónica</option>
                    <option value="libros">Librería (escolar, oficina, manualidades y libros)</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--weight-bold)' }}>Precio (CLP)</span>
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

                <label>
                  <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--weight-bold)' }}>Stock Disponible (Unidades)</span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="Ej. 10"
                    style={inputStyle}
                    required
                  />
                </label>
              </div>

              <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'var(--weight-bold)' }}>Foto del Producto</span>
                    <div style={{ display: 'inline-flex', gap: '6px', fontSize: 'var(--text-sm)' }}>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        style={{
                          background: uploadMode === 'file' ? 'var(--brand-red-dark)' : '#f3f4f6',
                          color: uploadMode === 'file' ? '#fff' : '#4b5563',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 'var(--weight-semibold)',
                        }}
                      >
                        📁 Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        style={{
                          background: uploadMode === 'url' ? 'var(--brand-red-dark)' : '#f3f4f6',
                          color: uploadMode === 'url' ? '#fff' : '#4b5563',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          cursor: 'pointer',
                          fontWeight: 'var(--weight-semibold)',
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
                        <span style={{ fontSize: 'var(--text-xl)', marginBottom: '4px' }}>📷</span>
                        <span style={{ fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: '#1c1a18' }}>
                          Haz clic para seleccionar imagen
                        </span>
                        <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e', marginTop: '2px' }}>
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

              <fieldset className="admin-product-metadata"><legend>¿Dónde mostrar este producto?</legend><p>Selecciona las necesidades que correspondan. No se asignan por el nombre del producto.</p><div className="admin-need-options">{SHOPPING_NEEDS.filter(need => need.category === form.category).map(need => <label key={need.id}><input type="checkbox" checked={form.shopping_needs.includes(need.id)} onChange={event => setForm(previous => ({ ...previous, shopping_needs: event.target.checked ? [...previous.shopping_needs, need.id] : previous.shopping_needs.filter(id => id !== need.id) }))} /> {need.title}</label>)}</div>{!SHOPPING_NEEDS.some(need => need.category === form.category) && <p>Esta categoría aparece en el catálogo general.</p>}</fieldset>
              <div className="admin-spec-grid">{Object.entries(SPECIFICATION_LABELS).map(([key, label]) => <label key={key}>{label}<input maxLength={500} value={form.specifications[key] || ''} onChange={event => setForm(previous => ({ ...previous, specifications: { ...previous.specifications, [key]: event.target.value } }))} style={inputStyle} placeholder="Completa solo datos confirmados" /></label>)}</div>
              <label>Fotos adicionales (hasta 8 enlaces)<textarea name="galleryText" value={form.galleryText} onChange={handleChange} style={{ ...inputStyle, minHeight: '100px' }} placeholder="https://... Una URL HTTP o HTTPS por línea." /></label>
              <label>Características y compatibilidad<textarea name="characteristics" value={form.characteristics || ''} onChange={handleChange} style={{ ...inputStyle, minHeight: '110px' }} placeholder="Medidas, materiales, qué incluye, edad recomendada o compatibilidad. Una característica por línea." /></label>
              <label>Costo unitario interno en CLP<input name="cost_price" type="number" min="0" step="1" value={form.cost_price ?? ''} onChange={handleChange} style={inputStyle} placeholder="Opcional; no visible para compradores" /></label>
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
                    <div style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: '#1c1a18' }}>
                      {imageFile ? `Archivo: ${imageFile.name}` : 'Imagen seleccionada'}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>
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
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--weight-bold)',
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}

              <label>
                <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'var(--weight-bold)' }}>Descripción</span>
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
                <h2 style={{ fontSize: 'var(--text-xl)' }}>
                  Productos en Tienda ({products.length})
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {products.map((product) => (
                  <div key={product.id} className="admin-product-row" style={{
                    display: 'grid',
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
                      <strong style={{ fontSize: 'var(--text-lg)' }}>{product.title}</strong>
                      <div style={{ color: '#7a746e', fontSize: 'var(--text-sm)', textTransform: 'capitalize', marginTop: '2px' }}>
                        {categoryLabel(product.category)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--brand-red-dark)', fontSize: 'var(--text-base)' }}>
                          {formatPrice(product.price)}
                        </span>
                        <span style={{
                          fontSize: 'var(--text-sm)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 'var(--weight-semibold)',
                          background: (product.stock === 0) ? '#fee2e2' : (product.stock <= 3) ? '#fef3c7' : '#e0f2fe',
                          color: (product.stock === 0) ? '#b91c1c' : (product.stock <= 3) ? '#b45309' : '#0369a1',
                        }}>
                          {product.stock === 0 ? '❌ Agotado (0 un.)' : product.stock <= 3 ? `⚠️ Bajo stock (${product.stock} un.)` : `Stock: ${product.stock ?? 10} un.`}
                        </span>
                      </div>
                      <div style={{ marginTop: '6px', color: '#4a4540', fontSize: 'var(--text-sm)' }}>
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
              <h2 style={{ fontSize: 'var(--text-xl)' }}>
                Registro de Pedidos Recibidos ({orders.length})
              </h2>
            </div>

            {!backendAvailable ? (
              <div style={{ background: '#fff', padding: '36px', borderRadius: '18px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', display: 'block', marginBottom: '10px' }}>⚠️</span>
                <h3>Backend Django no disponible</h3>
                <p style={{ color: '#7a746e', maxWidth: '500px', margin: '8px auto 16px' }}>
                  Inicia el servidor Django (ejecuta <code>start-backend.bat</code>) para sincronizar y almacenar de forma persistente los pedidos en la base de datos SQLite.
                </p>
              </div>
            ) : loadingOrders ? (
              <p style={{ textAlign: 'center', color: '#7a746e' }}>Cargando pedidos desde Django...</p>
            ) : orders.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '18px', textAlign: 'center', color: '#7a746e' }}>
                <span style={{ fontSize: 'var(--text-3xl)', display: 'block', marginBottom: '10px' }}>📬</span>
                <h3>Aún no hay pedidos registrados</h3>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: '6px' }}>Los pedidos que tus clientes completen en el carrito aparecerán listados aquí.</p>
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
                        <strong style={{ fontSize: 'var(--text-lg)', color: '#1c1a18' }}>Pedido #{order.id}</strong>
                        <span style={{ marginLeft: '10px', fontSize: 'var(--text-sm)', color: '#7a746e' }}>
                          {new Date(order.created_at).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: 'var(--text-sm)', color: '#7a746e', fontWeight: 'var(--weight-semibold)' }}>Estado:</span>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--weight-bold)',
                              border: '1px solid #d1d5db',
                              background: STATUS_CONFIG[order.status]?.bg || '#fef3c7',
                              color: STATUS_CONFIG[order.status]?.color || '#b45309',
                              cursor: 'pointer',
                              outline: 'none',
                            }}
                          >
                            <option value="pending">⏳ Pendiente</option>
                            <option value="processing">⚙️ En preparación</option>
                            <option value="shipped">🚚 Enviado</option>
                            <option value="delivered">✅ Entregado</option>
                            <option value="completed">✓ Completado</option>
                            <option value="cancelled">❌ Cancelado</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderReceipt(order)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--weight-bold)',
                            background: '#ffffff',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}
                          title="Ver resumen e imprimir"
                        >
                          📄 Resumen
                        </button>
                        <span>{order.payment_status === 'paid' ? 'Pago confirmado' : 'Pago pendiente'}</span>
                        {order.payment_status !== 'paid' && order.payment_method === 'transferencia' && order.status !== 'cancelled' && <button type="button" style={secondaryButtonStyle} disabled={confirmingPayment === order.id} onClick={() => confirmTransfer(order)}>Confirmar abono recibido</button>}
                        <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--brand-red-dark)' }}>
                          {formatPrice(order.total)}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 13.75rem), 1fr))', gap: '12px', fontSize: 'var(--text-sm)', color: '#4a4540', marginBottom: '14px' }}>
                      <div><strong>Cliente:</strong> {order.customer_name}</div>
                      <div><strong>Email:</strong> {order.customer_email}</div>
                      <div><strong>Teléfono:</strong> {order.customer_phone}</div>
                      <div><strong>Dirección:</strong> {order.address}, {order.city}</div>
                    </div>

                    {order.items_data && order.items_data.length > 0 && (
                      <div style={{ background: '#fdf6ee', padding: '12px 16px', borderRadius: '12px', fontSize: 'var(--text-sm)' }}>
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
                <h2 style={{ fontSize: 'var(--text-xl)' }}>
                  Opiniones y Reseñas de Clientes ({testimonials.length})
                </h2>
                <p style={{ color: '#7a746e', fontSize: 'var(--text-base)', marginTop: '4px' }}>
                  Aquí puedes moderar los comentarios y calificaciones dejados por los compradores en la tienda.
                </p>
              </div>
            </div>

            {loadingTestimonials ? (
              <p style={{ textAlign: 'center', color: '#7a746e', padding: '30px' }}>Cargando opiniones...</p>
            ) : testimonials.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '18px', textAlign: 'center', color: '#7a746e' }}>
                <span style={{ fontSize: 'var(--text-3xl)', display: 'block', marginBottom: '10px' }}>💬</span>
                <h3>Aún no hay comentarios publicados</h3>
                <p style={{ fontSize: 'var(--text-sm)', marginTop: '6px' }}>
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
                        <span style={{ fontSize: 'var(--text-2xl)' }}>{review.avatar || '👤'}</span>
                        <div>
                          <strong style={{ fontSize: 'var(--text-base)', color: '#1c1a18' }}>{review.name}</strong>
                          <div style={{ fontSize: 'var(--text-sm)', color: '#7a746e' }}>
                            {review.city ? `${review.city}, Chile` : 'Chile'} · {review.created_at ? new Date(review.created_at).toLocaleDateString('es-CL') : 'Reciente'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {(() => {
                          const safeRating = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5)));
                          return (
                            <div style={{ color: 'var(--brand-gold-text)', fontSize: 'var(--text-lg)', letterSpacing: 'var(--tracking-label)' }}>
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
                      fontSize: 'var(--text-base)',
                      lineHeight: 'var(--leading-body)',
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
      </div>
    </AdminLayout>
  )
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: 'var(--text-base)',
  fontFamily: 'inherit',
}

const primaryButtonStyle = {
  background: 'var(--brand-red-dark)',
  color: '#fff',
  border: 'none',
  borderRadius: '999px',
  padding: '11px 22px',
  fontWeight: 'var(--weight-bold)',
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  background: '#fff',
  color: '#1c1a18',
  border: '1px solid #1c1a18',
  borderRadius: '999px',
  padding: '9px 18px',
  fontWeight: 'var(--weight-semibold)',
  cursor: 'pointer',
}

const dangerButtonStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: '999px',
  padding: '9px 18px',
  fontWeight: 'var(--weight-semibold)',
  cursor: 'pointer',
}

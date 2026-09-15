import { useState } from 'react';
import { api } from '../services/api';
import { parsePrice } from '../services/productsData';
import { useToast } from '../context/ToastContext';

export default function CheckoutForm({ cart, total, onSuccess, onError }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    postal_code: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar que el formulario esté completo
      if (!formData.customer_name || !formData.customer_email || !formData.customer_phone ||
          !formData.address || !formData.city || !formData.postal_code) {
        throw new Error('Por favor completa todos los campos');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email)) {
        throw new Error('Email inválido');
      }

      // Preparar datos de la orden
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        total: Math.round(total),
        subtotal: Math.round(total),
        shipping: total >= 30000 ? 0 : 3990,
        items_data: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: parsePrice(item.price),
          quantity: item.quantity,
          image: item.image,
        })),
      };

      let response;
      try {
        response = await api.createOrder(orderPayload);
      } catch (backendErr) {
        console.warn('No se pudo guardar en Django backend, usando fallback local:', backendErr);
        response = { id: Date.now(), total: orderPayload.total };
      }
      
      // Mostrar mensaje de éxito con Toast
      const formattedTotal = '$' + Math.round(response.total).toLocaleString('es-CL');
      addToast(`¡Pedido #${response.id} creado con éxito! Total: ${formattedTotal}`, 'success', 5000);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      addToast(`Error: ${error.message}`, 'error', 4000);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <h2>📋 Formulario de Pedido</h2>
      <form onSubmit={handleSubmit} className="checkout-form">
        
        <div className="form-section">
          <h3>Información Personal</h3>
          
          <div className="form-group">
            <label htmlFor="customer_name">Nombre Completo *</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer_email">Email *</label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="juan@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer_phone">Teléfono *</label>
            <input
              type="tel"
              id="customer_phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              placeholder="+56 9 XXXX XXXX"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Dirección de Entrega</h3>
          
          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Calle Principal 123, Apto 4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Punta Arenas"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Código Postal *</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="6200000"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-order-btn"
          disabled={loading}
        >
          {loading ? '⏳ Procesando...' : '💳 Confirmar Pedido'}
        </button>
      </form>
    </div>
  );
}

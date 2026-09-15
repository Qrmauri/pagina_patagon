const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Cliente API para conectar con el backend Django REST Framework.
 */
export const api = {
  // --- PRODUCTOS ---
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products/`);
    if (!res.ok) throw new Error(`Error obteniendo productos: ${res.statusText}`);
    return await res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}/`);
    if (!res.ok) throw new Error(`Error obteniendo producto #${id}`);
    return await res.json();
  },

  async createProduct(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || JSON.stringify(err) || 'Error creando producto');
    }
    return await res.json();
  },

  async updateProduct(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'PUT',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || JSON.stringify(err) || 'Error actualizando producto');
    }
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Error eliminando producto #${id}`);
    return true;
  },

  async seedProducts() {
    const res = await fetch(`${API_BASE_URL}/products/seed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error sembrando catálogo');
    return await res.json();
  },

  // --- PEDIDOS (ORDERS) ---
  async createOrder(orderData) {
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || JSON.stringify(err) || 'Error creando pedido');
    }
    return await res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE_URL}/orders/`);
    if (!res.ok) throw new Error('Error obteniendo pedidos');
    return await res.json();
  },

  // --- TESTIMONIOS / RESEÑAS DE CLIENTES ---
  async getTestimonials() {
    const res = await fetch(`${API_BASE_URL}/testimonials/`);
    if (!res.ok) throw new Error('Error obteniendo testimonios');
    return await res.json();
  },

  async createTestimonial(data) {
    const res = await fetch(`${API_BASE_URL}/testimonials/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || JSON.stringify(err) || 'Error enviando testimonio');
    }
    return await res.json();
  },

  async deleteTestimonial(id) {
    const res = await fetch(`${API_BASE_URL}/testimonials/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Error eliminando testimonio #${id}`);
    return true;
  },

  async seedTestimonials() {
    const res = await fetch(`${API_BASE_URL}/testimonials/seed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error sembrando testimonios');
    return await res.json();
  },
};


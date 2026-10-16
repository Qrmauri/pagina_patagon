import { DEMO_MODE, DEMO_COUPONS } from './checkout.js';
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Obtener encabezado Authorization con el token JWT guardado.
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('patagon_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

let refreshingSession = null;

async function refreshSession() {
  const refresh = localStorage.getItem('patagon_refresh_token');
  if (!refresh) return false;
  if (!refreshingSession) {
    refreshingSession = (async () => {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      // No restablecer una sesión que se cerró o cambió mientras esperaba.
      if (!data.access || localStorage.getItem('patagon_refresh_token') !== refresh) return false;
      localStorage.setItem('patagon_access_token', data.access);
      if (data.refresh) localStorage.setItem('patagon_refresh_token', data.refresh);
      return true;
    })().finally(() => { refreshingSession = null; });
  }
  return refreshingSession;
}

async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('patagon_access_token');
  const send = () => fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeader() } });
  const response = await send();
  if (response.status !== 401 || !token) return response;
  const currentToken = localStorage.getItem('patagon_access_token');
  if (!currentToken) return response;
  if (currentToken !== token || await refreshSession()) return send();
  return response;
}

/**
 * Cliente API para conectar con el backend Django REST Framework con soporte JWT.
 */
export const api = {
  async getStoreSettings() {
    const response = await fetch(`${API_BASE_URL}/store-settings/`);
    if (!response.ok) throw new Error('No se pudieron cargar los datos de la tienda. Comprueba el backend.');
    return response.json();
  },

  async saveStoreSettings(data) {
    const response = await authenticatedFetch(`${API_BASE_URL}/store-settings/`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || JSON.stringify(error) || 'No se pudieron guardar los datos de la tienda.');
    }
    return response.json();
  },
  // --- AUTENTICACIÓN JWT ---
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Usuario o contraseña incorrectos');
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem('patagon_access_token', data.access);
    }
    if (data.refresh) {
      localStorage.setItem('patagon_refresh_token', data.refresh);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('patagon_access_token');
    localStorage.removeItem('patagon_refresh_token');
  },

  getStoredToken() {
    return localStorage.getItem('patagon_access_token');
  },

  // --- PRODUCTOS ---
  async getProducts() {
    let res = await fetch(`${API_BASE_URL}/products/`, { headers: getAuthHeader() });
    // Un token vencido no significa que Django esté desconectado.
    if (res.status === 401) res = await fetch(`${API_BASE_URL}/products/`, { headers: {} });
    if (!res.ok) throw new Error(`Error obteniendo productos: ${res.statusText}`);
    return await res.json();
  },

  async getProduct(id) {
    const res = await authenticatedFetch(`${API_BASE_URL}/products/${id}/`);
    if (!res.ok) throw new Error(`Error obteniendo producto #${id}`);
    return await res.json();
  },

  async createProduct(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = {
      ...getAuthHeader(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const res = await authenticatedFetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Tu sesión de administración venció. Vuelve a iniciar sesión para guardar el producto.');
      throw new Error(err.detail || JSON.stringify(err) || 'Error creando producto');
    }
    return await res.json();
  },

  async updateProduct(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = {
      ...getAuthHeader(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const res = await authenticatedFetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Tu sesión de administración venció. Vuelve a iniciar sesión para guardar el producto.');
      throw new Error(err.detail || JSON.stringify(err) || 'Error actualizando producto');
    }
    return await res.json();
  },

  async deleteProduct(id) {
    const res = await authenticatedFetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error(`Error eliminando producto #${id}`);
    return true;
  },

  async seedProducts() {
    const res = await authenticatedFetch(`${API_BASE_URL}/products/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
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
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Error obteniendo pedidos. Requiere permisos de administrador.');
    return await res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error actualizando estado del pedido');
    }
    return await res.json();
  },

  async confirmTransfer(id) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/confirm-payment/`, { method: 'POST', headers: getAuthHeader() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'No se pudo confirmar el pago.');
    return data;
  },

  async trackOrder(id, email) {
    const cleanId = String(id).replace('#', '').trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const res = await fetch(
      `${API_BASE_URL}/orders/track/?id=${encodeURIComponent(cleanId)}&email=${encodeURIComponent(cleanEmail)}`
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No se encontró ningún pedido con ese número y correo.');
    }
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
      headers: {
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error(`Error eliminando testimonio #${id}`);
    return true;
  },

  async seedTestimonials() {
    const res = await fetch(`${API_BASE_URL}/testimonials/seed/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    if (!res.ok) throw new Error('Error sembrando testimonios');
    return await res.json();
  },

  // --- CUPONES DE DESCUENTO ---
  async validateCoupon(code, subtotal = 0, shipping = 0) {
    if (DEMO_MODE) {
      const coupon = DEMO_COUPONS[String(code).trim().toUpperCase()];
      if (!coupon) throw new Error('Cupón inválido');
      if (subtotal < coupon.min_purchase) throw new Error(`Compra mínima: $${coupon.min_purchase.toLocaleString('es-CL')}`);
      return { ...coupon, valid: true, message: `Cupón ${coupon.code} aplicado` };
    }
    const res = await fetch(`${API_BASE_URL}/coupons/validate/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, shipping }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'No se pudo validar el cupón');
    return data;
  },
};

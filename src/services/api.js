import { DEMO_MODE, DEMO_COUPONS } from './checkout.js';
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';
// Las sesiones se usan desde el mismo origen (proxy de Vite o Nginx).
if (!API_BASE_URL.startsWith('/') || API_BASE_URL.startsWith('//')) {
  throw new Error('VITE_API_BASE_URL debe ser una ruta del mismo origen, por ejemplo /api.');
}

export function clearLegacyCredentials() {
  for (const key of ['patagon_access_token', 'patagon_refresh_token', 'patagon_admin_auth']) {
    try { globalThis.localStorage?.removeItem(key); } catch { /* Almacenamiento opcional. */ }
  }
}

async function apiFetch(url, options = {}) {
  const headers = { ...options.headers };
  if (!['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
    // Django rota CSRF al iniciar sesión. Obtener el valor actual evita reintentos de escrituras.
    const session = await fetch(`${API_BASE_URL}/auth/session/`, { credentials: 'same-origin', cache: 'no-store' });
    if (!session.ok) throw new Error('No se pudo comprobar la sesión.');
    const data = await session.json();
    if (!data.csrfToken) throw new Error('No se pudo obtener la protección de la solicitud.');
    headers['X-CSRFToken'] = data.csrfToken;
  }
  return fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
}

export const api = {
  async getStoreSettings() {
    const response = await apiFetch(`${API_BASE_URL}/store-settings/`);
    if (!response.ok) throw new Error('No se pudieron cargar los datos de la tienda. Comprueba el backend.');
    return response.json();
  },

  async saveStoreSettings(data) {
    const response = await apiFetch(`${API_BASE_URL}/store-settings/`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || JSON.stringify(error) || 'No se pudieron guardar los datos de la tienda.');
    }
    return response.json();
  },
  async getSession() {
    const res = await apiFetch(`${API_BASE_URL}/auth/session/`);
    if (!res.ok) throw new Error('No se pudo comprobar la sesión.');
    return res.json();
  },

  async login(username, password) {
    // Retirar credenciales del esquema anterior, sin leerlas ni reutilizarlas.
    clearLegacyCredentials();
    const res = await apiFetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'No se pudo iniciar sesión.');
    return data;
  },

  async logout() {
    const res = await apiFetch(`${API_BASE_URL}/auth/logout/`, { method: 'POST' });
    if (!res.ok) throw new Error('No se pudo cerrar la sesión en el servidor. Inténtalo de nuevo.');
    clearLegacyCredentials();
  },

  // --- PRODUCTOS ---
  async getProducts() {
    const res = await apiFetch(`${API_BASE_URL}/products/`);
    if (!res.ok) throw new Error(`Error obteniendo productos: ${res.statusText}`);
    return await res.json();
  },

  async getProduct(id) {
    const res = await apiFetch(`${API_BASE_URL}/products/${id}/`);
    if (!res.ok) throw new Error(`Error obteniendo producto #${id}`);
    return await res.json();
  },

  async createProduct(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const res = await apiFetch(`${API_BASE_URL}/products/`, {
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
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    };

    const res = await apiFetch(`${API_BASE_URL}/products/${id}/`, {
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
    const res = await apiFetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Error eliminando producto #${id}`);
    return true;
  },

  async seedProducts() {
    const res = await apiFetch(`${API_BASE_URL}/products/seed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Error sembrando catálogo');
    return await res.json();
  },

  // --- PEDIDOS (ORDERS) ---
  async createOrder(orderData) {
    const res = await apiFetch(`${API_BASE_URL}/orders/`, {
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
    const res = await apiFetch(`${API_BASE_URL}/orders/`, {
    });
    if (!res.ok) throw new Error('Error obteniendo pedidos. Requiere permisos de administrador.');
    return await res.json();
  },

  async updateOrderStatus(id, status) {
    const res = await apiFetch(`${API_BASE_URL}/orders/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error actualizando estado del pedido');
    }
    return await res.json();
  },

  async confirmTransfer(id) {
    const res = await apiFetch(`${API_BASE_URL}/orders/${id}/confirm-payment/`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'No se pudo confirmar el pago.');
    return data;
  },

  async trackOrder(token) {
    const res = await apiFetch(`${API_BASE_URL}/orders/track/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Código no válido o vencido.');
    return data;
  },

  // --- TESTIMONIOS / RESEÑAS DE CLIENTES ---
  async getTestimonials(page = 1, paginated = false) {
    const res = await apiFetch(`${API_BASE_URL}/testimonials/?page=${page}`);
    if (!res.ok) throw new Error('Error obteniendo testimonios');
    const data = await res.json();
    return paginated ? data : data.results;
  },

  async approveTestimonial(id) {
    const res = await apiFetch(`${API_BASE_URL}/testimonials/${id}/`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    });
    if (!res.ok) throw new Error('No se pudo aprobar la reseña.');
    return res.json();
  },

  async createTestimonial(data) {
    const res = await apiFetch(`${API_BASE_URL}/testimonials/`, {
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
    const res = await apiFetch(`${API_BASE_URL}/testimonials/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Error eliminando testimonio #${id}`);
    return true;
  },

  async seedTestimonials() {
    const res = await apiFetch(`${API_BASE_URL}/testimonials/seed/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await apiFetch(`${API_BASE_URL}/coupons/validate/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal, shipping }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'No se pudo validar el cupón');
    return data;
  },
};

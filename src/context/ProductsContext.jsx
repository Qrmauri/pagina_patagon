import { useState, useEffect, useCallback } from 'react';
import { parsePrice } from '../services/productsData';
import { api } from '../services/api';
import { ensureCatalogConnection } from '../services/catalogConnection';
import { DEMO_MODE } from '../services/checkout';
import { initialCatalog, presentCatalog } from '../services/catalogMode';

import { ProductsContext } from './products-context';

const STORAGE_KEY = 'patagon-products';

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    let cached = null;
    if (DEMO_MODE) {
      try { cached = localStorage.getItem(STORAGE_KEY); } catch { /* Navegación privada. */ }
    }
    return initialCatalog(cached, DEMO_MODE);
  });

  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Cargar productos del Backend si está corriendo
  const fetchFromBackend = useCallback(async (strict = false) => {
    try {
      const data = await api.getProducts();
      if (!Array.isArray(data)) throw new Error('Respuesta de catálogo inválida');
      const catalog = presentCatalog(data, DEMO_MODE);
      setProducts(catalog);
      setBackendAvailable(true);
      if (DEMO_MODE) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog)); } catch { /* Caché opcional. */ }
      }
      return catalog;
    } catch (err) {
      // Solo la demostración conserva datos locales ante una caída del servidor.
      console.warn('No pudimos consultar el catálogo del servidor.', err.message);
      if (!DEMO_MODE) setProducts([]);
      setBackendAvailable(false);
      if (strict) throw new Error('No pudimos comprobar precios y stock. Intenta nuevamente antes de comprar.', { cause: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Inicia una consulta asíncrona al catálogo externo.
    fetchFromBackend();
  }, [fetchFromBackend]);

  // Solo la demostración utiliza un catálogo local.
  useEffect(() => {
    if (!DEMO_MODE) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error guardando productos en localStorage:', e);
    }
  }, [products]);

  const saveProduct = async (productData, id = null) => {
    await ensureCatalogConnection(backendAvailable, fetchFromBackend);
    const payload = {
      title: productData.title,
      category: productData.category,
      price: parsePrice(productData.price),
      stock: productData.stock !== '' && productData.stock != null ? Math.max(0, parseInt(productData.stock, 10)) : 10,
      description: productData.description,
      characteristics: productData.characteristics || '',
      shopping_needs: Array.isArray(productData.shopping_needs) ? productData.shopping_needs : [],
      gallery: String(productData.galleryText || '').split(/\r?\n/).map(url => url.trim()).filter(Boolean),
      specifications: productData.specifications || {},
      cost_price: productData.cost_price === '' || productData.cost_price == null ? null : Number(productData.cost_price),
    };
    const image = productData.image || '';
    let body;
    if (productData.imageFile instanceof File) {
      body = new FormData();
      Object.entries(payload).forEach(([key, value]) => body.append(key, value && typeof value === 'object' ? JSON.stringify(value) : value ?? ''));
      body.append('image_file', productData.imageFile);
    } else {
      body = { ...payload, ...(!image.startsWith('/products/illustrations/') ? { image } : {}) };
    }
    const saved = presentCatalog([id == null ? await api.createProduct(body) : await api.updateProduct(id, body)], DEMO_MODE)[0];
    setProducts(previous => id == null ? [saved, ...previous] : previous.map(product => product.id === id ? saved : product));
    return saved;
  };

  const addProduct = (data) => saveProduct(data);
  const updateProduct = (id, data) => saveProduct(data, id);

  const deleteProduct = async (id) => {
    await ensureCatalogConnection(backendAvailable, fetchFromBackend);
    await api.deleteProduct(id);
    setProducts(previous => previous.filter(product => product.id !== id));
  };

  const resetToDefault = async () => {
    if (!DEMO_MODE) throw new Error('El catálogo de ejemplo solo está disponible en demostración.');
    await ensureCatalogConnection(backendAvailable, fetchFromBackend);
    await api.seedProducts();
    await fetchFromBackend();
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        backendAvailable,
        refreshProducts: (strict = false) => { setLoading(true); return fetchFromBackend(strict); },
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefault,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}


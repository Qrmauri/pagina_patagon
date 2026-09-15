import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { INITIAL_PRODUCTS, parsePrice } from '../services/productsData';
import { api } from '../services/api';

export const ProductsContext = createContext();

const STORAGE_KEY = 'patagon-products';

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error leyendo productos de localStorage:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Cargar productos del Backend si está corriendo
  const fetchFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        setBackendAvailable(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else if (Array.isArray(data) && data.length === 0) {
        // Si el backend está vacío, lo sembramos con los productos iniciales
        await api.seedProducts();
        const seededData = await api.getProducts();
        setProducts(seededData);
        setBackendAvailable(true);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seededData));
      }
    } catch (err) {
      // Si el servidor de Django no está iniciado, funciona elegantemente con localStorage
      console.warn('Backend Django no detectado o inactivo. Usando almacenamiento local.', err.message);
      setBackendAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFromBackend();
  }, [fetchFromBackend]);

  // Guardar en localStorage como fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error guardando productos en localStorage:', e);
    }
  }, [products]);

  const addProduct = async (productData) => {
    const parsedPrice = parsePrice(productData.price);
    const localProduct = {
      title: productData.title,
      category: productData.category,
      price: parsedPrice,
      description: productData.description,
      image: productData.image || '',
      id: Date.now(),
    };

    if (backendAvailable) {
      try {
        let created;
        if (productData.imageFile instanceof File) {
          const formData = new FormData();
          formData.append('title', productData.title);
          formData.append('category', productData.category);
          formData.append('price', parsedPrice);
          formData.append('description', productData.description);
          formData.append('image_file', productData.imageFile);
          if (productData.image && !productData.image.startsWith('data:')) {
            formData.append('image', productData.image);
          }
          created = await api.createProduct(formData);
        } else {
          created = await api.createProduct({
            title: productData.title,
            category: productData.category,
            price: parsedPrice,
            description: productData.description,
            image: productData.image || '',
          });
        }
        setProducts((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        console.error('Error guardando en backend, recurriendo a local:', err);
      }
    }

    setProducts((prev) => [localProduct, ...prev]);
    return localProduct;
  };

  const updateProduct = async (id, updatedData) => {
    const parsedPrice = parsePrice(updatedData.price);
    const fallbackImage = updatedData.image || '';

    if (backendAvailable) {
      try {
        let updated;
        if (updatedData.imageFile instanceof File) {
          const formData = new FormData();
          formData.append('title', updatedData.title);
          formData.append('category', updatedData.category);
          formData.append('price', parsedPrice);
          formData.append('description', updatedData.description);
          formData.append('image_file', updatedData.imageFile);
          updated = await api.updateProduct(id, formData);
        } else {
          updated = await api.updateProduct(id, {
            title: updatedData.title,
            category: updatedData.category,
            price: parsedPrice,
            description: updatedData.description,
            image: fallbackImage,
          });
        }
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      } catch (err) {
        console.error('Error actualizando en backend, actualizando local:', err);
      }
    }

    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              title: updatedData.title,
              category: updatedData.category,
              price: parsedPrice,
              description: updatedData.description,
              image: fallbackImage,
            }
          : prod
      )
    );
  };


  const deleteProduct = async (id) => {
    if (backendAvailable) {
      try {
        await api.deleteProduct(id);
      } catch (err) {
        console.error('Error eliminando en backend, eliminando local:', err);
      }
    }
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const resetToDefault = async () => {
    if (backendAvailable) {
      try {
        await api.seedProducts();
        await fetchFromBackend();
        return;
      } catch (err) {
        console.error('Error reseteando backend:', err);
      }
    }
    setProducts(INITIAL_PRODUCTS);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        backendAvailable,
        refreshProducts: fetchFromBackend,
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

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductsProvider');
  }
  return context;
}

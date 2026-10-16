export function favoriteIds(raw) {
  try {
    const values = JSON.parse(raw || '[]');
    return Array.isArray(values) ? [...new Set(values.filter(id => ['string', 'number'].includes(typeof id)).map(String))] : [];
  } catch { return []; }
}

export function toggleFavoriteId(ids, id) {
  const key = String(id);
  return ids.includes(key) ? ids.filter(value => value !== key) : [...ids, key];
}

export function productImages(product) {
  const images = [product.image, ...(Array.isArray(product.gallery) ? product.gallery : [])];
  const valid = [...new Set(images.filter(src => typeof src === 'string' && (/^https?:\/\//i.test(src) || /^\/(?!\/)/.test(src))))];
  return valid.length ? valid : ['/product-placeholder.svg'];
}

export const SPECIFICATION_LABELS = { dimensions: 'Medidas o formato', materials: 'Materiales', contents: 'Contenido del paquete', colors: 'Colores o variantes' };

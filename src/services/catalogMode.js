import { INITIAL_PRODUCTS, withCatalogIllustration } from './productsData.js';

export function presentCatalog(products, demoMode) {
  return demoMode ? products.map(withCatalogIllustration) : products;
}

export function initialCatalog(cached, demoMode) {
  // Un catálogo local no es una fuente de precios/stock para una tienda real.
  if (!demoMode) return [];
  try {
    const parsed = JSON.parse(cached);
    if (Array.isArray(parsed) && parsed.length) return presentCatalog(parsed, true);
  } catch { /* La demostración puede empezar sin caché. */ }
  return INITIAL_PRODUCTS;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { favoriteIds, toggleFavoriteId, productImages } from './productExperience.js';
import { filterByNeed } from './shoppingNeeds.js';
import { withCatalogIllustration } from './productsData.js';

test('favoritos toleran datos corruptos y no duplican ni mutan IDs', () => {
  for (const value of ['{}', 'null', 'bad']) assert.deepEqual(favoriteIds(value), []);
  assert.deepEqual(favoriteIds('[1,"1",2,null,{}]'), ['1', '2']);
  const original = ['1'];
  assert.deepEqual(toggleFavoriteId(original, 1), []);
  assert.deepEqual(toggleFavoriteId(original, 2), ['1', '2']);
  assert.deepEqual(original, ['1']);
});

test('galería mantiene imagen principal, quita duplicados y rechaza esquemas inseguros', () => {
  assert.deepEqual(productImages({ image: '/foto.png', gallery: ['/foto.png', 'https://example.com/2.png', 'javascript:alert(1)', '//example.com/a'] }), ['/foto.png', 'https://example.com/2.png']);
  assert.deepEqual(productImages({}), ['/product-placeholder.svg']);
});

test('las etiquetas explícitas prevalecen sobre palabras y no cruzan categorías', () => {
  const products = [
    { id: 1, category: 'libros', title: 'Cuaderno escolar', shopping_needs: ['oficina'] },
    { id: 2, category: 'libros', title: 'Cuaderno escolar', shopping_needs: [] },
    { id: 3, category: 'libros', title: 'Cuaderno escolar' },
  ];
  assert.deepEqual(filterByNeed(products, 'escolar').map(p => p.id), [3]);
  assert.deepEqual(filterByNeed(products, 'oficina').map(p => p.id), [1]);
});

test('ampliar los ejemplos no cambia las imágenes propias ni desordena la migración anterior', () => {
  const product = { title: 'Peluche Clásico', image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cabab?w=400' };
  assert.equal(withCatalogIllustration(product).image, '/products/illustrations/peluche-clasico.webp');
  assert.equal(withCatalogIllustration({ ...product, image: 'https://example.com/foto-propia.png' }).image, 'https://example.com/foto-propia.png');
});

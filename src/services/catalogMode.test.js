import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCatalog, presentCatalog } from './catalogMode.js';

test('el modo real nunca arranca con ejemplos ni con un catálogo local anterior', () => {
  const cached = JSON.stringify([{ id: 1, title: 'Ejemplo viejo', price: 100 }]);
  assert.deepEqual(initialCatalog(cached, false), []);
  assert.deepEqual(initialCatalog(null, false), []);
});

test('el modo real conserva las fotografías del servidor sin sustituirlas por ilustraciones', () => {
  const product = { title: 'Peluche Clásico', image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cabab?w=400' };
  assert.deepEqual(presentCatalog([product], false), [product]);
  assert.equal(presentCatalog([product], true)[0].image, '/products/illustrations/peluche-clasico.webp');
});

test('la demostración conserva su catálogo y tolera una caché inválida', () => {
  assert.ok(initialCatalog('invalid', true).length > 0);
  assert.deepEqual(initialCatalog('[{"id":12,"title":"Propio"}]', true), [{ id: 12, title: 'Propio' }]);
});

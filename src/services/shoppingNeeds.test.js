import test from 'node:test';
import assert from 'node:assert/strict';
import { filterByNeed } from './shoppingNeeds.js';

test('necesidades reconocen tildes y descripciones sin mezclar categorías', () => {
  const products = [
    { id: 1, category: 'libros', title: 'Lápices de colores' },
    { id: 2, category: 'libros', title: 'Carpeta', description: 'Para la oficina' },
    { id: 3, category: 'electrónica', title: 'Lápiz digital' },
    { id: 4, category: 'juguetes', title: 'Peluche' },
  ];
  assert.deepEqual(filterByNeed(products, 'escolar').map(p => p.id), [1]);
  assert.deepEqual(filterByNeed(products, 'oficina').map(p => p.id), [2]);
  assert.deepEqual(filterByNeed(products, 'crear').map(p => p.id), [1]);
  assert.deepEqual(filterByNeed(products, 'regalos').map(p => p.id), [4]);
  assert.equal(products.length, 4);
});

test('no inventa coincidencias y tolera necesidades desconocidas o campos ausentes', () => {
  const products = [{ id: 1, category: 'libros', title: 'Novela' }, {}];
  assert.deepEqual(filterByNeed(products, 'oficina'), []);
  assert.deepEqual(filterByNeed(products, 'desconocida'), products);
  assert.deepEqual(filterByNeed(products, null), products);
});

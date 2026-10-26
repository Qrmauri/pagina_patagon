import test from 'node:test';
import assert from 'node:assert/strict';
import { schoolListRows } from './schoolList.js';

test('la lista escolar usa el catálogo y limita las cantidades al stock restante', () => {
  const products = [
    { id: 1, title: 'Cuaderno', category: 'libros', stock: 5, price: 2490 },
    { id: 2, title: 'Lápices', category: 'libros', stock: 0, price: 3990 },
    { id: 3, title: 'Novela', category: 'libros', stock: 20, price: 9000 },
  ];
  const rows = schoolListRows(products, [{ id: 1, quantity: 3 }], { 1: 9, 2: 1, 3: 1 });
  assert.deepEqual(rows.map(row => [row.product.id, row.remaining, row.quantity, row.total]), [[1, 2, 2, 4980], [2, 0, 0, 0]]);
  assert.equal(products[0].stock, 5);
  assert.equal(schoolListRows(products, [], { 1: 1 })[0].total, 2490);
  assert.deepEqual(schoolListRows([], [], { 1: 3 }), []);
});

test('cantidades inválidas no entran al carrito y los cambios del catálogo se reflejan', () => {
  const product = { id: 1, title: 'Cuaderno', category: 'libros', stock: 5, price: 3000 };
  for (const quantity of [-1, 'abc', Infinity, null, undefined]) {
    assert.equal(schoolListRows([product], [], { 1: quantity })[0].quantity, 0);
  }
  assert.equal(schoolListRows([product], [], { 1: 2.8 })[0].quantity, 2);
  assert.equal(schoolListRows([product], [{ id: 1, quantity: 5 }], { 1: 2 })[0].quantity, 0);
  assert.equal(schoolListRows([{ ...product, stock: 1, price: 4000 }], [], { 1: 2 })[0].total, 4000);
});

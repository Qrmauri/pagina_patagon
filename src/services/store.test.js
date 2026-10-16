import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalog, summarizeSales } from './store.js';

test('filters combine search, price and availability without changing catalog', () => {
  const products = [{ id: 1, title: 'Libro', price: 20000, stock: 0 }, { id: 2, title: 'Libro azul', price: 10000, stock: 3 }];
  assert.deepEqual(filterCatalog(products, { search: 'LIBRO', available: true, maxPrice: '15000' }).map(p => p.id), [2]);
  assert.equal(products.length, 2);
});

test('sales exclude pending, cancelled and demo orders and shipping from ticket', () => {
  const orders = [
    { payment_status: 'paid', status: 'processing', subtotal: 20000, discount_amount: 2000, total: 21990, items_data: [{ id: 1, title: 'Libro', price: 20000, quantity: 1, cost_price: 12000 }] },
    { payment_status: 'pending', status: 'completed', total: 90000 },
    { payment_status: 'paid', status: 'cancelled', total: 90000 },
    { payment_status: 'paid', demo: true, total: 90000 },
  ];
  const summary = summarizeSales(orders);
  assert.equal(summary.count, 1);
  assert.equal(summary.revenue, 18000);
  assert.equal(summary.average, 18000);
  assert.equal(summary.productMargin, 6000);
});

test('missing product costs never masquerade as profit', () => {
  const summary = summarizeSales([{ payment_status: 'paid', status: 'processing', subtotal: 2000, items_data: [{ id: 1, quantity: 1 }] }]);
  assert.equal(summary.productMargin, null);
});

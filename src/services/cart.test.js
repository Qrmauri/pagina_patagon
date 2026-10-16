import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, setCartQuantity, reconcileCart } from './cart.js';

const product = { id: 1, title: 'Libro', price: 1000, stock: 3 };

test('adding repeatedly never exceeds stock and sold-out products cannot be added', () => {
  let cart = addCartItem([], product, 2);
  cart = addCartItem(cart, product, 5);
  assert.equal(cart[0].quantity, 3);
  assert.deepEqual(addCartItem([], { ...product, stock: 0 }, 1), []);
});

test('quantity edits enforce stock, whole units, and removal', () => {
  const cart = addCartItem([], product, 1);
  assert.equal(setCartQuantity(cart, 1, 99)[0].quantity, 3);
  assert.equal(setCartQuantity(cart, 1, 2.8)[0].quantity, 2);
  assert.equal(setCartQuantity(cart, 1, NaN)[0].quantity, 1);
  assert.deepEqual(setCartQuantity(cart, 1, 0), []);
});

test('catalog refresh replaces cached price and lowers quantity to current stock', () => {
  const old = [{ ...product, quantity: 3, numericPrice: 1000 }];
  const result = reconcileCart(old, [{ ...product, price: 2000, stock: 1 }]);
  assert.equal(result.cart[0].price, 2000);
  assert.equal(result.cart[0].numericPrice, 2000);
  assert.equal(result.cart[0].quantity, 1);
  assert.equal(result.changed, true);
  assert.equal(reconcileCart(result.cart, [{ ...product, price: 2000, stock: 1 }]).changed, false);
});

test('deleted and sold-out products are removed, and invalid stored carts are tolerated', () => {
  const old = [{ ...product, quantity: 2 }];
  assert.deepEqual(reconcileCart(old, []).cart, []);
  assert.deepEqual(reconcileCart(old, [{ ...product, stock: 0 }]).cart, []);
  assert.deepEqual(reconcileCart({}, [product]).cart, []);
  assert.deepEqual(reconcileCart([null], [product]).cart, []);
});

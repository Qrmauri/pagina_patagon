import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateCheckout, DEMO_COUPONS } from './checkout.js';

test('free shipping removes the fee exactly once', () => {
  assert.deepEqual(calculateCheckout(15000, DEMO_COUPONS.ENVIOGRATIS), {
    subtotal: 15000, shippingCost: 0, discountAmount: 0, finalTotal: 15000, couponEligible: true,
  });
  assert.equal(calculateCheckout(30000, DEMO_COUPONS.ENVIOGRATIS).finalTotal, 30000);
});
test('percentage discounts follow quantity changes', () => {
  assert.equal(calculateCheckout(15000, DEMO_COUPONS.PATAGON10).discountAmount, 1500);
  assert.equal(calculateCheckout(45000, DEMO_COUPONS.PATAGON10).finalTotal, 40500);
  assert.equal(calculateCheckout(8990, DEMO_COUPONS.PATAGON10).discountAmount, 899);
});
test('fixed coupon minimum is rechecked when the basket changes', () => {
  assert.equal(calculateCheckout(20000, DEMO_COUPONS.BIENVENIDO5).finalTotal, 18990);
  assert.equal(calculateCheckout(15000, DEMO_COUPONS.BIENVENIDO5).discountAmount, 0);
  assert.equal(calculateCheckout(15000, DEMO_COUPONS.BIENVENIDO5).couponEligible, false);
});
test('discounts cannot make the merchandise total negative', () => {
  assert.equal(calculateCheckout(1000, { discount_type: 'fixed', discount_value: 5000 }).finalTotal, 3990);
  assert.equal(calculateCheckout(29999).shippingCost, 3990);
  assert.equal(calculateCheckout(30000).shippingCost, 0);
});

export const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE !== 'false';

export const DEMO_COUPONS = {
  PATAGON10: { code: 'PATAGON10', discount_type: 'percentage', discount_value: 10, min_purchase: 0 },
  ENVIOGRATIS: { code: 'ENVIOGRATIS', discount_type: 'shipping', discount_value: 0, min_purchase: 0 },
  BIENVENIDO5: { code: 'BIENVENIDO5', discount_type: 'fixed', discount_value: 5000, min_purchase: 20000 },
};

export function calculateCheckout(total, coupon = null) {
  const subtotal = Math.max(0, Math.round(Number(total) || 0));
  const eligible = coupon && subtotal >= Number(coupon.min_purchase || 0);
  const shippingCost = subtotal >= 30000 || (eligible && coupon.discount_type === 'shipping') ? 0 : 3990;
  let discountAmount = 0;
  if (eligible && coupon.discount_type === 'percentage') {
    discountAmount = Math.floor(subtotal * Number(coupon.discount_value) / 100);
  } else if (eligible && coupon.discount_type === 'fixed') {
    discountAmount = Number(coupon.discount_value);
  }
  discountAmount = Math.min(subtotal, Math.max(0, discountAmount || 0));
  return { subtotal, shippingCost, discountAmount, finalTotal: subtotal + shippingCost - discountAmount, couponEligible: Boolean(eligible) };
}

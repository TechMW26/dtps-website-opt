import Coupon, { type ICoupon, type CouponDiscountType, type CouponScope } from '@/models/Coupon';

export interface CheckoutProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CouponApplicationResult {
  valid: boolean;
  message: string;
  code: string;
  subtotal: number;
  eligibleSubtotal: number;
  discount: number;
  total: number;
  coupon?: {
    id: string;
    code: string;
    name: string;
    scope: CouponScope;
    applicableProductIds: string[];
    discountType: CouponDiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount?: number | null;
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function normalizeProductId(productId: string) {
  return productId.trim().toLowerCase();
}

export function calculateSubtotal(products: CheckoutProduct[]) {
  return roundCurrency(
    products.reduce((sum, product) => sum + (Number(product.price) * Number(product.quantity || 1)), 0)
  );
}

function toCouponPayload(coupon: ICoupon) {
  return {
    id: coupon._id.toString(),
    code: coupon.code,
    name: coupon.name,
    scope: coupon.scope,
    applicableProductIds: coupon.applicableProductIds,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscountAmount: coupon.maxDiscountAmount ?? null,
  };
}

export function applyCouponToProducts(coupon: ICoupon, products: CheckoutProduct[]): CouponApplicationResult {
  const subtotal = calculateSubtotal(products);

  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is inactive.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, message: 'This coupon is not active yet.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return { valid: false, message: 'This coupon has expired.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `This coupon requires a minimum order amount of Rs ${coupon.minOrderAmount}.`,
      code: coupon.code,
      subtotal,
      eligibleSubtotal: 0,
      discount: 0,
      total: subtotal,
    };
  }

  const applicableIds = new Set(coupon.applicableProductIds.map(normalizeProductId));
  const eligibleProducts = coupon.scope === 'all'
    ? products
    : products.filter((product) => applicableIds.has(normalizeProductId(product.id)));

  const eligibleSubtotal = calculateSubtotal(eligibleProducts);

  if (coupon.scope === 'specific' && eligibleSubtotal <= 0) {
    return {
      valid: false,
      message: 'This coupon is not applicable to the selected product.',
      code: coupon.code,
      subtotal,
      eligibleSubtotal: 0,
      discount: 0,
      total: subtotal,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = eligibleSubtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscountAmount != null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = roundCurrency(Math.max(0, Math.min(discount, eligibleSubtotal)));
  const total = roundCurrency(Math.max(0, subtotal - discount));

  return {
    valid: true,
    message: discount > 0 ? 'Coupon applied successfully.' : 'Coupon is valid but does not change this order.',
    code: coupon.code,
    subtotal,
    eligibleSubtotal,
    discount,
    total,
    coupon: toCouponPayload(coupon),
  };
}

export async function validateCouponForProducts(code: string, products: CheckoutProduct[]): Promise<CouponApplicationResult> {
  const normalizedCode = normalizeCouponCode(code || '');
  const subtotal = calculateSubtotal(products);

  if (!normalizedCode) {
    return {
      valid: false,
      message: 'Please enter a coupon code.',
      code: normalizedCode,
      subtotal,
      eligibleSubtotal: 0,
      discount: 0,
      total: subtotal,
    };
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });
  if (!coupon) {
    return {
      valid: false,
      message: 'Invalid coupon code.',
      code: normalizedCode,
      subtotal,
      eligibleSubtotal: 0,
      discount: 0,
      total: subtotal,
    };
  }

  return applyCouponToProducts(coupon, products);
}
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';

export type CouponScope = 'all' | 'specific';
export type CouponDiscountType = 'percentage' | 'flat';
export interface CheckoutProduct { id: string; name: string; price: number; quantity: number; }
type CouponRecord = {
  _id?: string;
  code: string;
  name: string;
  scope: CouponScope;
  applicableProductIds: string[];
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  isActive: boolean;
};
export interface CouponApplicationResult {
  valid: boolean; message: string; code: string; subtotal: number; eligibleSubtotal: number; discount: number; total: number;
  coupon?: { id: string; code: string; name: string; scope: CouponScope; applicableProductIds: string[]; discountType: CouponDiscountType; discountValue: number; minOrderAmount: number; maxDiscountAmount?: number | null };
}
function roundCurrency(value: number) { return Math.round(value * 100) / 100; }
export function normalizeCouponCode(code: string) { return code.trim().toUpperCase(); }
export function normalizeProductId(productId: string) { return productId.trim().toLowerCase(); }
function toDate(value: Date | string | null | undefined) { return value ? new Date(value) : null; }
function toCouponPayload(coupon: CouponRecord) {
  return { id: String(coupon._id || coupon.code), code: coupon.code, name: coupon.name, scope: coupon.scope, applicableProductIds: coupon.applicableProductIds || [], discountType: coupon.discountType, discountValue: coupon.discountValue, minOrderAmount: coupon.minOrderAmount, maxDiscountAmount: coupon.maxDiscountAmount ?? null };
}
export function calculateSubtotal(products: CheckoutProduct[]) { return roundCurrency(products.reduce((sum, product) => sum + Number(product.price) * Number(product.quantity || 1), 0)); }
export function applyCouponToProducts(coupon: CouponRecord, products: CheckoutProduct[]): CouponApplicationResult {
  const subtotal = calculateSubtotal(products);
  if (!coupon.isActive) return { valid: false, message: 'This coupon is inactive.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  const now = new Date(); const startsAt = toDate(coupon.startsAt); const endsAt = toDate(coupon.endsAt);
  if (startsAt && startsAt > now) return { valid: false, message: 'This coupon is not active yet.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  if (endsAt && endsAt < now) return { valid: false, message: 'This coupon has expired.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  if (coupon.usageLimit != null && Number(coupon.usedCount || 0) >= coupon.usageLimit) return { valid: false, message: 'This coupon has reached its usage limit.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  if (subtotal < Number(coupon.minOrderAmount || 0)) return { valid: false, message: `This coupon requires a minimum order amount of Rs ${coupon.minOrderAmount}.`, code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  const ids = new Set((coupon.applicableProductIds || []).map(normalizeProductId));
  const eligibleProducts = coupon.scope === 'all' ? products : products.filter((product) => ids.has(normalizeProductId(product.id)));
  const eligibleSubtotal = calculateSubtotal(eligibleProducts);
  if (coupon.scope === 'specific' && eligibleSubtotal <= 0) return { valid: false, message: 'This coupon is not applicable to the selected product.', code: coupon.code, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  let discount = coupon.discountType === 'percentage' ? eligibleSubtotal * (Number(coupon.discountValue) / 100) : Number(coupon.discountValue);
  if (coupon.discountType === 'percentage' && coupon.maxDiscountAmount != null) discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  discount = roundCurrency(Math.max(0, Math.min(discount, eligibleSubtotal)));
  return { valid: true, message: discount > 0 ? 'Coupon applied successfully.' : 'Coupon is valid but does not change this order.', code: coupon.code, subtotal, eligibleSubtotal, discount, total: roundCurrency(Math.max(0, subtotal - discount)), coupon: toCouponPayload(coupon) };
}
export async function validateCouponForProducts(code: string, products: CheckoutProduct[]): Promise<CouponApplicationResult> {
  const normalizedCode = normalizeCouponCode(code || ''); const subtotal = calculateSubtotal(products);
  if (!normalizedCode) return { valid: false, message: 'Please enter a coupon code.', code: normalizedCode, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  const snapshot = await getWebsiteDatabase().collection('websiteCoupons').where('code', '==', normalizedCode).limit(1).get();
  if (snapshot.empty) return { valid: false, message: 'Invalid coupon code.', code: normalizedCode, subtotal, eligibleSubtotal: 0, discount: 0, total: subtotal };
  const coupon = serializeDatabaseDocument(snapshot.docs[0].id, snapshot.docs[0].data() as Record<string, unknown>) as unknown as CouponRecord;
  return applyCouponToProducts(coupon, products);
}

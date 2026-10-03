import { META_PIXEL_ID } from './meta-config';
import { sanitizeMetaCustomData } from './meta-policy';
import { generateEventId, trackEvent, gaEvent, type FbqStandardEvent } from './pixel';

const queued = new Set<string>();
const purchases = new Map<string, Promise<boolean>>();
const prefix = `meta:${META_PIXEL_ID}:funnel-v2:`;

/** Mark only after fbq accepts the event; failed attempts can be retried. */
export function trackMetaOnce(event: FbqStandardEvent, key: string, params = {}, persistent = false): boolean {
  const storageKey = `${prefix}${event}:${key}`;
  if (queued.has(storageKey)) return true;
  try {
    if ((persistent ? localStorage : sessionStorage).getItem(storageKey)) { queued.add(storageKey); return true; }
  } catch { /* In-memory dedup still works without storage. */ }
  if (!trackEvent(event, params, { eventID: key })) return false;
  queued.add(storageKey);
  try { (persistent ? localStorage : sessionStorage).setItem(storageKey, '1'); } catch { /* optional */ }
  return true;
}

/** Keep the actual cart unchanged and record a separate selection marker. */
export function storeCheckoutProducts(products: Array<{ price?: number; quantity?: number; [key: string]: unknown }>): void {
  sessionStorage.setItem('checkoutProducts', JSON.stringify(products));
  // Flush after arriving at checkout, so a hard redirect cannot lose AddToCart.
  try { sessionStorage.setItem('meta:cart-selection', JSON.stringify({
    id: generateEventId(), params: sanitizeMetaCustomData({
      value: products.reduce((sum, p) => sum + Number(p.price ?? 0) * Number(p.quantity ?? 1), 0),
      currency: 'INR', num_items: products.reduce((sum, p) => sum + Number(p.quantity ?? 1), 0),
    }),
  })); } catch { /* Optional analytics storage must not stop checkout. */ }
}

export function trackCheckoutArrival(params: Record<string, unknown>): void {
  if (!Object.keys(params).length) return;
  let id: string;
  try {
    const raw = sessionStorage.getItem('meta:cart-selection');
    const selection = raw ? JSON.parse(raw) : null;
    if (selection && typeof selection.id === 'string') {
      id = selection.id;
      trackMetaOnce('AddToCart', `cart_${id}`, sanitizeMetaCustomData(selection.params));
    } else {
      // Direct checkout entry does not invent a cart-add action.
      id = sessionStorage.getItem('meta:checkout-session') || generateEventId();
      sessionStorage.setItem('meta:checkout-session', id);
    }
  } catch { id = 'current-checkout'; }
  trackMetaOnce('InitiateCheckout', `checkout_${id}`, sanitizeMetaCustomData(params));
}

export function isVerifiedPurchase(order: any, requestedId: string): boolean {
  return Boolean(order && order.orderId === requestedId && order.paymentStatus === 'completed'
    && typeof order.total === 'number' && Number.isFinite(order.total) && order.total >= 0
    && Array.isArray(order.products) && order.products.length > 0
    && order.products.every((p: any) => p && Number.isSafeInteger(p.quantity) && p.quantity > 0));
}

/** Success-page only: uses DB status and discounted total before emitting. */
export function trackPurchaseForOrder(orderId: string): Promise<boolean> {
  const existing = purchases.get(orderId);
  if (existing) return existing;
  const work = (async () => {
    try {
      const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!res.ok) return false;
      const data = await res.json();
      const order = data?.order;
      if (!data?.success || !isVerifiedPurchase(order, orderId)) return false;
      const key = `purchase_${orderId}`;
      const storageKey = `${prefix}Purchase:${key}`;
      if (queued.has(storageKey)) return true;
      try { if (localStorage.getItem(storageKey)) return true; } catch { /* optional */ }
      const sent = trackMetaOnce('Purchase', key, sanitizeMetaCustomData({
        value: order.total, currency: 'INR',
        num_items: order.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
      }), true);
      if (sent) {
        // GA reporting is separate; never pass this object to Meta.
        gaEvent('purchase', { transaction_id: orderId, value: order.total, currency: 'INR',
          items: order.products.map((p: any) => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity })) });
      }
      return sent;
    } catch { return false; }
  })();
  purchases.set(orderId, work);
  void work.finally(() => purchases.delete(orderId));
  return work;
}

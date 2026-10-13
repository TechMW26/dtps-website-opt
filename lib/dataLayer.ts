/**
 * The one DataLayer.
 * -----------------------------------------------------------------------------
 * `window.dataLayer` already exists: `app/layout.tsx` creates it for GA4 and
 * `gtag()` pushes every GA4 call through it. Nothing else in the application
 * pushes directly, so this module is the single place that does.
 *
 * Why this exists rather than calling `window.gtag` for everything:
 *
 *   - GA4 wins no matter which path we use — `gtag()` ends up in the same
 *     DataLayer. The DataLayer exists here because it is the documented,
 *     inspectable contract Zappush reads, and because a GTM container added
 *     later would see the same events without code changes.
 *   - Zappush only reads a push that carries a string `event`. Pushes made
 *     before the tracker loads are replayed once consent resolves, so the
 *     queue does not need a readiness check on our side.
 *   - `page_view` and anything starting with `gtm.` are ignored by Zappush,
 *     because the tracker fires its own page view. That is why page views are
 *     deliberately NOT pushed here. See `lib/zappush.ts`.
 *
 * Nothing in this file loads a script or sends anything anywhere on its own;
 * it writes to an array the browser already owns.
 */

import type { ConsentState } from './tracking-consent';
import { isTrackingAllowed } from './tracking-consent';

/** GA4 ecommerce item. Field names follow the GA4 recommended schema. */
export interface DataLayerItem {
  /** Stable, opaque plan identifier. Never a condition or diagnosis. */
  item_id: string;
  /** Generic, non-sensitive label. Never a condition, treatment or plan name. */
  item_name: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
}

/** GA4 ecommerce object. `value` and `currency` live here, not on the items. */
export interface DataLayerEcommerce {
  currency?: string;
  /** Conversion value. Must be a number greater than zero to count as revenue. */
  value?: number;
  transaction_id?: string;
  items?: DataLayerItem[];
}

export interface DataLayerPush {
  /** Required. A push without a string `event` is ignored by Zappush. */
  event: string;
  ecommerce?: DataLayerEcommerce;
  [key: string]: unknown;
}

declare global {
  interface Window {
    // Matches the existing declaration in lib/pixel.ts. Kept as `any[]` rather
    // than `unknown[]` so the two ambient declarations do not conflict.
    dataLayer?: any[];
  }
}

/**
 * Names this adapter must never push.
 *
 *  - `page_view` is ignored by Zappush and would double-count GA4 page views,
 *    which `PixelTracker` already emits through `gaPageView()`.
 *  - `gtm.*` is reserved by Google Tag Manager.
 *  - `purchase` is excluded because our purchase path is served by
 *    `lib/meta-funnel.ts` + `lib/tracking.ts`; pushing it here as well would
 *    create a second Purchase for the same order.
 */
const BLOCKED_EVENTS = new Set(['page_view', 'purchase', 'generate_lead', 'add_payment_info', 'view_item', 'add_to_cart', 'begin_checkout']);

/** Ensure the array exists. Idempotent, and safe on the server. */
export function initDataLayer(): any[] | null {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * Push a GA4-shaped event.
 *
 * Returns `false` — and pushes nothing — when there is no browser, when the
 * event name is blocked, or when the payload is structurally invalid. It never
 * throws: analytics must not be able to break a page.
 */
export function pushEvent(push: DataLayerPush, consent?: ConsentState): boolean {
  if (typeof window === 'undefined') return false;
  if (!push || typeof push.event !== 'string' || push.event.length === 0) return false;
  if (push.event.length > 100) return false;
  if (BLOCKED_EVENTS.has(push.event)) return false;
  if (push.event.startsWith('gtm.')) return false;
  if (consent && !isTrackingAllowed(consent)) return false;

  const target = initDataLayer();
  if (!target) return false;

  try {
    // GA4 requires the previous ecommerce object to be cleared before a new
    // one, or item arrays accumulate across events.
    if (push.ecommerce) target.push({ ecommerce: null });
    target.push({ ...push });
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the GA4 ecommerce block from trusted values.
 *
 * Deliberately does not spread the caller's object: only these fields can
 * leave, so a future change to a plan object cannot leak a name, a coupon code
 * or a condition into the DataLayer. `value` must be finite and > 0 or it is
 * dropped, because Zappush reports no revenue for a zero value.
 */
export function buildEcommerce(input: {
  value?: number;
  currency?: string;
  transactionId?: string;
  items?: DataLayerItem[];
}): DataLayerEcommerce {
  const ecommerce: DataLayerEcommerce = { currency: input.currency ?? 'INR' };
  if (typeof input.value === 'number' && Number.isFinite(input.value) && input.value > 0) {
    ecommerce.value = input.value;
  }
  if (typeof input.transactionId === 'string' && input.transactionId.length > 0 && input.transactionId.length <= 200) {
    ecommerce.transaction_id = input.transactionId;
  }
  if (Array.isArray(input.items) && input.items.length > 0) {
    ecommerce.items = input.items.slice(0, 20).map((item) => ({
      item_id: String(item.item_id).slice(0, 100),
      item_name: String(item.item_name).slice(0, 100),
      ...(typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 ? { price: item.price } : {}),
      ...(typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity) && item.quantity > 0
        ? { quantity: item.quantity }
        : {}),
      ...(typeof item.item_variant === 'string' && item.item_variant ? { item_variant: item.item_variant.slice(0, 100) } : {}),
    }));
  }
  return ecommerce;
}

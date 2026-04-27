/**
 * Meta Pixel helper
 * -----------------------------------------------------------------------------
 * Centralised, dedup-safe wrapper around `fbq`. All app code should track
 * events through these helpers (NEVER call `window.fbq` directly), so we get
 * consistent eventIDs (for Conversions API dedup) and a single place to add /
 * remove pixels in the future.
 *
 * Pixel IDs are read from `window.__META_PIXEL_IDS__` which is populated by
 * the inline script in `app/layout.tsx`. Adding a new pixel ID only requires
 * editing that one array — no other code change needed.
 */

export type FbqStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'Schedule'
  | 'Search'
  | 'SubmitApplication';

export interface FbqEventOptions {
  /** Stable ID for browser ↔ Conversions API deduplication. */
  eventID?: string;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __META_PIXEL_IDS__?: string[];
  }
}

/**
 * Generate a stable event ID. Prefer crypto.randomUUID; fall back to a
 * timestamp+random string for older browsers.
 */
export function generateEventId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Fire a Meta Pixel standard event. Safe to call before fbq has loaded —
 * fbq's own queue (set up by the base snippet) will buffer the call.
 */
export function trackEvent(
  event: FbqStandardEvent,
  params: Record<string, unknown> = {},
  options: FbqEventOptions = {}
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;

  const eventID = options.eventID ?? generateEventId();
  try {
    fbq('track', event, params, { eventID });
  } catch (err) {
    // Never let analytics break the page.
    // eslint-disable-next-line no-console
    console.warn('[pixel] trackEvent failed', err);
  }
}

/** Fire a custom (non-standard) Meta Pixel event. */
export function trackCustom(
  event: string,
  params: Record<string, unknown> = {},
  options: FbqEventOptions = {}
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;

  const eventID = options.eventID ?? generateEventId();
  try {
    fbq('trackCustom', event, params, { eventID });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[pixel] trackCustom failed', err);
  }
}

/* -------------------------------------------------------------------------- */
/* Dedup helpers                                                              */
/* -------------------------------------------------------------------------- */

/** Returns true on the first call per `key` within this browser session. */
export function fireOncePerSession(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storageKey = `pixel:fired:${key}`;
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, '1');
    return true;
  } catch {
    return true; // storage blocked — fail open
  }
}

/* -------------------------------------------------------------------------- */
/* Cart helpers                                                                */
/* -------------------------------------------------------------------------- */

interface CheckoutProduct {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
}

/**
 * Read the cart that pages stash into sessionStorage before navigating to
 * `/checkout`. Returns Meta Pixel-shaped params (value, currency, contents).
 */
export function readCheckoutCartParams(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem('checkoutProducts');
    if (!raw) return {};
    const items = JSON.parse(raw) as CheckoutProduct[];
    if (!Array.isArray(items) || items.length === 0) return {};

    const value = items.reduce(
      (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 1),
      0
    );
    const num_items = items.reduce(
      (sum, item) => sum + Number(item.quantity ?? 1),
      0
    );
    const contents = items.map((item) => ({
      id: String(item.id ?? item.name ?? 'item'),
      quantity: Number(item.quantity ?? 1),
      item_price: Number(item.price ?? 0),
    }));
    const content_ids = contents.map((c) => c.id);
    const content_name = items.map((i) => i.name).filter(Boolean).join(', ');

    return {
      value,
      currency: 'INR',
      num_items,
      content_type: 'product',
      content_ids,
      contents,
      content_name,
    };
  } catch {
    return {};
  }
}

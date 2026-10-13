/**
 * Tracking orchestrator.
 * -----------------------------------------------------------------------------
 * The single entry point application code should call. It fans an action out to
 * the DataLayer (GA4 shape), the existing GA4 helper and the Zappush SDK, and
 * owns the two rules that are easy to get wrong:
 *
 *   Deduplication — every conversion passes through `emitOnce()` with a key
 *   derived from a real identifier (an order id, a submission id, a
 *   cart-selection id). The key is committed only after the send was accepted,
 *   so a transient failure cannot permanently suppress a real conversion.
 *   Without it, a thank-you-page refresh, a React double-invoke, or a second
 *   tap on Buy Now would each count as a new conversion.
 *
 *   Consent — nothing is emitted unless the visitor has granted analytics and
 *   advertising. Contact details are sent through the SDK only, never through
 *   the shared DataLayer, which every script on the page can read.
 *
 * No Meta call is made from this file. Meta delivery stays exactly as it was:
 * the browser allowlist in `lib/pixel.ts`/`lib/meta-funnel.ts` and the
 * suppressed server route in `app/api/meta/capi/route.ts`.
 */

import { pushEvent, buildEcommerce, type DataLayerItem } from './dataLayer';
import { readConsent, isTrackingAllowed } from './tracking-consent';
import { zappushTrack, type ZappushItem } from './zappush';
import { gaEvent, toGaEcomParams } from './pixel';
import { STORE_CURRENCY } from './analyticsConfig';
import { toSafePlan, type SafePlan } from './plan-labels';

/* -------------------------------------------------------------------------- */
/* Deduplication                                                              */
/* -------------------------------------------------------------------------- */

const onceKeys = new Set<string>();

/** Keys claimed but not yet confirmed delivered. */
const pendingKeys = new Set<string>();

function storageKeyFor(key: string): string {
  return `dtps:once:${key}`;
}

function markDelivered(key: string): void {
  onceKeys.add(key);
  pendingKeys.delete(key);
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(storageKeyFor(key), '1');
  } catch {
    /* sessionStorage unavailable — the in-memory set still dedupes this tab. */
  }
}

function alreadyDelivered(key: string): boolean {
  if (onceKeys.has(key)) return true;
  if (typeof window === 'undefined') return false;
  try {
    if (window.sessionStorage.getItem(storageKeyFor(key))) {
      onceKeys.add(key);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Claim a key, send, then commit only on success.
 *
 * A key is marked as delivered **only after the send was accepted**, so a
 * transient failure does not permanently suppress a real conversion for the
 * rest of the session. A key that is claimed but never committed is released
 * when the call returns, which is what allows a retry to succeed.
 *
 * Returns `true` when the caller should emit, and `false` when this conversion
 * has already been delivered (or is already in flight in this same tick).
 */
export function emitOnce(key: string, send: () => boolean): boolean {
  if (typeof window === 'undefined') return false;
  if (alreadyDelivered(key)) return false;
  if (pendingKeys.has(key)) return false;
  pendingKeys.add(key);
  let accepted = false;
  try {
    accepted = send();
  } catch {
    accepted = false;
  }
  if (accepted) markDelivered(key);
  else pendingKeys.delete(key);
  return accepted;
}

/**
 * Test seam: forget every dedup marker, in memory and in sessionStorage.
 * Not used by application code.
 */
export function __resetOnceForTests(): void {
  onceKeys.clear();
  pendingKeys.clear();
  if (typeof window === 'undefined') return;
  try {
    const storage = window.sessionStorage;
    const doomed: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith('dtps:once:')) doomed.push(key);
    }
    for (const key of doomed) storage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Payload shapes                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A trusted cart line. Mirrors what the checkout catalogue returns, plus the
 * page the selection came from so the identifier can be minted consistently
 * with the plan page.
 */
export interface CartLine {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  duration?: string | null;
  page?: string;
}

function toDataLayerItems(lines: CartLine[]): DataLayerItem[] {
  return lines.map((line) => {
    const safe = toSafePlan({
      planId: line.id,
      page: line.page,
      price: line.price,
      quantity: line.quantity,
      duration: line.duration,
    });
    return {
      item_id: safe.item_id,
      item_name: safe.item_name,
      price: safe.price,
      quantity: safe.quantity,
      ...(safe.item_variant ? { item_variant: safe.item_variant } : {}),
    };
  });
}

function toSdkItems(lines: CartLine[]): ZappushItem[] {
  return toDataLayerItems(lines).map((item) => ({
    item_id: item.item_id,
    item_name: item.item_name,
    price: item.price,
    quantity: item.quantity,
    ...(item.item_variant ? { item_variant: item.item_variant } : {}),
  }));
}

export function cartValue(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * (line.quantity ?? 1), 0);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + (line.quantity ?? 1), 0);
}

/* -------------------------------------------------------------------------- */
/* Generic emitters                                                           */
/* -------------------------------------------------------------------------- */

function consentOk(): boolean {
  return isTrackingAllowed(readConsent());
}

/**
 * Page view. GA4 receives it through the existing `gaPageView()` helper in
 * `PixelTracker`; this function only tells Zappush, because Zappush ignores a
 * pushed `page_view` and fires its own on load.
 */
export function trackPageView(pathname: string, title?: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!consentOk()) return false;
  return emitOnce(`pv:${pathname}${window.location.search}`, () =>
    zappushTrack('page_viewed', {
      page_path: pathname,
      ...(title ? { page_title: title } : {}),
    })
  );
}

/** A plan / programme page was viewed. */
export function trackPlanView(input: {
  plan: CartLine;
  page: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  const safe = toSafePlan({
    planId: input.plan.id,
    page: input.page,
    price: input.plan.price,
    quantity: input.plan.quantity ?? 1,
    duration: input.plan.duration,
  });
  if (!consentOk()) return false;

  return emitOnce(`view_item:${safe.item_id}`, () => {
    const pushed = pushEvent(
      {
        event: 'view_item',
        ecommerce: buildEcommerce({
          value: safe.price,
          currency: STORE_CURRENCY,
          items: [{ item_id: safe.item_id, item_name: safe.item_name, price: safe.price, quantity: safe.quantity }],
        }),
      },
      readConsent()
    );

    const tracked = zappushTrack('product_viewed', {
      value: safe.price,
      currency: STORE_CURRENCY,
      items: [safe],
    });
    return pushed || tracked;
  });
}

/** A plan was chosen for purchase. */
export function trackAddToCart(input: { lines: CartLine[]; selectionId: string }): boolean {
  if (typeof window === 'undefined' || input.lines.length === 0) return false;
  if (!consentOk()) return false;

  const value = cartValue(input.lines);
  const items = toDataLayerItems(input.lines);

  return emitOnce(`add_to_cart:${input.selectionId}`, () => {
    const pushed = pushEvent(
      { event: 'add_to_cart', ecommerce: buildEcommerce({ value, currency: STORE_CURRENCY, items }) },
      readConsent()
    );
    const tracked = zappushTrack('product_added_to_cart', {
      value,
      currency: STORE_CURRENCY,
      items: toSdkItems(input.lines),
    });
    return pushed || tracked;
  });
}

/** Checkout started. Mirrors the GA4 `begin_checkout` already emitted. */
export function trackBeginCheckout(input: { lines: CartLine[]; sessionId: string }): boolean {
  if (typeof window === 'undefined' || input.lines.length === 0) return false;
  if (!consentOk()) return false;

  const value = cartValue(input.lines);
  const items = toDataLayerItems(input.lines);

  return emitOnce(`begin_checkout:${input.sessionId}`, () => {
    const pushed = pushEvent(
      { event: 'begin_checkout', ecommerce: buildEcommerce({ value, currency: STORE_CURRENCY, items }) },
      readConsent()
    );
    const tracked = zappushTrack('checkout_started', {
      value,
      currency: STORE_CURRENCY,
      items: toSdkItems(input.lines),
    });
    return pushed || tracked;
  });
}

/** Payment details submitted, once a real order exists and Razorpay opened. */
export function trackAddPaymentInfo(input: {
  lines: CartLine[];
  orderId: string;
  value: number;
  contact?: { email?: string; phone?: string; firstName?: string; lastName?: string };
}): boolean {
  if (typeof window === 'undefined') return false;
  if (!consentOk()) return false;

  const value = Number.isFinite(input.value) && input.value > 0 ? input.value : cartValue(input.lines);
  const items = toDataLayerItems(input.lines);

  return emitOnce(`add_payment_info:${input.orderId}`, () => {
    const pushed = pushEvent(
      {
        event: 'add_payment_info',
        ecommerce: buildEcommerce({ value, currency: STORE_CURRENCY, items }),
      },
      readConsent()
    );
    const tracked = zappushTrack('payment_info_submitted', {
      value,
      currency: STORE_CURRENCY,
      items: toSdkItems(input.lines),
      ...(input.contact?.email ? { email: input.contact.email } : {}),
      ...(input.contact?.phone ? { phone: input.contact.phone } : {}),
      ...(input.contact?.firstName ? { first_name: input.contact.firstName } : {}),
      ...(input.contact?.lastName ? { last_name: input.contact.lastName } : {}),
    });
    return pushed || tracked;
  });
}

/**
 * Confirmed purchase.
 *
 * MUST only be called from a path that has already verified the order against
 * the database — today that is `PixelTracker` on `/checkout/success`, using the
 * same `trackPurchaseForOrder` result the Meta path uses. `transaction_id` is
 * the stable order id, which is what stops a refreshed confirmation page from
 * being counted twice, and it is the value Zappush sends to Meta as `order_id`.
 *
 * Deliberately does not touch GA4 or Meta: `lib/meta-funnel.ts` already emits
 * `gaEvent('purchase')` and drives the Meta path, and a second sender here would
 * double-count.
 */
export function trackVerifiedPurchase(input: {
  orderId: string;
  value: number;
  lines: CartLine[];
  contact?: { email?: string; phone?: string; firstName?: string; lastName?: string; city?: string };
}): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof input.orderId !== 'string' || input.orderId.length === 0) return false;
  if (!consentOk()) return false;
  if (!Number.isFinite(input.value) || input.value <= 0) return false;

  return emitOnce(`purchase:${input.orderId}`, () =>
    zappushTrack('checkout_completed', {
      transaction_id: input.orderId,
      value: input.value,
      currency: STORE_CURRENCY,
      ...(input.lines.length > 0 ? { items: toSdkItems(input.lines) } : {}),
      ...(input.contact?.email ? { email: input.contact.email } : {}),
      ...(input.contact?.phone ? { phone: input.contact.phone } : {}),
      ...(input.contact?.firstName ? { first_name: input.contact.firstName } : {}),
      ...(input.contact?.lastName ? { last_name: input.contact.lastName } : {}),
      ...(input.contact?.city ? { city: input.contact.city } : {}),
    })
  );
}

/**
 * A lead was captured. Only the four documented contact fields are sent —
 * never the service the visitor asked about, and never a free-text answer.
 */
export function trackLead(input: {
  submissionId: string;
  contact: { email?: string | null; phone?: string | null; firstName?: string | null; lastName?: string | null };
  /** Forwarded to GA4 only, because Zappush documents that it must not receive it. */
  gaLeadSource?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  if (!consentOk()) return false;

  const contact = buildContact(input.contact);
  if (Object.keys(contact).length === 0) return false;

  return emitOnce(`generate_lead:${input.submissionId}`, () => {
    pushEvent({ event: 'generate_lead' }, readConsent());
    if (input.gaLeadSource) gaEvent('generate_lead', { lead_source: input.gaLeadSource });
    return zappushTrack('generate_lead', { ...contact });
  });
}

/** An appointment or call was booked. Stronger signal than a form submit. */
export function trackSchedule(input: {
  appointmentId: string;
  contact: { email?: string | null; phone?: string | null; firstName?: string | null; lastName?: string | null };
  /** Forwarded to GA4 only; never to Zappush, which documents that it must not. */
  gaService?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  if (!consentOk()) return false;

  const contact = buildContact(input.contact);
  if (Object.keys(contact).length === 0) return false;

  return emitOnce(`schedule:${input.appointmentId}`, () => {
    if (input.gaService) gaEvent('schedule', { service: input.gaService });
    return zappushTrack('schedule', { ...contact });
  });
}

/**
 * Contact fields, already validated. Zappush reads flat keys on this path, and
 * the four fields are all Meta needs to match a lead.
 */
function buildContact(input: {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): Record<string, string> {
  const contact: Record<string, string> = {};
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254) contact.email = email;
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  if (phone && /^\+?\d{7,15}$/.test(phone.replace(/[^\d+]/g, ''))) contact.phone = phone;
  const first = typeof input.firstName === 'string' ? input.firstName.trim().slice(0, 60) : '';
  if (first) contact.first_name = first;
  const last = typeof input.lastName === 'string' ? input.lastName.trim().slice(0, 60) : '';
  if (last) contact.last_name = last;
  return contact;
}

/** A plan detail view plus its GA4 mirror, from a plan page. */
export function trackPlanViewFromLines(input: { lines: CartLine[]; page: string }): void {
  if (input.lines.length === 0) return;
  const line = input.lines[0];
  const tracked = trackPlanView({ plan: line, page: input.page });
  // The GA4 mirror fires with the same guard, so GA4 and Zappush agree.
  if (!tracked) return;
  const safe: SafePlan = toSafePlan({
    planId: line.id,
    page: input.page,
    price: line.price,
    quantity: line.quantity ?? 1,
    duration: line.duration,
  });
  gaEvent('view_item', toGaEcomParams({
    value: safe.price,
    currency: STORE_CURRENCY,
    contents: [{ id: safe.item_id, quantity: safe.quantity, item_price: safe.price }],
    content_name: safe.item_name,
  }));
}

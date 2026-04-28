'use client';

/**
 * PixelTracker
 * -----------------------------------------------------------------------------
 * Single global component that powers ALL Meta Pixel event tracking. Mounted
 * once in `app/layout.tsx`; new pages get tracking automatically — no per-page
 * wiring needed.
 *
 * Responsibilities:
 *  1. Fire `PageView` on every Next.js client-side route change (the base
 *     snippet only fires on the initial hard load).
 *  2. Globally listen (capture-phase) for clicks on any element that navigates
 *     to `/checkout`, or any element marked with `data-fb-event="EventName"`,
 *     and fire the corresponding pixel event. This means future "Buy Now"
 *     buttons / future plan pages need no extra code as long as they link to
 *     `/checkout` (which is already the existing convention).
 *  3. On the `/checkout/success` page, fire `Purchase` exactly once per
 *     `orderId` — deduped via sessionStorage AND via a stable eventID
 *     (eventID = orderId) so a future Conversions API integration can dedupe
 *     server-side events against this one without code changes here.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  trackEvent,
  fireOncePerSession,
  readCheckoutCartParams,
  generateEventId,
  gaEvent,
  gaPageView,
  toGaEcomParams,
  fireCapi,
} from '@/lib/pixel';

/* -------------------------------------------------------------------------- */
/* Click delegation                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Walk up the DOM from `target` looking for the first element that either:
 *   - has a `data-fb-event` attribute, OR
 *   - is/contains an anchor whose href points to `/checkout` (or absolute
 *     equivalent).
 */
function resolveClickIntent(
  target: EventTarget | null
): { event: string; params: Record<string, unknown> } | null {
  if (!(target instanceof Element)) return null;

  // 1. Explicit opt-in via data attribute (works for ANY future element).
  const explicit = target.closest<HTMLElement>('[data-fb-event]');
  if (explicit) {
    const event = explicit.dataset.fbEvent!;
    const params: Record<string, unknown> = {};
    // Pull any data-fb-* attributes (except data-fb-event itself) as params.
    for (const [key, val] of Object.entries(explicit.dataset)) {
      if (key === 'fbEvent' || !key.startsWith('fb') || val == null) continue;
      const paramKey = key.slice(2, 3).toLowerCase() + key.slice(3);
      // Try to parse numbers / JSON, fall back to string.
      const num = Number(val);
      if (!Number.isNaN(num) && val.trim() !== '') {
        params[paramKey] = num;
      } else {
        try {
          params[paramKey] = JSON.parse(val);
        } catch {
          params[paramKey] = val;
        }
      }
    }
    return { event, params };
  }

  // 2. Implicit: any link / button that takes the user to /checkout.
  const anchor = target.closest<HTMLAnchorElement>('a[href]');
  if (anchor) {
    const href = anchor.getAttribute('href') ?? '';
    if (isCheckoutHref(href)) {
      return { event: 'InitiateCheckout', params: readCheckoutCartParams() };
    }
  }

  return null;
}

function isCheckoutHref(href: string): boolean {
  if (!href) return false;
  if (href === '/checkout' || href.startsWith('/checkout?') || href.startsWith('/checkout#')) {
    return true;
  }
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    return url.pathname === '/checkout';
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Purchase tracking on success page                                          */
/* -------------------------------------------------------------------------- */

interface PurchaseOrder {
  orderId: string;
  total: number;
  paymentStatus?: string;
  products?: Array<{ name?: string; price?: number; quantity?: number; id?: string }>;
  customerEmail?: string;
}

async function firePurchaseForOrder(orderId: string): Promise<void> {
  // Dedup: only fire once per orderId per browser, ever (localStorage), and
  // also use orderId itself as the eventID so server-side CAPI events can
  // dedupe against the browser event.
  const dedupKey = `pixel:purchase:${orderId}`;
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(dedupKey)) {
      return;
    }
  } catch {
    /* storage blocked — proceed */
  }

  try {
    const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`);
    const data = await res.json();
    const order: PurchaseOrder | undefined = data?.order;
    if (!order) return;

    // Only fire for genuinely paid orders.
    const status = (order.paymentStatus ?? '').toLowerCase();
    if (status && !['paid', 'success', 'successful', 'completed'].includes(status)) {
      return;
    }

    const products = order.products ?? [];
    const contents = products.map((p) => ({
      id: String(p.id ?? p.name ?? 'item'),
      quantity: Number(p.quantity ?? 1),
      item_price: Number(p.price ?? 0),
    }));

    const purchaseCustomData = {
      value: Number(order.total ?? 0),
      currency: 'INR',
      content_type: 'product',
      content_ids: contents.map((c) => c.id),
      contents,
      content_name: products.map((p) => p.name).filter(Boolean).join(', '),
      num_items: contents.reduce((s, c) => s + c.quantity, 0),
      order_id: order.orderId,
    };

    trackEvent(
      'Purchase',
      purchaseCustomData,
      // Stable eventID = orderId → dedup with the server-side CAPI Purchase
      // fired from /api/orders verify, AND with this browser-side mirror.
      { eventID: order.orderId }
    );

    // Server-side mirror with the same eventID. The verify endpoint also fires
    // a Purchase server-side using orderId — Meta dedupes all three.
    fireCapi('Purchase', order.orderId, purchaseCustomData, {
      email: order.customerEmail ?? null,
      externalId: order.orderId,
    });

    // Mirror to GA4 ecommerce.
    gaEvent('purchase', {
      transaction_id: order.orderId,
      value: Number(order.total ?? 0),
      currency: 'INR',
      items: contents.map((c, idx) => ({
        item_id: c.id,
        item_name: products[idx]?.name ?? c.id,
        price: c.item_price,
        quantity: c.quantity,
      })),
    });

    try {
      localStorage.setItem(dedupKey, String(Date.now()));
    } catch {
      /* ignore */
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[pixel] Purchase fetch failed', err);
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPageViewKey = useRef<string | null>(null);

  // 1. PageView on every route change (skip the very first one — base snippet
  //    already fired it during the initial HTML load).
  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${searchParams?.toString() ?? ''}`;
    if (lastPageViewKey.current === null) {
      // First render after hydration — base snippet already fired PageView.
      lastPageViewKey.current = key;
      return;
    }
    if (lastPageViewKey.current === key) return;
    lastPageViewKey.current = key;
    const pvEventId = generateEventId();
    trackEvent('PageView', {}, { eventID: pvEventId });
    fireCapi('PageView', pvEventId);
    gaPageView(pathname);
  }, [pathname, searchParams]);

  // 2. Global click delegation for InitiateCheckout / data-fb-event.
  //    NOTE: most existing "BUY NOW" buttons trigger a full page reload via
  //    `window.location.href = '/checkout'`, which kills the fbq queue before
  //    it can flush. Those are caught instead by effect (4) below, which fires
  //    InitiateCheckout when /checkout actually mounts. This delegation still
  //    handles SPA-style `<Link href="/checkout">` and any element opted in
  //    via `data-fb-event`.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const intent = resolveClickIntent(e.target);
      if (!intent) return;
      // Per-click eventID so multiple clicks aren't deduped against each other.
      trackEvent(intent.event as any, intent.params, { eventID: generateEventId() });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true } as any);
  }, []);

  // 3. Purchase on /checkout/success?orderId=...
  useEffect(() => {
    if (pathname !== '/checkout/success') return;
    const orderId = searchParams?.get('orderId');
    if (!orderId) return;
    // fireOncePerSession guards rapid re-renders within the same SPA session;
    // the localStorage check inside firePurchaseForOrder guards across reloads.
    if (!fireOncePerSession(`purchase-attempt:${orderId}`)) return;
    void firePurchaseForOrder(orderId);
  }, [pathname, searchParams]);

  // 4. InitiateCheckout when the /checkout page loads with a cart in
  //    sessionStorage. This is the universal hook that covers every current
  //    and future "BUY NOW" button — they all stash the cart under
  //    `sessionStorage.checkoutProducts` and then navigate here, so adding a
  //    new plan page requires zero pixel code.
  //
  //    Deduped by a cart fingerprint (so refreshing /checkout or coming back
  //    from a failed Razorpay attempt does not re-fire), but new carts in the
  //    same session DO fire (e.g. user buys plan A, abandons, buys plan B).
  useEffect(() => {
    if (pathname !== '/checkout') return;
    const params = readCheckoutCartParams();
    if (!params || Object.keys(params).length === 0) return;

    const fingerprint = JSON.stringify({
      ids: params.content_ids,
      value: params.value,
      n: params.num_items,
    });
    if (!fireOncePerSession(`initiate-checkout:${fingerprint}`)) return;

    // Stable eventID per cart so server-side CAPI dedupes against the browser.
    const eventID = `ic_${(params.content_ids as string[] | undefined)?.join('|') ?? 'cart'}_${params.value ?? 0}`;
    trackEvent('InitiateCheckout', params, { eventID });
    fireCapi('InitiateCheckout', eventID, params);
    gaEvent('begin_checkout', toGaEcomParams(params));
  }, [pathname]);

  return null;
}

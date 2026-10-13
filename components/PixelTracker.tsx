'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, readCheckoutCartParams, gaPageView, gaEvent, toGaEcomParams, fireOncePerSession } from '@/lib/pixel';
import { trackCheckoutArrival, trackPurchaseForOrder } from '@/lib/meta-funnel';
import { trackBeginCheckout, trackPlanViewFromLines, trackVerifiedPurchase, type CartLine } from '@/lib/tracking';

const planPaths = new Set(['/wldtps', '/pcdtps', '/tpdtps', '/thydtps', '/wddtps', '/wldtps-2499', '/299plan',
  '/weight-loss-plan', '/pcod', '/plans/therapeutic', '/plans/wedding', '/weight-loss-plan-2499']);

/**
 * The cart a plan page stashed before handing off to /checkout. Read from
 * sessionStorage so the identifier is minted from the same source the checkout
 * catalogue validates against.
 */
function readStoredCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem('checkoutProducts');
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    return items
      .filter((item) => item && typeof item.id === 'string' && Number.isFinite(Number(item.price)))
      .map((item) => ({
        id: String(item.id),
        name: String(item.name ?? ''),
        price: Number(item.price),
        quantity: Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        duration: typeof item.duration === 'string' ? item.duration : null,
      }));
  } catch {
    return [];
  }
}

export default function PixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPage = useRef<string | null>(null);
  const lastPlan = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = pathname + '?' + (searchParams?.toString() ?? '');
    if (lastPage.current === key) return;
    // The bootstrap handles initial PageView before hydration.
    if (lastPage.current !== null) trackEvent('PageView');
    lastPage.current = key;
    gaPageView(pathname);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (lastPlan.current === pathname) return;
    lastPlan.current = pathname;
    if (!planPaths.has(pathname)) return;
    trackEvent('ViewContent');
    // Zappush/GA4 plan view. Silently does nothing without a stored cart or
    // without consent, and dedupes per plan.
    const lines = readStoredCart();
    if (lines.length > 0) trackPlanViewFromLines({ lines, page: pathname });
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/checkout/success') return;
    const orderId = searchParams?.get('orderId');
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = async (remaining: number) => {
      const sent = await trackPurchaseForOrder(orderId);
      // Zappush mirrors the SAME verified order, using the stable order id as
      // its transaction_id, so a refresh cannot produce a second purchase.
      if (sent) trackVerifiedPurchaseForOrder(orderId);
      if (!sent && !cancelled && remaining > 0) timer = setTimeout(() => void attempt(remaining - 1), 2000);
    };
    void attempt(2);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (pathname !== '/checkout') return;
    const params = readCheckoutCartParams();
    trackCheckoutArrival(params);
    if (Object.keys(params).length && fireOncePerSession('ga-checkout:' + JSON.stringify(params))) {
      gaEvent('begin_checkout', toGaEcomParams(params));
    }
    // Zappush: same cart, same checkout session, deduped against the GA4 path.
    const lines = readStoredCart();
    if (lines.length > 0) {
      const sessionId = readCheckoutSessionId();
      trackBeginCheckout({ lines, sessionId });
    }
  }, [pathname]);

  return null;
}

/**
 * Emit the Zappush purchase for an order the Meta path has already verified.
 *
 * Shares `trackPurchaseForOrder`'s verification rather than trusting the page:
 * the order is re-read from the API, the payment status must be `completed`, and
 * the total must come from the order rather than from anything in the URL.
 */
async function trackVerifiedPurchaseForOrder(orderId: string): Promise<void> {
  try {
    const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return;
    const data = await res.json();
    const order = data?.order;
    if (!data?.success || !order || order.orderId !== orderId || order.paymentStatus !== 'completed') return;
    const total = Number(order.total);
    if (!Number.isFinite(total) || total <= 0) return;

    const lines: CartLine[] = Array.isArray(order.products)
      ? order.products
          .filter((product: any) => product && Number.isFinite(Number(product.price)))
          .map((product: any) => ({
            id: String(product.id ?? product.name ?? 'plan'),
            name: String(product.name ?? ''),
            price: Number(product.price),
            quantity: Number.isSafeInteger(Number(product.quantity)) && Number(product.quantity) > 0 ? Number(product.quantity) : 1,
            duration: typeof product.duration === 'string' ? product.duration : null,
          }))
      : [];

    trackVerifiedPurchase({
      orderId,
      value: total,
      lines,
      contact: {
        email: typeof order.customerEmail === 'string' ? order.customerEmail : undefined,
        phone: typeof order.customerPhone === 'string' ? order.customerPhone : undefined,
        firstName: typeof order.customerName === 'string' ? order.customerName.split(' ')[0] : undefined,
        lastName: typeof order.customerName === 'string' ? order.customerName.split(' ').slice(1).join(' ') : undefined,
        city: typeof order.customerCity === 'string' ? order.customerCity : undefined,
      },
    });
  } catch {
    /* analytics must never break the confirmation page */
  }
}

/** Stable id for one checkout visit, so begin_checkout fires once per arrival. */
function readCheckoutSessionId(): string {
  if (typeof window === 'undefined') return 'checkout';
  try {
    const existing = window.sessionStorage.getItem('dtps:checkout-session');
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem('dtps:checkout-session', id);
    return id;
  } catch {
    return 'checkout';
  }
}

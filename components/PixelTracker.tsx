'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, readCheckoutCartParams, gaPageView, gaEvent, toGaEcomParams, fireOncePerSession } from '@/lib/pixel';
import { trackCheckoutArrival, trackPurchaseForOrder } from '@/lib/meta-funnel';

const planPaths = new Set(['/wldtps', '/pcdtps', '/tpdtps', '/thydtps', '/wddtps', '/wldtps-2499', '/299plan',
  '/weight-loss-plan', '/pcod', '/plans/therapeutic', '/plans/wedding', '/weight-loss-plan-2499']);

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
    if (planPaths.has(pathname)) trackEvent('ViewContent');
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/checkout/success') return;
    const orderId = searchParams?.get('orderId');
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = async (remaining: number) => {
      const sent = await trackPurchaseForOrder(orderId);
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
  }, [pathname]);

  return null;
}

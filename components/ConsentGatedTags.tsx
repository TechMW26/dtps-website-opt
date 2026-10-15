'use client';

import { useEffect, useRef } from 'react';
import { META_PIXEL_BOOTSTRAP, META_PIXEL_QUEUE_STUB } from '@/lib/meta-config';
import { isTrackingAllowed, readConsent, watchConsentOutsideChanges, type ConsentState } from '@/lib/tracking-consent';
import { CONSENT_CHANGED_EVENT } from '@/lib/consent-events';

const GA4_MEASUREMENT_ID = 'G-R647JLBMXD';

const META_BOOTSTRAP_ID = 'meta-pixel-base';
const GA4_LOADER_ID = 'ga4-loader';
const GA4_INIT_ID = 'ga4-init';

/**
 * Loads the Meta Pixel (`fbevents.js`) and Google Analytics 4 (`gtag.js`)
 * scripts only after the visitor grants analytics AND advertising consent. A
 * visitor who denies — or has not yet chosen — makes no request to
 * connect.facebook.net or googletagmanager.com and sets no analytics cookie.
 *
 * The inert `fbq` queue stub is installed unconditionally (below, at module
 * scope) so `trackEvent` calls can buffer before the loader arrives; it makes
 * no network request and sets no cookie on its own. PixelTracker owns the
 * initial PageView and every SPA navigation, all gated by the same consent
 * inside lib/pixel.ts.
 */

// Install the inert fbq queue AND a GA4 dataLayer/gtag buffer synchronously,
// before any event can be emitted. No network, no cookies — they only buffer
// until consent (and the loaders) allow delivery.
if (typeof window !== 'undefined') {
  try {
    // eslint-disable-next-line no-new-func
    new Function(META_PIXEL_QUEUE_STUB)();
  } catch {
    /* the bootstrap installs the same queue; a failure here is not fatal */
  }
  window.dataLayer = window.dataLayer || [];
  window.__GA4_MEASUREMENT_ID__ = window.__GA4_MEASUREMENT_ID__ || GA4_MEASUREMENT_ID;
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      (window.dataLayer as any[]).push(arguments);
    };
  }
}

function injectScript(id: string, src: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function injectInlineScript(id: string, code: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.text = code;
  document.head.appendChild(script);
}

export default function ConsentGatedTags() {
  const installed = useRef(false);

  useEffect(() => {
    const apply = (state: ConsentState) => {
      if (isTrackingAllowed(state)) {
        if (installed.current) return;
        installed.current = true;
        // Meta loader + init (delivers buffered events; no initial PageView here).
        injectInlineScript(META_BOOTSTRAP_ID, META_PIXEL_BOOTSTRAP);
        // GA4 loader + config (send_page_view: false).
        injectScript(GA4_LOADER_ID, `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`);
        injectInlineScript(
          GA4_INIT_ID,
          `window.__GA4_MEASUREMENT_ID__='${GA4_MEASUREMENT_ID}';` +
            `window.dataLayer=window.dataLayer||[];` +
            `function gtag(){dataLayer.push(arguments);}` +
            `window.gtag=gtag;gtag('js',new Date());` +
            `gtag('config','${GA4_MEASUREMENT_ID}',{send_page_view:false});`
        );
      } else if (installed.current) {
        // Consent withdrawn: stop and remove the injected loaders. The fbq queue
        // and window.gtag are left in place (matching Zappush), but every
        // emitter re-checks consent before sending, so nothing leaves.
        installed.current = false;
        for (const id of [META_BOOTSTRAP_ID, GA4_LOADER_ID, GA4_INIT_ID]) {
          document.getElementById(id)?.remove();
        }
      }
    };

    apply(readConsent());

    const stopWatch = watchConsentOutsideChanges(apply);
    const onChanged = (event: Event) => {
      apply((event as CustomEvent<ConsentState>).detail ?? readConsent());
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onChanged);

    return () => {
      stopWatch();
      window.removeEventListener(CONSENT_CHANGED_EVENT, onChanged);
    };
  }, []);

  return null;
}

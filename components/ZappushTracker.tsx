'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ZAPPUSH_QUEUE_STUB,
  ZAPPUSH_TRACKER_SRC,
} from '@/lib/zappush-config';
import {
  DENIED_CONSENT,
  isTrackingAllowed,
  readConsent,
  setConsent,
  watchConsentOutsideChanges,
  type ConsentState,
} from '@/lib/tracking-consent';
import { setZappushConsent, withdrawZappushConsent } from '@/lib/zappush';
import { trackPageView } from '@/lib/tracking';
import { CONSENT_CHANGED_EVENT, onConsentPreferencesOpened, broadcastConsent } from '@/lib/consent-events';
import { ZAPPUSH_CONSENT_KEYS } from '@/lib/zappush-config';

/**
 * Loads the Zappush tracker, but only once the visitor has granted analytics
 * and advertising consent.
 *
 * The script is injected only after a grant and is **not** loaded before one.
 * That is stricter than loading it and then calling `withdrawConsent()`, and it
 * is the reason a denied visitor makes no Zappush request at all.
 */

/** Matches the width of the existing fixed marquee/footer chrome. */
const BOTTOM_BANNER_HEIGHT = '5.5rem';

declare global {
  interface Window {
    __dtpsZappushStubInstalled?: boolean;
  }
}

/** Install the queue stub so SDK calls made before the file arrives are kept. */
function installStub(): void {
  if (typeof window === 'undefined' || window.__dtpsZappushStubInstalled) return;
  window.__dtpsZappushStubInstalled = true;
  try {
    // eslint-disable-next-line no-new-func
    new Function(ZAPPUSH_QUEUE_STUB)();
  } catch {
    /* The tracker file also creates the queue; a failure here is not fatal. */
  }
}

function injectTracker(): void {
  if (typeof document === 'undefined') return;
  // Idempotence by id AND by src, so a fast remount cannot double-inject.
  if (document.getElementById('zappush-tracker')) return;
  if (document.querySelector(`script[src="${ZAPPUSH_TRACKER_SRC}"]`)) return;
  const script = document.createElement('script');
  script.id = 'zappush-tracker';
  script.src = ZAPPUSH_TRACKER_SRC;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Revoke consent and tear the tracker down.
 *
 * Revocation is gated on the SDK capability, never on our own stub flag. The
 * stub is only installed by `installStub()`, while `withdrawConsent` is
 * provided by the vendor file — so a stub flag cannot tell us whether a
 * revocation is possible. `withdrawZappushConsent()` is a safe no-op when the
 * method is absent.
 *
 * The script tag is removed only after the revocation has been attempted. If it
 * were removed first and the revocation then failed, the visitor would be left
 * with a live tracker and no way left to stop it. Removing the tag also revokes
 * our local flag so a later re-grant re-installs cleanly.
 */
function removeTracker(): void {
  if (typeof document === 'undefined') return;
  withdrawZappushConsent();
  window.__dtpsZappushStubInstalled = false;
  const script = document.getElementById('zappush-tracker');
  if (script) script.remove();
  // `window.zappush` and its queue are left in place on purpose: the vendor SDK
  // keeps its own session state, and deleting it would make a re-grant behave
  // differently from a first install. `withdrawConsent` has already told the
  // SDK to stop, and every one of our emitters re-checks consent before sending.
}

export default function ZappushTracker() {
  const pathname = usePathname();
  const [consent, setConsentState] = useState<ConsentState>(() => ({ ...DENIED_CONSENT }));
  const [loaded, setLoaded] = useState(false);
  const [reopened, setReopened] = useState(false);
  const lastPath = useRef<string | null>(null);

  const apply = useCallback((next: ConsentState) => {
    setConsentState(next);
    if (isTrackingAllowed(next)) {
      installStub();
      injectTracker();
      setLoaded(true);
      setZappushConsent(next);
      return;
    }
    removeTracker();
    setLoaded(false);
  }, []);

  // Read consent after mount (the cookie is not available during SSR).
  useEffect(() => {
    apply(readConsent());
    const stopWatching = watchConsentOutsideChanges(apply);
    const stopListening = onConsentPreferencesOpened(() => {
      // Re-ask for a visitor who wants to change their mind. The stored decision
      // is left untouched, so re-opening can never upgrade a denial on its own.
      setReopened(true);
    });
    return () => {
      stopWatching();
      stopListening();
    };
  }, [apply]);

  // A choice made in the banner reaches Zappush without a reload.
  useEffect(() => {
    const onDecision = (event: Event) => {
      const detail = (event as CustomEvent<ConsentState>).detail;
      setReopened(false);
      apply(detail ?? readConsent());
    };
    window.addEventListener(CONSENT_CHANGED_EVENT, onDecision);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onDecision);
  }, [apply]);

  /**
   * SPA navigations. The vendor tracker observes real document loads only, so
   * route changes have to be forwarded here.
   *
   * The gate is a live consent read, not the `loaded` flag alone: after a
   * withdrawal `loaded` is false, but a re-grant that happens in another tab
   * could otherwise leave a stale `lastPath` and suppress the next real
   * navigation. `trackPageView` dedupes by pathname + query and is itself a
   * no-op without consent.
   */
  useEffect(() => {
    if (!pathname) return;
    if (!isTrackingAllowed(readConsent())) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageView(pathname);
  }, [pathname, loaded]);

  const allowed = isTrackingAllowed(consent);
  if (allowed && !reopened) return null;
  return (
    <ConsentBanner
      granted={allowed}
      onDecision={(next) => {
        setReopened(false);
        apply(next);
      }}
      onDismiss={allowed ? () => setReopened(false) : undefined}
    />
  );
}

/**
 * Minimal, accessible consent prompt.
 *
 * Default is denied: dismissing it, ignoring it, or failing to render it all
 * leave tracking off. "Reject optional" is presented as prominently as
 * "Accept all", the region is labelled and keyboard reachable, and the outcome
 * is announced to assistive technology.
 *
 * This is a mechanism, not a claim of legal compliance — see
 * `docs/zappush-integration.md`.
 */
function ConsentBanner({
  granted,
  onDecision,
  onDismiss,
}: {
  granted: boolean;
  onDecision: (state: ConsentState) => void;
  onDismiss?: () => void;
}) {
  const decide = (allow: boolean) => {
    const state = setConsent(
      {
        analytics_storage: allow ? 'granted' : 'denied',
        ad_storage: allow ? 'granted' : 'denied',
        ad_user_data: allow ? 'granted' : 'denied',
        ad_personalization: allow ? 'granted' : 'denied',
      },
      { source: 'banner' }
    );
    broadcastConsent(state);
    onDecision(state);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="dtps-consent-title"
      aria-describedby="dtps-consent-body"
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-black/10 bg-white px-4 py-3 text-[#2E3A3D] shadow-[0_-6px_24px_rgba(0,0,0,0.12)] sm:px-6"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <p id="dtps-consent-title" className="text-sm font-semibold text-[#083F46]">
            Your privacy choices
          </p>
          <p id="dtps-consent-body" className="mt-1 text-xs leading-relaxed sm:text-[13px]">
            We use essential cookies to keep the site secure and your order working. With your permission we
            also use analytics and advertising measurement to understand how the site is used. You can accept
            or reject the optional measurement now, and change your choice at any time on our{' '}
            <a href="/privacy-policy" className="underline">
              privacy page
            </a>
            . Optional measurement stays off unless you accept it.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            className="rounded-lg border border-[#014E4E] px-4 py-2 text-sm font-semibold text-[#014E4E] transition hover:bg-[#014E4E]/5"
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="rounded-lg bg-[#FF850B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e67709]"
          >
            Accept all
          </button>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-[#2E3A3D] transition hover:bg-black/5"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {granted ? 'Optional measurement is on.' : 'Optional measurement is off.'}
      </p>
    </div>
  );
}

/** Exported for tests: the exact script the component is allowed to inject. */
export const __ZAPPUSH_INJECT_SRC = ZAPPUSH_TRACKER_SRC;

/** Exported for tests: the layout width reserved for the consent prompt. */
export const __CONSENT_BANNER_HEIGHT = BOTTOM_BANNER_HEIGHT;

/** Kept referenced so the Consent Mode v2 key list has a runtime consumer. */
export const __ZAPPUSH_CONSENT_KEYS = ZAPPUSH_CONSENT_KEYS;

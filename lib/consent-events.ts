/**
 * Consent change events.
 * -----------------------------------------------------------------------------
 * A tiny seam so the settings UI and the tracker component can talk without
 * importing each other. `lib/tracking-consent.ts` owns the state; this module
 * only broadcasts a decision and lets a visitor reopen the prompt.
 *
 * Kept dependency-free and SSR-safe so it can be called from anywhere.
 */

import { readConsent, type ConsentState } from './tracking-consent';

/** Fired by the settings UI on every accept/reject. */
export const CONSENT_CHANGED_EVENT = 'dtps:consent-changed';

/** Fired when a visitor asks to review their choice again. */
export const CONSENT_OPEN_EVENT = 'dtps:consent-open';

/** Broadcast a new consent state. No-op on the server. */
export function broadcastConsent(state: ConsentState = readConsent()): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
}

/** Ask the consent prompt to reopen, for a "Manage preferences" control. */
export function openConsentPreferences(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** Subscribe to reopened prompts. Returns an unsubscribe function. */
export function onConsentPreferencesOpened(handler: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(CONSENT_OPEN_EVENT, handler);
  return () => window.removeEventListener(CONSENT_OPEN_EVENT, handler);
}

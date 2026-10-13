/**
 * Consent state for non-essential tracking (analytics + advertising).
 * -----------------------------------------------------------------------------
 * There is no third-party consent manager in this project, so this module owns
 * the single source of truth and the browser-storage interface a future banner
 * (or an external CMP) can drive.
 *
 * Two hard rules, both required by the Phase A brief:
 *
 *   1. Denied by default. Anything other than an explicit, current grant is
 *      treated as denied until proven otherwise.
 *   2. Nothing here is allowed to load or activate a tracker on its own. This
 *      module only records a choice; `ZappushTracker` decides whether the
 *      script is fetched.
 *
 * A stored browser preference is NOT proof of valid consent on its own, and the
 * Zappush gate therefore uses the consent COOKIE, which is a first-party
 * cookie the site itself sets only after an explicit choice. An externally
 * managed CMP that speaks Google Consent Mode v2 can take over by calling
 * `applyExternalConsent()` or by writing the same cookie.
 *
 * Legal sufficiency is a policy matter; this module implements the mechanism
 * and does not assert compliance.
 */

/** Google Consent Mode v2 keys that Zappush reads. */
export interface ConsentChoice {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
}

export interface ConsentState extends ConsentChoice {
  /** ISO timestamp of the last explicit choice, or null when never chosen. */
  decidedAt: string | null;
  /** Version of the wording the visitor agreed to. */
  policyVersion: string | null;
  /** Where the decision came from, for debugging and audit. */
  source: 'default' | 'banner' | 'external-cmp';
}

export const CONSENT_POLICY_VERSION = '2026-10-13';

/** Name of the first-party cookie Zappush is gated on. */
export const CONSENT_COOKIE_NAME = 'dtps_consent';

/**
 * Longest-lived consent cookie, in seconds (400 days). This is an upper bound
 * only; `setConsent` accepts a shorter lifetime when a caller knows better.
 */
const MAX_COOKIE_AGE_SECONDS = 400 * 24 * 60 * 60;
const POLICY_VERSION_KEY = 'dtps:consent:policy-version';

/** Everything denied, never decided. The only safe starting point. */
export const DENIED_CONSENT: ConsentState = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  decidedAt: null,
  policyVersion: null,
  source: 'default',
};

export const GRANTED_CHOICE: ConsentChoice = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
};

export const DENIED_CHOICE: ConsentChoice = { ...DENIED_CONSENT };

const listeners = new Set<(state: ConsentState) => void>();

function cookies(): string {
  if (typeof document === 'undefined') return '';
  return document.cookie ?? '';
}

/** Read a first-party cookie without pulling in a dependency. */
function readCookie(name: string): string | null {
  const raw = cookies();
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    try {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Persist the consent cookie.
 *
 * `ageSeconds` lets a caller cap the lifetime more tightly than the 400-day
 * bound, for example when a guardian's consent should lapse at a specific date.
 * When it is not supplied the 400-day bound applies.
 */
function writeConsentCookie(value: string, ageSeconds?: number | null): void {
  if (typeof document === 'undefined') return;
  const maxAge = ageSeconds != null && ageSeconds > 0 ? Math.min(ageSeconds, MAX_COOKIE_AGE_SECONDS) : MAX_COOKIE_AGE_SECONDS;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${Math.floor(maxAge)}; SameSite=Lax${secure}`;
}

function writePolicyVersion(version: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(POLICY_VERSION_KEY, version);
  } catch {
    /* storage unavailable — the cookie remains the authority */
  }
}

/** Delete the consent cookie and every local marker this module owns. */
export function clearConsent(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(POLICY_VERSION_KEY);
      window.localStorage.removeItem('dtps:consent');
    } catch {
      /* ignore */
    }
  }
}

/**
 * Parse a raw consent cookie value into a state. Any malformed, partial or
 * stale value resolves to denied, so a corrupted cookie can never grant
 * tracking. Exported so the logic is testable without a DOM.
 */
export function parseConsent(raw: string | null | undefined): ConsentState {
  if (!raw) return { ...DENIED_CONSENT };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...DENIED_CONSENT };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ...DENIED_CONSENT };
  const data = parsed as Record<string, unknown>;
  if (data.policyVersion !== CONSENT_POLICY_VERSION) return { ...DENIED_CONSENT };
  const keys: Array<keyof ConsentChoice> = ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'];
  const choice = {} as ConsentChoice;
  for (const key of keys) {
    const value = data[key];
    if (value !== 'granted' && value !== 'denied') return { ...DENIED_CONSENT };
    choice[key] = value;
  }
  return {
    ...choice,
    decidedAt: typeof data.decidedAt === 'string' ? data.decidedAt : null,
    policyVersion: CONSENT_POLICY_VERSION,
    source: data.source === 'external-cmp' ? 'external-cmp' : 'banner',
  };
}

/** Read the current consent state from the first-party cookie. */
export function readConsent(): ConsentState {
  return parseConsent(readCookie(CONSENT_COOKIE_NAME));
}

/** True only when the visitor has actively granted both analytics and ads. */
export function isTrackingAllowed(state: ConsentState = readConsent()): boolean {
  return (
    state.policyVersion === CONSENT_POLICY_VERSION &&
    state.analytics_storage === 'granted' &&
    state.ad_storage === 'granted' &&
    state.ad_user_data === 'granted' &&
    state.ad_personalization === 'granted'
  );
}

function emit(state: ConsentState): void {
  for (const listener of listeners) {
    try {
      listener(state);
    } catch {
      /* a broken listener must not break consent handling */
    }
  }
}

/**
 * Record the visitor's explicit choice and notify subscribers.
 *
 * `ageSecondsUntil13thBirthday` is an optional cap for a caller that has already
 * established the visitor's age; this module never infers it.
 */
export function setConsent(
  choice: ConsentChoice,
  options: { source?: ConsentState['source']; ageSecondsUntil13thBirthday?: number | null } = {}
): ConsentState {
  const state: ConsentState = {
    ...choice,
    decidedAt: new Date().toISOString(),
    policyVersion: CONSENT_POLICY_VERSION,
    source: options.source ?? 'banner',
  };
  writeConsentCookie(JSON.stringify(state), options.ageSecondsUntil13thBirthday ?? null);
  writePolicyVersion(CONSENT_POLICY_VERSION);
  emit(state);
  return state;
}

/** Withdraw everything. Equivalent to the Zappush "withdrawn" end state. */
export function withdrawConsent(): ConsentState {
  return setConsent({ ...DENIED_CHOICE }, { source: 'banner' });
}

/**
 * Entry point for an externally managed CMP that already implements Google
 * Consent Mode v2. Only a complete, fully granted set enables tracking; a
 * partial grant is downgraded to denied so Zappush cannot run on a choice the
 * visitor did not actually make.
 */
export function applyExternalConsent(choice: Partial<ConsentChoice>): ConsentState {
  const complete: ConsentChoice = {
    analytics_storage: choice.analytics_storage === 'granted' ? 'granted' : 'denied',
    ad_storage: choice.ad_storage === 'granted' ? 'granted' : 'denied',
    ad_user_data: choice.ad_user_data === 'granted' ? 'granted' : 'denied',
    ad_personalization: choice.ad_personalization === 'granted' ? 'granted' : 'denied',
  };
  const granted = Object.values(complete).every((value) => value === 'granted');
  return setConsent(granted ? complete : { ...DENIED_CHOICE }, { source: 'external-cmp' });
}

/** Subscribe to consent changes. Returns an unsubscribe function. */
export function onConsentChange(listener: (state: ConsentState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Watch the consent cookie so a change made in another tab (or by a CMP that
 * only writes the cookie) is picked up without a reload. Returns a cleanup
 * function. Safe to call on the server.
 */
export function watchConsentOutsideChanges(onChange: (state: ConsentState) => void, intervalMs = 1000): () => void {
  if (typeof window === 'undefined') return () => {};
  let last = JSON.stringify(readConsent());
  const timer = window.setInterval(() => {
    const next = JSON.stringify(readConsent());
    if (next === last) return;
    last = next;
    onChange(readConsent());
  }, intervalMs);
  return () => window.clearInterval(timer);
}

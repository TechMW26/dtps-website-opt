/**
 * Zappush SDK surface.
 * -----------------------------------------------------------------------------
 * A thin, safe wrapper over `window.zappush`. Two rules drive every decision in
 * this file, both taken from Zappush's own documentation:
 *
 *   1. `track()` never translates an event name, while a DataLayer push does.
 *      The Zappush name must be passed to `track()`; passing the GA4 name
 *      produces a custom event (and, for a purchase, a custom event rather than
 *      the standard `Purchase`).
 *   2. A DataLayer push is readable by every script on the page, so contact
 *      details must go through `track()`, which takes them flat.
 *
 * Every function is a no-op on the server and must never throw: tracking is
 * never allowed to break a page or a checkout.
 */

/** Zappush event names (their names, not the GA4 ones). */
export type ZappushEventName =
  | 'page_viewed'
  | 'product_viewed'
  | 'product_added_to_cart'
  | 'checkout_started'
  | 'payment_info_submitted'
  | 'checkout_completed'
  | 'generate_lead'
  | 'schedule'
  | 'search_performed'
  | 'order_refunded';

export interface ZappushItem {
  item_id: string;
  item_name?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
}

/**
 * Flat metadata. Contact keys are read directly by `track()`; there is no
 * `user_data` wrapper on this path.
 */
export interface ZappushMetadata {
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: ZappushItem[];
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    zappush?: {
      track?: (event: string, metadata?: Record<string, unknown>) => void;
      setConsent?: (choice: Record<string, string>) => void;
      withdrawConsent?: () => void;
      q?: unknown[];
    };
  }
}

/** True once the external tracker file has executed and exposed `track`. */
export function isZappushReady(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.zappush?.track === 'function';
}

/**
 * Send one event. Safe before the tracker loads — the install snippet's queue
 * buffers the call and replays it once the file arrives.
 *
 * Returns `false` when there is no browser at all. A queued call returning
 * `true` means "accepted for delivery", not "received by Zappush".
 */
export function zappushTrack(event: ZappushEventName, metadata: ZappushMetadata = {}): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const track = window.zappush?.track;
    if (typeof track !== 'function') return false;
    track(event, sanitizeMetadata(metadata));
    return true;
  } catch {
    return false;
  }
}

/** Report the visitor's Consent Mode v2 choice. Tracker script only. */
export function setZappushConsent(choice: {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
}): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const setConsent = window.zappush?.setConsent;
    if (typeof setConsent !== 'function') return false;
    setConsent({ ...choice });
    return true;
  } catch {
    return false;
  }
}

/**
 * Revoke everything. Zappush then follows the store's "after a shopper
 * withdraws" setting for this and later visits. Data already recorded is kept,
 * which is why the script is not loaded until a grant exists in the first
 * place — see `components/ZappushTracker.tsx`.
 */
export function withdrawZappushConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const withdraw = window.zappush?.withdrawConsent;
    if (typeof withdraw !== 'function') return false;
    withdraw();
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Payload hygiene                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Keys that must never reach Zappush or Meta.
 *
 * Stored already normalised (lowercase, separators stripped) so that the
 * comparison in `isForbidden` is spelling-insensitive: `date_of_birth`,
 * `dateOfBirth`, `Date-Of-Birth` and `DATEOFBIRTH` all resolve to the same
 * entry. A case-sensitive list would let a variant spelling through.
 *
 * This list is defence in depth, not the primary control: emitters in
 * `lib/tracking.ts` build their payloads from scratch. It exists because the
 * lead form collects age, gender, height and weight in the same object it
 * collects an email in, and one spread would be enough to send them.
 *
 * `email`, `phone`, `firstname`, `lastname` and `city` are deliberately NOT
 * listed: a purchase or lead needs them to be matchable. They are sent only
 * through the SDK path, never the shared DataLayer.
 */
const FORBIDDEN_KEYS = new Set([
  'coupon',
  'couponcode',
  'discount',
  'diagnosis',
  'condition',
  'medicalcondition',
  'symptoms',
  'weight',
  'weightloss',
  'height',
  'bmi',
  'age',
  'gender',
  'sex',
  'dateofbirth',
  'dob',
  'birthdate',
  'goal',
  'goals',
  'summary',
  'package',
  'treatment',
  'service',
  'servicename',
  'planname',
  'message',
  'notes',
  'comments',
  'responsedata',
  'customername',
  'customeremail',
  'customerphone',
  'card',
  'cardnumber',
  'cvv',
  'cvc',
  'password',
  'token',
].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, '')));

/** Item-level keys that must never be sent, normalised the same way. */
const FORBIDDEN_ITEM_KEYS = new Set(
  ['item_name_condition', 'item_category', 'condition'].map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, ''))
);

/** Lowercase and strip separators so spelling variants resolve identically. */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isForbidden(key: string, extra?: Set<string>): boolean {
  const normalized = normalizeKey(key);
  if (FORBIDDEN_KEYS.has(normalized)) return true;
  return extra ? extra.has(normalized) : false;
}

function isSafeString(value: string): boolean {
  // Reject anything that reads like a condition or a free-text answer rather
  // than a value. Cheap, and it fails closed.
  return value.length <= 200;
}

/**
 * Copy only scalar fields we explicitly allow. Nothing is spread, so an item
 * array from the cart cannot smuggle in a plan name, coupon or condition.
 */
export function sanitizeMetadata(metadata: ZappushMetadata): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (isForbidden(key)) continue;
    if (value == null) continue;
    if (typeof value === 'string') {
      if (isSafeString(value)) out[key] = value;
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
  }
  if (Array.isArray(metadata.items)) {
    const items = metadata.items
      .slice(0, 20)
      .map((item) => {
        const clean: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          if (isForbidden(key, FORBIDDEN_ITEM_KEYS)) continue;
          if (typeof value === 'string' && isSafeString(value)) clean[key] = value;
          if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value;
        }
        return clean;
      })
      .filter((item) => typeof item.item_id === 'string' && item.item_id.length > 0);
    if (items.length > 0) out.items = items;
  }
  return out;
}

/** Phone in E.164, which is what Zappush needs to match a conversion. */
export function toE164(phone: string | null | undefined, countryIso = 'IN'): string | undefined {
  if (typeof phone !== 'string') return undefined;
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length < 7 || digits.length > 15) return undefined;
  const dial: Record<string, string> = { IN: '91', US: '1', GB: '44', AU: '61', AE: '971' };
  const code = dial[countryIso.toUpperCase()] ?? '';
  if (digits.startsWith(code) && digits.length > code.length + 5) return `+${digits}`;
  return code ? `+${code}${digits.replace(/^0+/, '')}` : `+${digits}`;
}

/**
 * Split a full name the way Zappush documents: first word, then the rest.
 * Never returns the name to the DataLayer — callers must use `track()`.
 */
export function splitName(fullName: string | null | undefined): { first_name?: string; last_name?: string } {
  if (typeof fullName !== 'string') return {};
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  return {
    first_name: parts[0],
    ...(parts.length > 1 ? { last_name: parts.slice(1).join(' ') } : {}),
  };
}

/** Email as entered. Zappush hashes it for matching; we do not alter it here. */
export function normalizeEmail(email: string | null | undefined): string | undefined {
  if (typeof email !== 'string') return undefined;
  const trimmed = email.trim();
  if (trimmed.length < 3 || trimmed.length > 254) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return undefined;
  return trimmed;
}

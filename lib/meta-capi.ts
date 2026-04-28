/**
 * Meta Conversions API (server-side)
 * -----------------------------------------------------------------------------
 * Sends events to Meta over HTTPS so we don't depend on the browser pixel
 * being able to fire (ad blockers, iOS ITP, browser closes before Purchase, …).
 *
 * Browser pixel events and CAPI events share a stable `event_id` per logical
 * event (PageView / InitiateCheckout / AddPaymentInfo / Purchase) so Meta
 * deduplicates them — see lib/pixel.ts and components/PixelTracker.tsx.
 *
 * Env vars (set in Vercel and locally in .env):
 *   META_CAPI_ACCESS_TOKEN     — required, system-user token from Events Manager
 *   META_PIXEL_IDS             — optional, comma-separated; defaults to known IDs
 *   META_CAPI_TEST_EVENT_CODE  — optional, e.g. TEST12345 for Events Manager
 *                                "Test Events" tab. Leave unset in production.
 *   META_CAPI_API_VERSION      — optional override, defaults to v21.0
 */

import crypto from 'crypto';

const DEFAULT_PIXEL_IDS = ['1249607162337272', '451000204060350'];
const DEFAULT_API_VERSION = 'v21.0';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CapiEventName =
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

/** Raw (unhashed) user data — this helper hashes the PII fields for you. */
export interface CapiUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null; // ISO-3166-1 alpha-2 lowercase, e.g. "in"
  /** Meta browser-cookie identifier (cookie name: `_fbp`). */
  fbp?: string | null;
  /** Meta click identifier (cookie name: `_fbc`, or built from `fbclid`). */
  fbc?: string | null;
  /** Client IP (string). Get from request headers, never trust the browser. */
  clientIpAddress?: string | null;
  /** Client user-agent string. */
  clientUserAgent?: string | null;
  /** Optional external ID — we use orderId / a stable session id. */
  externalId?: string | null;
}

export interface CapiEventInput {
  eventName: CapiEventName;
  /** MUST match the eventID used by the browser pixel for dedup. */
  eventId: string;
  /** Unix seconds. Defaults to now. */
  eventTime?: number;
  /** Page URL the event occurred on. */
  eventSourceUrl?: string;
  /** Defaults to "website". */
  actionSource?: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  userData: CapiUserData;
  /** Pixel-shape custom_data: value, currency, contents, content_ids, … */
  customData?: Record<string, unknown>;
}

interface CapiSendResult {
  ok: boolean;
  pixelId: string;
  status: number;
  body?: unknown;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/* Hashing / normalization                                                    */
/* -------------------------------------------------------------------------- */

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  // Meta wants digits only, including country code, no leading +.
  return phone.replace(/[^\d]/g, '');
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function hashIfPresent(value: string | null | undefined, normalize: (v: string) => string = (v) => v): string | undefined {
  if (!value) return undefined;
  const normalized = normalize(String(value));
  if (!normalized) return undefined;
  return sha256(normalized);
}

/** Build the user_data object expected by CAPI from raw inputs. */
function buildUserData(u: CapiUserData): Record<string, unknown> {
  const ud: Record<string, unknown> = {};

  const em = hashIfPresent(u.email, normalizeEmail);
  if (em) ud.em = [em];

  const ph = hashIfPresent(u.phone, normalizePhone);
  if (ph) ud.ph = [ph];

  const fn = hashIfPresent(u.firstName, normalizeName);
  if (fn) ud.fn = [fn];

  const ln = hashIfPresent(u.lastName, normalizeName);
  if (ln) ud.ln = [ln];

  const ct = hashIfPresent(u.city, normalizeName);
  if (ct) ud.ct = [ct];

  const country = u.country ? u.country.trim().toLowerCase() : '';
  if (country) ud.country = [sha256(country)];

  const externalId = hashIfPresent(u.externalId, (v) => v.trim().toLowerCase());
  if (externalId) ud.external_id = [externalId];

  // These are NOT hashed by Meta's spec.
  if (u.fbp) ud.fbp = u.fbp;
  if (u.fbc) ud.fbc = u.fbc;
  if (u.clientIpAddress) ud.client_ip_address = u.clientIpAddress;
  if (u.clientUserAgent) ud.client_user_agent = u.clientUserAgent;

  return ud;
}

/* -------------------------------------------------------------------------- */
/* Sender                                                                     */
/* -------------------------------------------------------------------------- */

function getPixelIds(): string[] {
  const raw = process.env.META_PIXEL_IDS;
  if (!raw) return DEFAULT_PIXEL_IDS;
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ids.length > 0 ? ids : DEFAULT_PIXEL_IDS;
}

function getApiVersion(): string {
  return process.env.META_CAPI_API_VERSION || DEFAULT_API_VERSION;
}

function getAccessToken(): string | null {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || null;
}

/**
 * Send a single event to ALL configured pixels via the Conversions API.
 * Resolves with one result per pixel; never throws (analytics must never
 * break the request flow).
 */
export async function sendCapiEvent(input: CapiEventInput): Promise<CapiSendResult[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    // eslint-disable-next-line no-console
    console.warn('[capi] META_CAPI_ACCESS_TOKEN not set — skipping CAPI send for', input.eventName);
    return [];
  }

  const pixelIds = getPixelIds();
  const apiVersion = getApiVersion();
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim() || undefined;

  const eventTime = input.eventTime ?? Math.floor(Date.now() / 1000);
  const userData = buildUserData(input.userData);

  const dataItem: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: eventTime,
    event_id: input.eventId,
    action_source: input.actionSource ?? 'website',
    user_data: userData,
  };
  if (input.eventSourceUrl) dataItem.event_source_url = input.eventSourceUrl;
  if (input.customData && Object.keys(input.customData).length > 0) {
    dataItem.custom_data = input.customData;
  }

  const payload: Record<string, unknown> = { data: [dataItem] };
  if (testEventCode) payload.test_event_code = testEventCode;

  const results = await Promise.all(
    pixelIds.map(async (pixelId): Promise<CapiSendResult> => {
      const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // Edge & Node both support this; keeps the request from hanging.
          // 8s is plenty for Meta's endpoint.
          signal: AbortSignal.timeout(8000),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.warn('[capi] non-2xx', { pixelId, status: res.status, body });
          return { ok: false, pixelId, status: res.status, body };
        }
        return { ok: true, pixelId, status: res.status, body };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.warn('[capi] send failed', { pixelId, err: msg });
        return { ok: false, pixelId, status: 0, error: msg };
      }
    })
  );

  return results;
}

/* -------------------------------------------------------------------------- */
/* Request helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Parse the Meta `_fbc` cookie. If absent but the URL has `?fbclid=…`, build
 * the standard `fb.1.<ts>.<fbclid>` value per Meta's spec.
 */
export function deriveFbcFromUrl(url: string | null | undefined, existingFbc?: string | null): string | null {
  if (existingFbc) return existingFbc;
  if (!url) return null;
  try {
    const u = new URL(url);
    const fbclid = u.searchParams.get('fbclid');
    if (!fbclid) return null;
    return `fb.1.${Date.now()}.${fbclid}`;
  } catch {
    return null;
  }
}

/**
 * Extract the best client IP from common reverse-proxy headers. Vercel sets
 * `x-forwarded-for` and `x-real-ip`; we also fall back to `cf-connecting-ip`.
 */
export function getClientIp(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    // First entry is the original client.
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-vercel-forwarded-for') ||
    null
  );
}

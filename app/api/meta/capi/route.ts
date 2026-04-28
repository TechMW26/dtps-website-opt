/**
 * Public endpoint that the browser calls to fire a Meta Conversions API event
 * server-side. The browser pixel is fired in parallel with the SAME eventID
 * (see components/PixelTracker.tsx); Meta deduplicates the pair.
 *
 * Body (JSON):
 *   {
 *     event: 'PageView' | 'InitiateCheckout' | ...,
 *     eventId: string,                  // MUST match the browser pixel eventID
 *     eventSourceUrl?: string,          // page URL where the event occurred
 *     customData?: Record<string,unknown>, // value, currency, contents, …
 *     userData?: {                      // optional PII; hashed server-side
 *       email?: string,
 *       phone?: string,
 *       firstName?: string,
 *       lastName?: string,
 *       city?: string,
 *       country?: string,
 *       externalId?: string,
 *     }
 *   }
 *
 * IP, user-agent, _fbp, _fbc, and fbclid are read from the request itself —
 * never from the body — so the browser cannot spoof them.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  sendCapiEvent,
  deriveFbcFromUrl,
  getClientIp,
  type CapiEventName,
  type CapiUserData,
} from '@/lib/meta-capi';

export const runtime = 'nodejs';
// This route is purely an outbound forwarder. Don't let Next try to cache it.
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS: ReadonlySet<CapiEventName> = new Set<CapiEventName>([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Lead',
  'CompleteRegistration',
  'Contact',
  'Schedule',
  'Search',
  'SubmitApplication',
]);

function readCookie(req: NextRequest, name: string): string | null {
  return req.cookies.get(name)?.value ?? null;
}

interface IncomingBody {
  event?: string;
  eventId?: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData?: Partial<CapiUserData>;
}

export async function POST(req: NextRequest) {
  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const event = body.event as CapiEventName | undefined;
  const eventId = body.eventId;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: 'Invalid event' }, { status: 400 });
  }
  if (!eventId || typeof eventId !== 'string' || eventId.length > 200) {
    return NextResponse.json({ ok: false, error: 'Invalid eventId' }, { status: 400 });
  }

  const eventSourceUrl =
    typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : req.headers.get('referer') || undefined;

  // Identifiers come from the request, not from the body.
  const fbp = readCookie(req, '_fbp');
  const fbcCookie = readCookie(req, '_fbc');
  const fbc = deriveFbcFromUrl(eventSourceUrl ?? null, fbcCookie);
  const clientIpAddress = getClientIp(req.headers);
  const clientUserAgent = req.headers.get('user-agent');

  const incomingUd = body.userData ?? {};
  const userData: CapiUserData = {
    email: typeof incomingUd.email === 'string' ? incomingUd.email : undefined,
    phone: typeof incomingUd.phone === 'string' ? incomingUd.phone : undefined,
    firstName: typeof incomingUd.firstName === 'string' ? incomingUd.firstName : undefined,
    lastName: typeof incomingUd.lastName === 'string' ? incomingUd.lastName : undefined,
    city: typeof incomingUd.city === 'string' ? incomingUd.city : undefined,
    country: typeof incomingUd.country === 'string' ? incomingUd.country : undefined,
    externalId: typeof incomingUd.externalId === 'string' ? incomingUd.externalId : undefined,
    fbp,
    fbc,
    clientIpAddress,
    clientUserAgent,
  };

  const customData =
    body.customData && typeof body.customData === 'object' && !Array.isArray(body.customData)
      ? body.customData
      : undefined;

  const results = await sendCapiEvent({
    eventName: event,
    eventId,
    eventSourceUrl,
    userData,
    customData,
  });

  // Never expose Meta's verbose response to the browser.
  return NextResponse.json({
    ok: results.length === 0 ? false : results.every((r) => r.ok),
    sent: results.length,
  });
}

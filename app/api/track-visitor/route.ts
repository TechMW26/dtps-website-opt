import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import { geoLookup, parseUserAgent } from '@/lib/geoip';

/**
 * POST /api/track-visitor
 *
 * Body:
 *   {
 *     sessionId: string,        // generated client-side, persisted in sessionStorage
 *     event: 'pageview' | 'heartbeat',
 *     path: string,
 *     title?: string,
 *     referrer?: string,
 *     language?: string,
 *     durationMs?: number       // sent on heartbeat for the previous page
 *   }
 *
 * Always returns 200 quickly so the client never waits on it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, event, path, title, referrer, language, durationMs } = body || {};
    if (!sessionId || !path) {
      return NextResponse.json({ ok: true });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    await dbConnect();

    let visitor = await Visitor.findOne({ sessionId });

    if (!visitor) {
      // New session – do a one-time geo + UA lookup and write the seed doc.
      const [geo, ua] = await Promise.all([geoLookup(ip), Promise.resolve(parseUserAgent(userAgent))]);
      visitor = await Visitor.create({
        sessionId,
        ip,
        userAgent,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        city: geo.city,
        lat: geo.lat,
        lng: geo.lng,
        isp: geo.isp,
        language,
        referrer,
        landingPath: path,
        pageViews: [{ path, title, referrer, enteredAt: new Date() }],
        sessionStart: new Date(),
        lastSeen: new Date(),
      });
    } else {
      const now = new Date();
      visitor.lastSeen = now;

      if (typeof durationMs === 'number' && durationMs > 0 && visitor.pageViews.length > 0) {
        const last = visitor.pageViews[visitor.pageViews.length - 1];
        last.durationMs = (last.durationMs || 0) + Math.min(durationMs, 30 * 60 * 1000);
        visitor.totalDurationMs = (visitor.totalDurationMs || 0) + Math.min(durationMs, 30 * 60 * 1000);
      }

      if (event === 'pageview') {
        const last = visitor.pageViews[visitor.pageViews.length - 1];
        if (!last || last.path !== path) {
          visitor.pageViews.push({ path, title, referrer, enteredAt: now });
        }
      }

      await visitor.save();
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Tracking must never throw user-facing errors.
    return NextResponse.json({ ok: true });
  }
}

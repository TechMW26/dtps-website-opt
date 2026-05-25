import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware – scoped intentionally narrow:
 *
 *   1. Rate-limit a small set of write/auth endpoints.
 *   2. Gate `/admin/*` and `/api/admin/*` behind a NextAuth JWT.
 *
 * Security HEADERS (CSP, HSTS, X-Frame-Options, etc.) are configured
 * in `next.config.js` so they apply to every response without the
 * middleware having to run on public/static traffic. Keeping the
 * middleware off the public hot path avoids breaking dynamic data
 * fetches and dev-mode HMR websockets.
 */

// ---------- Rate limiter ---------------------------------------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth':        { limit: 30, windowMs: 60 * 1000 },
  '/api/admin-setup': { limit: 3,  windowMs: 10 * 60 * 1000 },
  '/api/orders':      { limit: 30, windowMs: 60 * 1000 },
  '/api/payments':    { limit: 30, windowMs: 60 * 1000 },
  '/api/upload':      { limit: 20, windowMs: 60 * 1000 },
};

function pickRateLimitRule(pathname: string) {
  // NextAuth client calls these frequently for normal app behavior.
  // Do not throttle them to avoid CLIENT_FETCH_ERROR noise.
  if (
    pathname.startsWith('/api/auth/session') ||
    pathname.startsWith('/api/auth/csrf') ||
    pathname.startsWith('/api/auth/providers')
  ) {
    return null;
  }

  for (const prefix of Object.keys(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return RATE_LIMITS[prefix];
  }
  return null;
}

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

let lastSweep = 0;
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

// ---------- Middleware entry ----------------------------------------------

export async function middleware(req: NextRequest) {
  sweep();

  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // 1) Rate limit hot endpoints.
  const rule = pickRateLimitRule(pathname);
  if (rule) {
    const ok = rateLimit(`${ip}:${req.method}:${pathname}`, rule.limit, rule.windowMs);
    if (!ok) {
      const res = new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
      res.headers.set('Retry-After', String(Math.ceil(rule.windowMs / 1000)));
      res.headers.set('x-rate-limit-block', '1');
      return res;
    }
  }

  // 2) Gate admin pages and admin APIs (login + setup stay public).
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin-setup');

  if (isAdminPage || isAdminApi) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (isAdminApi) {
        const res = new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
        res.headers.set('x-auth-block', '1');
        return res;
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('callbackUrl', pathname);
      const res = NextResponse.redirect(url);
      res.headers.set('x-auth-block', '1');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run on admin surface and the rate-limited API prefixes — keeps
  // middleware off the public hot path so dynamic content always loads.
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/auth/:path*',
    '/api/admin-setup/:path*',
    '/api/orders/:path*',
    '/api/payments/:path*',
    '/api/upload/:path*',
  ],
};

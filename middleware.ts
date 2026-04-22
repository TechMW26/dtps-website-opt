import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Global security middleware.
 *
 *   1. Security headers (CSP-lite, HSTS, X-Frame-Options, etc.) are
 *      applied to every response. These complement the static headers
 *      configured in next.config.js.
 *   2. Lightweight in-memory rate limiting on auth & contact endpoints
 *      to blunt brute-force / spam attacks. (Per-instance only – fine
 *      for a single-region deploy; swap for Upstash/Redis if you scale
 *      horizontally.)
 *   3. /admin and /api/admin routes are gated by a NextAuth JWT check
 *      so unauthenticated probes never reach the React tree or APIs.
 *
 * Rate-limit blocks and unauthorized access attempts are tagged on
 * outgoing responses with `x-rate-limit-block: 1` / `x-auth-block: 1`
 * so a Node-runtime route can persist them to the SecurityLog
 * collection (Edge runtime can't use mongoose directly).
 */

// ---------- Rate limiter ---------------------------------------------------

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth':       { limit: 10,  windowMs: 60 * 1000 },        // 10 / min
  '/api/admin-setup':{ limit: 3,   windowMs: 10 * 60 * 1000 },   //  3 / 10min
  '/api/orders':     { limit: 30,  windowMs: 60 * 1000 },        // 30 / min
  '/api/payments':   { limit: 30,  windowMs: 60 * 1000 },
  '/api/upload':     { limit: 20,  windowMs: 60 * 1000 },
};

function pickRateLimitRule(pathname: string) {
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
  if (bucket.count > limit) return false;
  return true;
}

// Periodic cleanup of expired buckets to bound memory.
let lastSweep = 0;
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

// ---------- Security headers ----------------------------------------------

function applySecurityHeaders(res: NextResponse): NextResponse {
  // A CSP that allows the actual third-parties this site uses
  // (ImageKit CDN, Razorpay, Meta Pixel, Google Fonts).
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https://ik.imagekit.io https://www.facebook.com https://*.fbcdn.net https://img.youtube.com https://placehold.co https://randomuser.me",
    "media-src 'self' https://ik.imagekit.io",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://checkout.razorpay.com https://www.youtube.com",
    "frame-src 'self' https://www.youtube.com https://api.razorpay.com https://checkout.razorpay.com",
    "connect-src 'self' https://ik.imagekit.io https://api.razorpay.com https://www.facebook.com https://connect.facebook.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  return res;
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
    const ok = rateLimit(`${ip}:${pathname}`, rule.limit, rule.windowMs);
    if (!ok) {
      const res = new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      );
      res.headers.set('Retry-After', String(Math.ceil(rule.windowMs / 1000)));
      res.headers.set('x-rate-limit-block', '1');
      return applySecurityHeaders(res);
    }
  }

  // 2) Gate admin pages and admin APIs (login + setup endpoints stay public).
  const isAdminPage =
    pathname.startsWith('/admin') &&
    pathname !== '/admin/login';
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin-setup');

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
        return applySecurityHeaders(res);
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('callbackUrl', pathname);
      const res = NextResponse.redirect(url);
      res.headers.set('x-auth-block', '1');
      return applySecurityHeaders(res);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  // Skip static assets so the middleware doesn't run on every chunk request.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

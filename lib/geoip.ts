/**
 * Lightweight IP → geolocation + UA → device parsing.
 *
 * - geoLookup uses the free ip-api.com endpoint (no key, 45 req/min).
 *   Results are cached in-memory by IP for 1 hour to avoid hammering
 *   the upstream service. Failures are swallowed – tracking should
 *   never break a request.
 * - parseUserAgent classifies the device family using simple regex
 *   without pulling in a 200KB ua-parser dependency.
 */

type GeoResult = {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  lat?: number;
  lng?: number;
  isp?: string;
};

const cache = new Map<string, { value: GeoResult; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function geoLookup(ip?: string | null): Promise<GeoResult> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return {};
  }

  const cached = cache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon,isp`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return {};
    const data = await res.json();
    if (data.status !== 'success') return {};
    const value: GeoResult = {
      country: data.country,
      countryCode: data.countryCode,
      region: data.regionName,
      city: data.city,
      lat: typeof data.lat === 'number' ? data.lat : undefined,
      lng: typeof data.lon === 'number' ? data.lon : undefined,
      isp: data.isp,
    };
    cache.set(ip, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch {
    return {};
  }
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';

export function parseUserAgent(ua?: string | null): {
  device: DeviceType;
  browser: string;
  os: string;
} {
  if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' };
  const u = ua.toLowerCase();

  let device: DeviceType = 'desktop';
  if (/bot|spider|crawler|slurp|facebookexternalhit/.test(u)) device = 'bot';
  else if (/ipad|tablet|kindle|silk/.test(u)) device = 'tablet';
  else if (/mobi|iphone|ipod|android.+mobile|blackberry|opera mini/.test(u)) device = 'mobile';

  let browser = 'Other';
  if (u.includes('edg/')) browser = 'Edge';
  else if (u.includes('chrome/')) browser = 'Chrome';
  else if (u.includes('safari/') && !u.includes('chrome/')) browser = 'Safari';
  else if (u.includes('firefox/')) browser = 'Firefox';
  else if (u.includes('opr/') || u.includes('opera/')) browser = 'Opera';

  let os = 'Other';
  if (u.includes('windows')) os = 'Windows';
  else if (u.includes('mac os') || u.includes('macintosh')) os = 'macOS';
  else if (u.includes('android')) os = 'Android';
  else if (u.includes('iphone') || u.includes('ipad') || u.includes('ipod')) os = 'iOS';
  else if (u.includes('linux')) os = 'Linux';

  return { device, browser, os };
}

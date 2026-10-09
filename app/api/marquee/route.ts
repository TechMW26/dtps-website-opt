import { saveSettings, getContent } from '@/lib/website-content';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  DEFAULT_MARQUEE_SETTINGS,
  isSafeMarqueeLink,
  type MarqueeSettings as MarqueeSettingsType,
} from '@/lib/marquee';
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function cleanString(value: unknown, max: number, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, max) : fallback;
}

function cleanOfferText(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function cleanColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback;
}

function cleanDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function sanitizeSettings(body: Record<string, unknown>): MarqueeSettingsType {
  const defaults = DEFAULT_MARQUEE_SETTINGS;
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 25) : [];
  const items = rawItems
    .map((raw) => {
      const item = (raw || {}) as Record<string, unknown>;
      const link = cleanString(item.link, 500);
      if (!isSafeMarqueeLink(link)) {
        throw new Error(`Invalid redirect route for “${cleanString(item.text, 40, 'offer')}”`);
      }
      return {
        text: cleanOfferText(item.text, 240),
        icon: cleanString(item.icon, 500),
        link,
        openInNewTab: Boolean(item.openInNewTab),
        enabled: item.enabled !== false,
      };
    })
    .filter((item) => item.text.trim());

  const rawPages = Array.isArray(body.pages) ? body.pages : ['*'];
  const pages = Array.from(
    new Set(
      rawPages
        .map((page) => cleanString(page, 160))
        .filter((page) => page === '*' || (page.startsWith('/') && !page.startsWith('//')))
    )
  ).slice(0, 30);

  const startAt = cleanDate(body.startAt);
  const endAt = cleanDate(body.endAt);

  return {
    isActive: Boolean(body.isActive),
    items,
    animationMode: body.animationMode === 'static' ? 'static' : 'scroll',
    direction: body.direction === 'right' ? 'right' : 'left',
    speed: clamp(body.speed, 5, 180, defaults.speed),
    pauseOnHover: body.pauseOnHover !== false,
    sticky: Boolean(body.sticky),
    dismissible: Boolean(body.dismissible),
    edgeFade: body.edgeFade !== false,
    showOnDesktop: body.showOnDesktop !== false,
    showOnMobile: body.showOnMobile !== false,
    pages: pages.length ? pages : ['*'],
    startAt: startAt?.toISOString() || null,
    endAt: endAt?.toISOString() || null,
    backgroundColor: cleanColor(body.backgroundColor, defaults.backgroundColor),
    backgroundColorEnd: cleanColor(body.backgroundColorEnd, defaults.backgroundColorEnd),
    useGradient: body.useGradient !== false,
    textColor: cleanColor(body.textColor, defaults.textColor),
    heightDesktop: clamp(body.heightDesktop, 28, 96, defaults.heightDesktop),
    heightMobile: clamp(body.heightMobile, 28, 96, defaults.heightMobile),
    fontSizeDesktop: clamp(body.fontSizeDesktop, 10, 30, defaults.fontSizeDesktop),
    fontSizeMobile: clamp(body.fontSizeMobile, 10, 30, defaults.fontSizeMobile),
    fontWeight: [400, 500, 600, 700, 800].includes(Number(body.fontWeight))
      ? Number(body.fontWeight)
      : defaults.fontWeight,
    iconSize: clamp(body.iconSize, 10, 40, defaults.iconSize),
    uppercase: Boolean(body.uppercase),
    ariaLabel: cleanString(body.ariaLabel, 100, defaults.ariaLabel),
  };
}

export async function GET() {
  try {
    const snapshot = await getWebsiteDatabase().collection('websiteMarquee').where('key', '==', 'global').limit(1).get();
    const settings = snapshot.empty ? null : serializeDatabaseDocument(snapshot.docs[0].id, snapshot.docs[0].data() as Record<string, unknown>);

    return NextResponse.json(
      { settings: settings || DEFAULT_MARQUEE_SETTINGS },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Marquee settings fetch error:', error);
    return NextResponse.json({ error: 'Unable to load top ribbon settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const settings = sanitizeSettings(body);

    if (settings.isActive && !settings.items.some((item) => item.enabled)) {
      return NextResponse.json(
        { error: 'Add and enable at least one offer before turning on the ribbon' },
        { status: 400 }
      );
    }

    if (settings.startAt && settings.endAt && new Date(settings.startAt) >= new Date(settings.endAt)) {
      return NextResponse.json(
        { error: 'The end date must be later than the start date' },
        { status: 400 }
      );
    }

    const saved = await saveSettings('websiteMarquee', settings);

    return NextResponse.json({ settings: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save top ribbon settings';
    console.error('Marquee settings save error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

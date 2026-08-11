import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { DEFAULT_POPUP_SETTINGS, POPUP_PAGE_OPTIONS, withPopupDefaults, type PopupSettings } from '@/lib/popup-settings';
import { getCountry, validatePhone } from '@/lib/validation';
import { parseUserAgent } from '@/lib/geoip';
import Lead from '@/models/Lead';
import PopupBanner from '@/models/PopupBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HEX = /^#[0-9a-f]{6}$/i;
const VALID_PAGES = new Set<string>(POPUP_PAGE_OPTIONS.map((item) => item.value));

type PopupPersistenceSettings = Omit<
  PopupSettings,
  '_id' | 'createdAt' | 'updatedAt' | 'startAt' | 'endAt'
> & {
  startAt: Date | null;
  endAt: Date | null;
};

function text(value: unknown, max: number, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, max) : fallback;
}

function number(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function color(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX.test(value) ? value : fallback;
}

function safeUrl(value: unknown, fallback = '') {
  const candidate = text(value, 1000, fallback);
  if (!candidate) return '';
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate;
  try {
    const url = new URL(candidate);
    if (url.protocol === 'https:' || url.protocol === 'http:') return candidate;
  } catch {}
  throw new Error('Use an internal route or a valid HTTP(S) URL');
}

function date(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) throw new Error('Invalid schedule date');
  return parsed;
}

function sanitize(body: Record<string, unknown>): PopupPersistenceSettings {
  const d = DEFAULT_POPUP_SETTINGS;
  const pages = Array.isArray(body.pages)
    ? [...new Set(body.pages.filter((item): item is string => typeof item === 'string' && VALID_PAGES.has(item)))]
    : [];
  if (!pages.length) throw new Error('Select at least one page');

  const image = safeUrl(body.image);
  if (!image) throw new Error('A popup image is required');
  const startAt = date(body.startAt);
  const endAt = date(body.endAt);
  if (startAt && endAt && endAt <= startAt) throw new Error('End date must be after the start date');

  return {
    title: text(body.title, 120, d.title),
    subtitle: text(body.subtitle, 300, d.subtitle),
    image,
    mobileImage: safeUrl(body.mobileImage),
    pages,
    isActive: body.isActive !== false,
    displayDelayMs: Math.round(number(body.displayDelayMs, 0, 30000, d.displayDelayMs)),
    displayFrequency: ['every_load', 'session', 'daily'].includes(String(body.displayFrequency))
      ? body.displayFrequency as PopupSettings['displayFrequency'] : d.displayFrequency,
    showOnDesktop: body.showOnDesktop !== false,
    showOnMobile: body.showOnMobile !== false,
    startAt,
    endAt,
    priority: Math.round(number(body.priority, 0, 100, d.priority)),
    showPhoneField: body.showPhoneField !== false,
    phonePlaceholder: text(body.phonePlaceholder, 100, d.phonePlaceholder),
    ctaText: text(body.ctaText, 80, d.ctaText),
    redirectUrl: safeUrl(body.redirectUrl),
    openInNewTab: Boolean(body.openInNewTab),
    successMessage: text(body.successMessage, 240, d.successMessage),
    successDelayMs: Math.round(number(body.successDelayMs, 0, 10000, d.successDelayMs)),
    dismissOnOverlay: body.dismissOnOverlay !== false,
    showCloseButton: body.showCloseButton !== false,
    desktopMaxWidth: Math.round(number(body.desktopMaxWidth, 560, 1100, d.desktopMaxWidth)),
    imageFit: body.imageFit === 'cover' ? 'cover' : 'contain',
    accentColor: color(body.accentColor, d.accentColor),
    surfaceColor: color(body.surfaceColor, d.surfaceColor),
    textColor: color(body.textColor, d.textColor),
    overlayOpacity: Math.round(number(body.overlayOpacity, 20, 95, d.overlayOpacity)),
  };
}

async function requireAdmin() {
  return Boolean(await getServerSession(authOptions));
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (searchParams.get('action') === 'getPopup' && page) {
      const now = new Date();
      const popup = await PopupBanner.findOne({
        pages: { $in: [page, '*'] },
        isActive: true,
        $and: [
          { $or: [{ startAt: null }, { startAt: { $exists: false } }, { startAt: { $lte: now } }] },
          { $or: [{ endAt: null }, { endAt: { $exists: false } }, { endAt: { $gte: now } }] },
        ],
      }).sort({ priority: -1, updatedAt: -1 }).lean();

      return NextResponse.json(
        { popup: popup ? withPopupDefaults(popup as unknown as Partial<PopupSettings>) : null, success: true },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const popups = await PopupBanner.find().sort({ priority: -1, createdAt: -1 }).lean();
    return NextResponse.json({ popups: popups.map((popup) => withPopupDefaults(popup as unknown as Partial<PopupSettings>)), success: true });
  } catch (error) {
    console.error('Popup fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch popups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await dbConnect();

    if (body.action === 'saveLead') {
      const countryIso = text(body.countryIso, 2, 'IN').toUpperCase();
      const validation = validatePhone(text(body.phoneNumber, 20), countryIso);
      if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
      const country = getCountry(countryIso);
      const userAgent = request.headers.get('user-agent') || '';
      const parsedUserAgent = parseUserAgent(userAgent);
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const lead = await Lead.create({
        phoneNumber: text(body.phoneNumber, 20).replace(/\D/g, ''),
        countryCode: country.dialCode,
        countryIso: country.code,
        e164: validation.e164,
        page: text(body.page, 80, 'unknown'),
        source: 'popup',
        popupId: text(body.popupId, 100),
        popupTitle: text(body.popupTitle, 120),
        sessionId: text(body.sessionId, 160),
        pageUrl: text(body.pageUrl, 1200),
        referrer: text(body.referrer, 1200),
        language: text(body.language, 40),
        timezone: text(body.timezone, 100),
        device: parsedUserAgent.device,
        browser: parsedUserAgent.browser,
        os: parsedUserAgent.os,
        ip,
        screenWidth: Math.round(number(body.screenWidth, 0, 20000, 0)),
        screenHeight: Math.round(number(body.screenHeight, 0, 20000, 0)),
        viewportWidth: Math.round(number(body.viewportWidth, 0, 20000, 0)),
        viewportHeight: Math.round(number(body.viewportHeight, 0, 20000, 0)),
        utmSource: text(body.utmSource, 200),
        utmMedium: text(body.utmMedium, 200),
        utmCampaign: text(body.utmCampaign, 200),
        utmTerm: text(body.utmTerm, 200),
        utmContent: text(body.utmContent, 200),
        leadStatus: 'new',
      });
      return NextResponse.json({ success: true, message: 'Lead saved successfully', leadId: lead._id });
    }

    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const popup = await PopupBanner.create(sanitize(body));
    return NextResponse.json({ success: true, message: 'Popup created successfully', popup }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    console.error('Popup create/lead error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const id = text(body._id, 80);
    if (!id) return NextResponse.json({ error: 'Popup ID is required' }, { status: 400 });
    await dbConnect();
    const popup = await PopupBanner.findByIdAndUpdate(id, { $set: sanitize(body) }, { new: true, runValidators: true });
    if (!popup) return NextResponse.json({ error: 'Popup not found' }, { status: 404 });
    return NextResponse.json({ popup, success: true, message: 'Popup updated successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update popup';
    console.error('Popup update error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Popup ID is required' }, { status: 400 });
    await dbConnect();
    await PopupBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Popup deleted successfully' });
  } catch (error) {
    console.error('Popup delete error:', error);
    return NextResponse.json({ error: 'Failed to delete popup' }, { status: 500 });
  }
}

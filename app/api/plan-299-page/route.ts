import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import {
  DEFAULT_PLAN_299_SETTINGS,
  isSafePlan299Url,
  type Plan299PageSettings as Plan299SettingsType,
} from '@/lib/plan299-page';
import Plan299PageSettings from '@/models/Plan299PageSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const POSITIONS = ['center', 'top', 'bottom', 'left', 'right'] as const;

function text(value: unknown, max: number, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, max) : fallback;
}

function color(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback;
}

function number(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function safeUrl(value: unknown, max: number, fallback: string) {
  const candidate = text(value, max, fallback);
  if (!isSafePlan299Url(candidate)) throw new Error(`Unsafe URL: ${candidate}`);
  return candidate;
}

function sanitize(body: Record<string, unknown>): Plan299SettingsType {
  const d = DEFAULT_PLAN_299_SETTINGS;
  const desktopBackgroundImage = text(body.desktopBackgroundImage, 1000);
  const mobileBackgroundImage = text(body.mobileBackgroundImage, 1000);

  if (!isSafePlan299Url(desktopBackgroundImage) || !isSafePlan299Url(mobileBackgroundImage)) {
    throw new Error('Background images must use an uploaded, internal, or HTTPS URL');
  }

  return {
    heroLayoutVersion: 3,
    showTextContent: body.showTextContent !== false,
    showPricingCard: body.showPricingCard !== false,
    showPlanBanner: body.showPlanBanner !== false,
    useCustomBackground: Boolean(body.useCustomBackground),
    desktopBackgroundImage,
    mobileBackgroundImage,
    backgroundColor: color(body.backgroundColor, d.backgroundColor),
    backgroundPositionDesktop: POSITIONS.includes(body.backgroundPositionDesktop as typeof POSITIONS[number])
      ? body.backgroundPositionDesktop as Plan299SettingsType['backgroundPositionDesktop'] : d.backgroundPositionDesktop,
    backgroundPositionMobile: POSITIONS.includes(body.backgroundPositionMobile as typeof POSITIONS[number])
      ? body.backgroundPositionMobile as Plan299SettingsType['backgroundPositionMobile'] : d.backgroundPositionMobile,
    overlayColor: color(body.overlayColor, d.overlayColor),
    overlayOpacity: number(body.overlayOpacity, 0, 100, d.overlayOpacity),
    showEyebrow: Boolean(body.showEyebrow),
    eyebrowText: text(body.eyebrowText, 120, d.eyebrowText),
    eyebrowColor: color(body.eyebrowColor, d.eyebrowColor),
    headingLine1Prefix: text(body.headingLine1Prefix, 120, d.headingLine1Prefix),
    headingLine1Highlight: text(body.headingLine1Highlight, 120, d.headingLine1Highlight),
    headingLine2Prefix: text(body.headingLine2Prefix, 120, d.headingLine2Prefix),
    headingLine2Highlight: text(body.headingLine2Highlight, 120, d.headingLine2Highlight),
    headingLine2Suffix: text(body.headingLine2Suffix, 120, d.headingLine2Suffix),
    headingColor: color(body.headingColor, d.headingColor),
    highlightColor: color(body.highlightColor, d.highlightColor),
    description: text(body.description, 500),
    descriptionColor: color(body.descriptionColor, d.descriptionColor),
    showResultBadge: body.showResultBadge !== false,
    resultPrefix: text(body.resultPrefix, 80, d.resultPrefix),
    resultValue: text(body.resultValue, 30, d.resultValue),
    resultSuffix: text(body.resultSuffix, 80, d.resultSuffix),
    resultTextColor: color(body.resultTextColor, d.resultTextColor),
    resultValueColor: color(body.resultValueColor, d.resultValueColor),
    resultBorderColor: color(body.resultBorderColor, d.resultBorderColor),
    resultBackgroundColor: color(body.resultBackgroundColor, d.resultBackgroundColor),
    showHeroButton: Boolean(body.showHeroButton),
    heroButtonText: text(body.heroButtonText, 80, d.heroButtonText),
    heroButtonLink: safeUrl(body.heroButtonLink, 500, d.heroButtonLink),
    heroButtonBackgroundColor: color(body.heroButtonBackgroundColor, d.heroButtonBackgroundColor),
    heroButtonTextColor: color(body.heroButtonTextColor, d.heroButtonTextColor),
    textAlignment: ['left', 'center', 'right'].includes(String(body.textAlignment))
      ? body.textAlignment as Plan299SettingsType['textAlignment'] : d.textAlignment,
    cardPosition: body.cardPosition === 'left' ? 'left' : 'right',
    heroMinHeightDesktop: number(body.heroMinHeightDesktop, 300, 1000, d.heroMinHeightDesktop),
    heroMinHeightMobile: number(body.heroMinHeightMobile, 300, 1400, d.heroMinHeightMobile),
    heroPaddingDesktop: number(body.heroPaddingDesktop, 0, 160, d.heroPaddingDesktop),
    heroPaddingMobile: number(body.heroPaddingMobile, 0, 120, d.heroPaddingMobile),
    cardMaxWidth: number(body.cardMaxWidth, 280, 600, d.cardMaxWidth),
    cardOffsetXDesktop: number(body.cardOffsetXDesktop, -400, 400, d.cardOffsetXDesktop),
    cardOffsetYDesktop: number(body.cardOffsetYDesktop, -300, 300, d.cardOffsetYDesktop),
    cardOffsetXMobile: number(body.cardOffsetXMobile, -120, 120, d.cardOffsetXMobile),
    cardOffsetYMobile: number(body.cardOffsetYMobile, -300, 300, d.cardOffsetYMobile),
    showCardBadge: body.showCardBadge !== false,
    showCardFeatures: body.showCardFeatures !== false,
    showCardDuration: body.showCardDuration !== false,
    showCardBuyButton: body.showCardBuyButton !== false,
    cardSectionTitle: text(body.cardSectionTitle, 100, d.cardSectionTitle),
    cardButtonText: text(body.cardButtonText, 80, d.cardButtonText),
    cardButtonLink: safeUrl(body.cardButtonLink, 500, d.cardButtonLink),
    cardBackgroundColor: color(body.cardBackgroundColor, d.cardBackgroundColor),
    cardButtonBackgroundColor: color(body.cardButtonBackgroundColor, d.cardButtonBackgroundColor),
    cardHeadingColor: color(body.cardHeadingColor, d.cardHeadingColor),
    cardMutedColor: color(body.cardMutedColor, d.cardMutedColor),
    cardFeatureCount: Math.round(number(body.cardFeatureCount, 1, 20, d.cardFeatureCount)),
  };
}

export async function GET() {
  try {
    await dbConnect();
    const settings = await Plan299PageSettings.findOne({ key: 'global' }).lean();
    const mergedSettings = settings
      ? {
          ...DEFAULT_PLAN_299_SETTINGS,
          ...settings,
          ...(!settings.heroLayoutVersion
            ? {
                heroMinHeightDesktop: DEFAULT_PLAN_299_SETTINGS.heroMinHeightDesktop,
                heroPaddingDesktop: DEFAULT_PLAN_299_SETTINGS.heroPaddingDesktop,
              }
            : {}),
          ...(Number(settings.heroLayoutVersion || 0) < 3
            ? {
                heroLayoutVersion: 3,
                heroMinHeightMobile: DEFAULT_PLAN_299_SETTINGS.heroMinHeightMobile,
              }
            : {}),
        }
      : DEFAULT_PLAN_299_SETTINGS;
    return NextResponse.json(
      { settings: mergedSettings },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('₹299 page settings fetch error:', error);
    return NextResponse.json({ error: 'Unable to load ₹299 page settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = sanitize(await req.json());
    if (settings.useCustomBackground && !settings.desktopBackgroundImage && !settings.mobileBackgroundImage) {
      return NextResponse.json({ error: 'Upload at least one background image before enabling the custom background' }, { status: 400 });
    }

    await dbConnect();
    const saved = await Plan299PageSettings.findOneAndUpdate(
      { key: 'global' },
      { $set: { ...settings, key: 'global' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ settings: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save ₹299 page settings';
    console.error('₹299 page settings save error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

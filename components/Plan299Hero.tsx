'use client';
import { toPublicUrl } from '@/lib/public-routes';

import type { CSSProperties, ReactNode } from 'react';
import type { Plan299PageSettings } from '@/lib/plan299-page';

interface Plan299HeroProps {
  settings: Plan299PageSettings;
  cardContent?: ReactNode;
}

type HeroStyle = CSSProperties & Record<`--${string}`, string>;

function alignmentClasses(alignment: Plan299PageSettings['textAlignment']) {
  if (alignment === 'left') return 'items-start text-left';
  if (alignment === 'right') return 'items-end text-right';
  return 'items-center text-center';
}

export default function Plan299Hero({ settings, cardContent }: Plan299HeroProps) {
  const desktopImage = settings.desktopBackgroundImage || settings.mobileBackgroundImage;
  const mobileImage = settings.mobileBackgroundImage || settings.desktopBackgroundImage;
  const hasCard = settings.showPricingCard && Boolean(cardContent);
  const hasText = settings.showTextContent;
  const style: HeroStyle = {
    '--plan299-height-desktop': `${settings.heroMinHeightDesktop}px`,
    '--plan299-height-mobile': `${settings.heroMinHeightMobile}px`,
    '--plan299-padding-desktop': `${settings.heroPaddingDesktop}px`,
    '--plan299-padding-mobile': `${settings.heroPaddingMobile}px`,
    '--plan299-card-x-desktop': `${settings.cardOffsetXDesktop}px`,
    '--plan299-card-y-desktop': `${settings.cardOffsetYDesktop}px`,
    '--plan299-card-x-mobile': `${settings.cardOffsetXMobile}px`,
    '--plan299-card-y-mobile': `${settings.cardOffsetYMobile}px`,
  };
  const sectionStyle: HeroStyle = {
    ...style,
    '--plan299-card-width': `${settings.cardMaxWidth}px`,
  };
  const sectionClassName = [
    'plan299-hero-content site-card-padding relative z-10 grid items-center gap-8 lg:gap-10',
    hasCard ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,var(--plan299-card-width))]' : 'grid-cols-1',
  ].join(' ');

  return (
    <div className="plan299-hero-shell relative overflow-hidden">
      <div
        className="plan299-background plan299-background-mobile lg:hidden"
        style={{
          backgroundColor: settings.backgroundColor,
          backgroundImage: settings.useCustomBackground && mobileImage ? `url(${JSON.stringify(mobileImage)})` : undefined,
          backgroundPosition: settings.backgroundPositionMobile,
        }}
        aria-hidden="true"
      />
      <div
        className="plan299-background hidden lg:block"
        style={{
          backgroundColor: settings.backgroundColor,
          backgroundImage: settings.useCustomBackground && desktopImage ? `url(${JSON.stringify(desktopImage)})` : undefined,
          backgroundPosition: settings.backgroundPositionDesktop,
        }}
        aria-hidden="true"
      />
      <div
        className="plan299-overlay"
        style={{ backgroundColor: settings.overlayColor, opacity: settings.overlayOpacity / 100 }}
        aria-hidden="true"
      />

      <section
        className={sectionClassName}
        style={sectionStyle}
        data-plan299-hero="true"
      >
        {hasText && (
          <div
            className={`flex min-w-0 flex-col ${alignmentClasses(settings.textAlignment)} ${
              hasCard && settings.cardPosition === 'left'
                ? 'lg:col-start-2 lg:row-start-1'
                : hasCard
                  ? 'lg:col-start-1 lg:row-start-1'
                  : 'mx-auto w-full max-w-[920px]'
            }`}
          >
            {settings.showEyebrow && settings.eyebrowText && (
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em]" style={{ color: settings.eyebrowColor }}>
                {settings.eyebrowText}
              </p>
            )}

            <h1
              className="text-[32px] font-bold leading-[1.08] md:text-[48px]"
              style={{ color: settings.headingColor }}
            >
              <span>{settings.headingLine1Prefix}{settings.headingLine1Prefix && settings.headingLine1Highlight ? ' ' : ''}</span>
              <span style={{ color: settings.highlightColor }}>{settings.headingLine1Highlight}</span>
              <span className="block">
                {settings.headingLine2Prefix}{settings.headingLine2Prefix && settings.headingLine2Highlight ? ' ' : ''}
                <span style={{ color: settings.highlightColor }}>{settings.headingLine2Highlight}</span>
                {(settings.headingLine2Highlight || settings.headingLine2Prefix) && settings.headingLine2Suffix ? ' ' : ''}
                {settings.headingLine2Suffix}
              </span>
            </h1>

            {settings.description && (
              <p className="mt-5 max-w-[680px] text-sm leading-6 md:text-base" style={{ color: settings.descriptionColor }}>
                {settings.description}
              </p>
            )}

            {settings.showResultBadge && (
              <div
                className="mt-7 inline-flex min-h-[58px] max-w-full items-center justify-center gap-3 rounded-full border px-5 md:px-8"
                style={{
                  color: settings.resultTextColor,
                  borderColor: settings.resultBorderColor,
                  backgroundColor: settings.resultBackgroundColor,
                }}
              >
                <span className="text-[13px] font-semibold uppercase md:text-[16px]">{settings.resultPrefix}</span>
                <span className="text-[48px] font-extrabold leading-none md:text-[58px]" style={{ color: settings.resultValueColor }}>
                  {settings.resultValue}
                </span>
                <span className="text-[13px] font-semibold uppercase md:text-[16px]">{settings.resultSuffix}</span>
              </div>
            )}

            {settings.showHeroButton && settings.heroButtonText && (
              <a
                href={toPublicUrl(settings.heroButtonLink)}
                className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
                style={{ color: settings.heroButtonTextColor, backgroundColor: settings.heroButtonBackgroundColor }}
              >
                {settings.heroButtonText}
              </a>
            )}
          </div>
        )}

        {hasCard && (
          <div
            className={`plan299-card-position mx-auto w-full ${
              settings.cardPosition === 'left'
                ? 'lg:col-start-1 lg:row-start-1 lg:justify-self-start'
                : 'lg:col-start-2 lg:row-start-1 lg:justify-self-end'
            }`}
            style={{ maxWidth: settings.cardMaxWidth }}
          >
            {cardContent}
          </div>
        )}
      </section>

    </div>
  );
}

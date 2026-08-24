'use client';

import { X } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { MarqueeItem, MarqueeSettings } from '@/lib/marquee';

interface MarqueeRibbonProps {
  settings: MarqueeSettings;
  onDismiss?: () => void;
  preview?: boolean;
  className?: string;
}

type RibbonStyle = CSSProperties & Record<`--${string}`, string>;

function isImageIcon(icon: string) {
  return /^(https?:\/\/|\/|data:image\/)/i.test(icon);
}

function RibbonItem({
  item,
  duplicate = false,
}: {
  item: MarqueeItem;
  duplicate?: boolean;
}) {
  const content = (
    <>
      {item.icon && (
        isImageIcon(item.icon) ? (
          // Admins can intentionally use either an uploaded image or an external icon URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="marquee-icon-image" src={item.icon} alt="" />
        ) : (
          <span className="marquee-icon" aria-hidden="true">{item.icon}</span>
        )
      )}
      <span>{item.text}</span>
    </>
  );

  return (
    <div className="marquee-entry">
      {item.link ? (
        <a
          className="marquee-link"
          href={item.link}
          target={item.openInNewTab ? '_blank' : undefined}
          rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
          tabIndex={duplicate ? -1 : undefined}
        >
          {content}
        </a>
      ) : (
        <span className="marquee-link">{content}</span>
      )}
    </div>
  );
}

export default function MarqueeRibbon({ settings, onDismiss, preview = false, className = '' }: MarqueeRibbonProps) {
  const enabledItems = settings.items.filter((item) => item.enabled && item.text.trim());
  if (!enabledItems.length) return null;

  const repeatCount = Math.max(1, Math.ceil(8 / enabledItems.length));
  const repeatedItems = Array.from({ length: repeatCount }, () => enabledItems).flat();
  const scrolling = settings.animationMode === 'scroll';
  const background = settings.useGradient
    ? `linear-gradient(90deg, ${settings.backgroundColor}, ${settings.backgroundColorEnd})`
    : settings.backgroundColor;
  const style: RibbonStyle = {
    '--ribbon-background': background,
    '--ribbon-color': settings.textColor,
    '--ribbon-height-desktop': `${settings.heightDesktop}px`,
    '--ribbon-height-mobile': `${settings.heightMobile}px`,
    '--ribbon-font-desktop': `${settings.fontSizeDesktop}px`,
    '--ribbon-font-mobile': `${settings.fontSizeMobile}px`,
    '--ribbon-font-weight': String(settings.fontWeight),
    '--ribbon-icon-size': `${settings.iconSize}px`,
    '--ribbon-duration': `${settings.speed}s`,
    '--ribbon-animation-direction': settings.direction === 'right' ? 'reverse' : 'normal',
  };

  return (
    <aside
      className={`marquee-ribbon ${className} ${settings.sticky && !preview ? 'is-sticky' : ''} ${
        settings.edgeFade ? 'has-edge-fade' : ''
      } ${settings.uppercase ? 'is-uppercase' : ''}`}
      style={style}
      aria-label={settings.ariaLabel || 'Current offers'}
    >
      <div className="marquee-viewport">
        {scrolling ? (
          <div className={`marquee-track ${settings.pauseOnHover ? 'pauses-on-hover' : ''}`}>
            <div className="marquee-set">
              {repeatedItems.map((item, index) => (
                <RibbonItem key={`primary-${item._id || item.clientId || index}-${index}`} item={item} />
              ))}
            </div>
            <div className="marquee-set" aria-hidden="true">
              {repeatedItems.map((item, index) => (
                <RibbonItem
                  key={`duplicate-${item._id || item.clientId || index}-${index}`}
                  item={item}
                  duplicate
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="marquee-static">
            {enabledItems.map((item, index) => (
              <RibbonItem key={item._id || item.clientId || index} item={item} />
            ))}
          </div>
        )}
      </div>

      {settings.dismissible && onDismiss && (
        <button type="button" className="marquee-dismiss" onClick={onDismiss} aria-label="Dismiss offer ribbon">
          <X aria-hidden="true" />
        </button>
      )}

      <style jsx global>{`
        .marquee-ribbon {
          position: relative;
          z-index: 60;
          width: 100%;
          height: var(--ribbon-height-mobile);
          overflow: hidden;
          background: var(--ribbon-background);
          color: var(--ribbon-color);
          font-size: var(--ribbon-font-mobile);
          font-weight: var(--ribbon-font-weight);
          line-height: 1;
        }

        .marquee-ribbon.is-sticky {
          position: sticky;
          top: 0;
        }

        .marquee-ribbon.is-uppercase {
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .marquee-viewport,
        .marquee-track,
        .marquee-set,
        .marquee-static {
          height: 100%;
        }

        .marquee-viewport {
          overflow: hidden;
        }

        .has-edge-fade .marquee-viewport {
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-slide var(--ribbon-duration) linear infinite;
          animation-direction: var(--ribbon-animation-direction);
          will-change: transform;
        }

        .marquee-ribbon:hover .marquee-track.pauses-on-hover {
          animation-play-state: paused;
        }

        .marquee-set,
        .marquee-static {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .marquee-static {
          justify-content: center;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .marquee-static::-webkit-scrollbar {
          display: none;
        }

        .marquee-entry {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          white-space: pre;
        }

        .marquee-link {
          display: inline-flex;
          align-items: center;
          min-height: var(--ribbon-height-mobile);
          color: inherit;
          text-decoration: none;
        }

        a.marquee-link:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .marquee-icon,
        .marquee-icon-image {
          width: var(--ribbon-icon-size);
          height: var(--ribbon-icon-size);
          flex-shrink: 0;
        }

        .marquee-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: var(--ribbon-icon-size);
        }

        .marquee-icon-image {
          border-radius: 999px;
          object-fit: contain;
        }

        .marquee-dismiss {
          position: absolute;
          top: 50%;
          right: 8px;
          display: grid;
          width: 26px;
          height: 26px;
          transform: translateY(-50%);
          place-items: center;
          border: 0;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.2);
          color: inherit;
          cursor: pointer;
        }

        .marquee-dismiss :global(svg) {
          width: 15px;
          height: 15px;
        }

        @keyframes marquee-slide {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        @media (min-width: 768px) {
          .marquee-ribbon {
            height: var(--ribbon-height-desktop);
            font-size: var(--ribbon-font-desktop);
          }

          .marquee-link {
            min-height: var(--ribbon-height-desktop);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation-play-state: paused;
          }
        }
      `}</style>
    </aside>
  );
}

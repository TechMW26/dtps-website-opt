'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import styles from './IndependenceDayOffer.module.css';

interface OfferCardProps {
  enabled: boolean;
  className?: string;
  children: (revealed: boolean) => ReactNode;
}

interface OfferPriceProps {
  enabled: boolean;
  revealed: boolean;
  regularPrice: number;
  offerPrice: number;
  currency?: string;
  className?: string;
}

const CONFETTI_COLORS = ['#FF9933', '#FFFFFF', '#138808'] as const;

export function isIndependenceDayTrialOffer(plan: {
  planName?: string;
  duration?: string;
  price: number;
  originalPrice: number;
}) {
  return (
    plan.price === 199 &&
    plan.originalPrice === 299 &&
    /10\s*days?|trial/i.test(`${plan.planName || ''} ${plan.duration || ''}`)
  );
}

function TricolorConfetti({ burstId }: { burstId: number }) {
  if (!burstId) return null;

  return (
    <div key={burstId} className={styles.confettiLayer} aria-hidden="true">
      {Array.from({ length: 108 }, (_, index) => {
        const left = (index * 37) % 100;
        const drift = ((index * 29) % 41) - 20;
        const delay = (index % 12) * 0.025;
        const duration = 1.65 + (index % 8) * 0.1;
        const rotation = 360 + (index % 5) * 120;
        const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

        return (
          <span
            key={index}
            className={styles.confettiPiece}
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              '--confetti-drift': `${drift}vw`,
              '--confetti-rotation': `${rotation}deg`,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

export function IndependenceDayOfferCard({ enabled, className = '', children }: OfferCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(!enabled);
  const [burstId, setBurstId] = useState(0);
  const revealedRef = useRef(!enabled);

  const revealOffer = useCallback(() => {
    if (!enabled || revealedRef.current) return;
    revealedRef.current = true;
    setRevealed(true);
    setBurstId((value) => value + 1);
  }, [enabled]);

  useEffect(() => {
    revealedRef.current = !enabled;
    setRevealed(!enabled);
    setBurstId(0);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || revealed || !cardRef.current) return;
    const isMobileInteraction =
      window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth < 768;
    const viewportRevealDelay = isMobileInteraction ? 2000 : 3000;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let animationFrame = 0;

    const updateVisibility = () => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const visibleRatio = rect.height > 0 ? visibleHeight / rect.height : 0;

      if (visibleRatio >= 0.45) {
        if (!timer) timer = setTimeout(revealOffer, viewportRevealDelay);
      } else if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };

    const observer = new IntersectionObserver(updateVisibility, { threshold: [0, 0.45, 0.75] });
    observer.observe(cardRef.current);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    animationFrame = window.requestAnimationFrame(updateVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [enabled, revealOffer, revealed]);

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) revealOffer();
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      className={`${className} ${enabled ? styles.offerCard : ''} ${revealed ? styles.offerCardRevealed : ''}`}
      data-independence-offer={enabled ? (revealed ? 'revealed' : 'ready') : undefined}
    >
      {children(revealed)}
      <TricolorConfetti burstId={burstId} />
    </div>
  );
}

export function IndependenceDayOfferPrice({
  enabled,
  revealed,
  regularPrice,
  offerPrice,
  currency = '₹',
  className = '',
}: OfferPriceProps) {
  if (!enabled) {
    return (
      <div className={`flex items-end gap-2 ${className}`}>
        <span className="text-[#014E4E]">{currency}{offerPrice.toLocaleString('en-IN')}</span>
        {regularPrice > offerPrice ? (
          <span className="mb-1 text-[0.5em] font-medium text-[#6B7280] line-through">
            {currency}{regularPrice.toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`${styles.priceStage} ${className}`} aria-live="polite">
      <span className="sr-only">
        {revealed
          ? `Independence Day offer price ${currency}${offerPrice}, reduced from ${currency}${regularPrice}`
          : `Price ${currency}${regularPrice}`}
      </span>
      <span aria-hidden="true" className={`${styles.initialPrice} ${revealed ? styles.initialPriceRevealed : ''}`}>
        {currency}{regularPrice.toLocaleString('en-IN')}
        <span className={styles.initialStrike} />
      </span>
      <span aria-hidden="true" className={`${styles.revealedPrices} ${revealed ? styles.revealedPricesVisible : ''}`}>
        <span className={styles.offerPrice}>{currency}{offerPrice.toLocaleString('en-IN')}</span>
        <span className={styles.finalRegularPrice}>{currency}{regularPrice.toLocaleString('en-IN')}</span>
      </span>
    </div>
  );
}

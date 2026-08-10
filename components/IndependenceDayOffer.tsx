'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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
const ANIMATED_PRICE_PAIRS = [
  { offerPrice: 199, regularPrice: 299 },
  { offerPrice: 8000, regularPrice: 16000 },
] as const;

export function isAnimatedPriceOffer(plan: {
  price: number;
  originalPrice: number;
}) {
  return ANIMATED_PRICE_PAIRS.some(
    (pair) => plan.price === pair.offerPrice && plan.originalPrice === pair.regularPrice
  );
}

export function isIndependenceDayTrialOffer(plan: {
  planName?: string;
  duration?: string;
  price: number;
  originalPrice: number;
}) {
  return isAnimatedPriceOffer(plan);
}

function TricolorConfetti({ burstId }: { burstId: number }) {
  if (!burstId || typeof document === 'undefined') return null;

  return createPortal(
    <div key={burstId} className={styles.confettiLayer} aria-hidden="true">
      {Array.from({ length: 160 }, (_, index) => {
        const left = (index * 47 + (index % 9) * 3) % 100;
        const drift = ((index * 31) % 61) - 30;
        const delay = (index % 20) * 0.018;
        const duration = 2.1 + (index % 10) * 0.11;
        const rotation = 540 + (index % 7) * 150;
        const width = 6 + (index % 5);
        const height = index % 4 === 0 ? width : 10 + (index % 8);
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
              '--confetti-width': `${width}px`,
              '--confetti-height': `${height}px`,
              '--confetti-radius': index % 4 === 0 ? '50%' : index % 3 === 0 ? '2px' : '0px',
            } as CSSProperties}
          />
        );
      })}
    </div>,
    document.body
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
    if (!burstId) return;
    const cleanupTimer = window.setTimeout(() => setBurstId(0), 4000);
    return () => window.clearTimeout(cleanupTimer);
  }, [burstId]);

  useEffect(() => {
    if (!enabled || revealed || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) revealOffer();
      },
      { threshold: [0.2], rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
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
          ? `Offer price ${currency}${offerPrice}, reduced from ${currency}${regularPrice}`
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

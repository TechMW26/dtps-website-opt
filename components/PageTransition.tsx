'use client';

/**
 * PageTransition – "Nourish & Reveal"
 * ------------------------------------------------------------------
 * Wellness-themed route transition.
 *
 * Sequence on every navigation:
 *   1. Curtain immediately sweeps in from top + bottom (covers screen).
 *   2. At the midpoint (when the screen is fully covered) we swap the
 *      rendered page from the OLD route to the NEW route. The user
 *      never sees a hard page switch.
 *   3. Curtain sweeps back out, revealing the new page which fades up
 *      smoothly underneath.
 *
 * Implementation notes:
 *   - We snapshot `children` in state so the previously rendered route
 *     stays mounted until the curtain has covered the screen. A ref
 *     holds the latest `children` so the swap always picks up the
 *     freshest tree.
 *   - Skipped for /admin routes.
 *   - Honours `prefers-reduced-motion` (see globals.css).
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const COVER_MS = 480;  // time for curtains to fully cover the screen
const TOTAL_MS = 1100; // total overlay duration (cover + hold + reveal)

const LOGO_URL =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Frozen snapshot of the page that is currently visible to the user.
  const [renderedChildren, setRenderedChildren] = useState(children);
  const [renderedPath, setRenderedPath] = useState(pathname);
  const renderedPathRef = useRef(pathname);

  // 'idle' | 'covering' | 'revealing'
  const [phase, setPhase] = useState<'idle' | 'covering' | 'revealing'>('idle');

  // Always keep the latest children available for the swap.
  const latestChildren = useRef(children);
  useEffect(() => {
    latestChildren.current = children;
  }, [children]);

  const isAdminRoute = pathname?.startsWith('/admin');
  const wasAdminRoute = renderedPathRef.current?.startsWith('/admin');

  useEffect(() => {
    if (pathname === renderedPathRef.current) return;

    // Don't run the curtain on admin routes (entering or leaving) – just swap.
    if (isAdminRoute || wasAdminRoute) {
      setRenderedChildren(latestChildren.current);
      setRenderedPath(pathname);
      renderedPathRef.current = pathname;
      setPhase('idle');
      return;
    }

    setPhase('covering');

    const swapTimer = setTimeout(() => {
      // At the midpoint the curtain fully covers the viewport – safe to swap.
      setRenderedChildren(latestChildren.current);
      setRenderedPath(pathname);
      renderedPathRef.current = pathname;
      setPhase('revealing');
    }, COVER_MS);

    const endTimer = setTimeout(() => {
      setPhase('idle');
    }, TOTAL_MS);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, isAdminRoute, wasAdminRoute]);

  const isAnimating = phase !== 'idle';

  return (
    <>
      {/* Currently displayed page. Fades out while the curtain covers,
          and is keyed by renderedPath so the new page replays its
          fade-up animation when we swap. */}
      <div
        key={renderedPath}
        className={`page-transition-content ${
          phase === 'covering' ? 'is-leaving' : ''
        } ${phase === 'revealing' ? 'is-entering' : ''}`}
      >
        {renderedChildren}
      </div>

      {/* Curtain overlay – only on public routes */}
      {!isAdminRoute && !wasAdminRoute && (
        <div
          className={`page-transition-overlay ${isAnimating ? 'is-active' : ''}`}
          aria-hidden="true"
        >
          <div className="page-transition-curtain page-transition-curtain--top" />
          <div className="page-transition-curtain page-transition-curtain--bottom" />

          <div className="page-transition-badge">
            <img src={LOGO_URL} alt="DTPS" className="page-transition-logo" />
            <span className="page-transition-tagline">Nourish · Transform</span>
          </div>
        </div>
      )}
    </>
  );
}

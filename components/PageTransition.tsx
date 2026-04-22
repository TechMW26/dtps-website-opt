'use client';

/**
 * PageTransition
 * ------------------------------------------------------------------
 * A wellness-themed route transition that plays whenever the user
 * navigates between pages of the site.
 *
 * Concept ("Nourish & Reveal"):
 *   - Two organic, leaf-shaped curtains in the brand teal sweep in
 *     from the top and bottom of the viewport, briefly meeting in
 *     the middle.
 *   - At the meet point, a glowing leaf glyph + "DTPS" wordmark
 *     pulses, echoing the brand's nutrition / transformation story.
 *   - The curtains then sweep back out, revealing the new page,
 *     while the page contents themselves fade & lift up (a subtle
 *     "transformation" reveal).
 *
 * Implementation notes:
 *   - Pure CSS keyframes + a tiny React state machine. No new deps.
 *   - Skipped for /admin routes so it doesn't get in the way of the
 *     dashboard.
 *   - Honours `prefers-reduced-motion` (see globals.css).
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TRANSITION_MS = 1100; // total overlay duration (in + out)

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayPath, setDisplayPath] = useState(pathname);
  const [isAnimating, setIsAnimating] = useState(false);
  const firstRender = useRef(true);

  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    // Don't animate on first mount or on admin routes.
    if (firstRender.current) {
      firstRender.current = false;
      setDisplayPath(pathname);
      return;
    }

    if (isAdminRoute) {
      setDisplayPath(pathname);
      return;
    }

    setIsAnimating(true);
    setDisplayPath(pathname);

    const t = setTimeout(() => setIsAnimating(false), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [pathname, isAdminRoute]);

  return (
    <>
      {/* Page content. `key` forces a remount per route so the fade-up
          animation replays on every navigation. */}
      <div key={displayPath} className="page-transition-content">
        {children}
      </div>

      {/* Curtain overlay – only rendered on public routes */}
      {!isAdminRoute && (
        <div
          className={`page-transition-overlay ${isAnimating ? 'is-active' : ''}`}
          aria-hidden="true"
        >
          <div className="page-transition-curtain page-transition-curtain--top" />
          <div className="page-transition-curtain page-transition-curtain--bottom" />

          <div className="page-transition-badge">
            <svg
              className="page-transition-leaf"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stylised leaf — echoes the nutrition / wellness theme */}
              <path
                d="M52 8C28 8 12 24 12 44c0 6 2 10 4 12 2-14 12-26 28-32-12 8-20 18-22 32 2 2 6 4 12 4 20 0 36-16 36-40V8H52Z"
                fill="url(#leafGradient)"
              />
              <path
                d="M14 56c4-16 16-28 32-34"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.85"
              />
              <defs>
                <linearGradient
                  id="leafGradient"
                  x1="12"
                  y1="8"
                  x2="60"
                  y2="56"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#7be3c8" />
                  <stop offset="100%" stopColor="#00a19a" />
                </linearGradient>
              </defs>
            </svg>
            <span className="page-transition-wordmark">DTPS</span>
            <span className="page-transition-tagline">Nourish · Transform</span>
          </div>
        </div>
      )}
    </>
  );
}

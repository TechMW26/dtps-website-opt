'use client';

/**
 * PageTransition – "Nourish & Reveal" (lightweight overlay)
 * ------------------------------------------------------------------
 * Fixed-position curtain overlay that plays an animation on every route
 * change. It deliberately does NOT wrap or snapshot the page tree –
 * keeping it as a sibling element means React doesn't re-render the
 * whole route subtree when the transition starts/ends, which previously
 * showed up as extra Total Blocking Time on Lighthouse.
 *
 *   1. On pathname change the overlay mounts and immediately covers the
 *      viewport (organic teal curtains sweep in from top + bottom).
 *   2. The DTPS logo + tagline pulse at the meet point.
 *   3. Curtains retreat, the overlay unmounts.
 *
 * The new page renders behind the curtain during the cover phase, so the
 * route swap is visually masked even though React isn't holding any
 * stale tree in state.
 *
 * Skipped on /admin routes. Honours `prefers-reduced-motion`.
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TOTAL_MS = 1100;

const LOGO_URL =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';

export default function PageTransition() {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    if (pathname?.startsWith('/admin')) return;

    setIsActive(true);
    const t = setTimeout(() => setIsActive(false), TOTAL_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!isActive) return null;

  return (
    <div className="page-transition-overlay is-active" aria-hidden="true">
      <div className="page-transition-curtain page-transition-curtain--top" />
      <div className="page-transition-curtain page-transition-curtain--bottom" />

      <div className="page-transition-badge">
        <img
          src={LOGO_URL}
          alt="DTPS"
          className="page-transition-logo"
          width={132}
          height={132}
        />
        <span className="page-transition-tagline">Nourish · Transform</span>
      </div>
    </div>
  );
}

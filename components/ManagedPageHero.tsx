'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { toPublicUrl } from '@/lib/public-routes';

type Banner = { title: string; desktopImage: string; mobileImage?: string; link?: string };

/** Keep the original page hero until an admin enables a matching banner. */
export default function ManagedPageHero({ page, children }: { page: string; children: ReactNode }) {
  const [banner, setBanner] = useState<Banner | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setBanner(null);
    fetch(`/api/site-banners?type=hero-banner&page=${encodeURIComponent(page)}&active=true`, { signal: controller.signal, cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error('Banner unavailable'); return response.json(); })
      .then(data => { if (!controller.signal.aborted) setBanner(data.banners?.find((item: Banner) => item.desktopImage) || null); })
      .catch(() => { /* Preserve the existing hero when content is unavailable. */ });
    return () => controller.abort();
  }, [page]);
  if (!banner) return <>{children}</>;
  const picture = <picture>
    <source media="(max-width: 767px)" srcSet={banner.mobileImage || banner.desktopImage} />
    <img src={banner.desktopImage} alt={banner.title} className="block w-full h-auto" loading="eager" fetchPriority="high" />
  </picture>;
  return <section className="site-shell pt-4 md:pt-[60px]" aria-label={banner.title}>
    <div className="overflow-hidden rounded-3xl bg-[#014E4E]">
      <Navbar />
      {banner.link ? <Link href={toPublicUrl(banner.link)} className="block">{picture}</Link> : picture}
    </div>
  </section>;
}

'use client';
import { toPublicUrl } from '@/lib/public-routes';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import { getOptimizedUrl } from '@/lib/imagekit-url';

interface HomeBanner {
  _id: string;
  title: string;
  desktopImage?: string;
  mobileImage?: string;
  link?: string;
}

export default function HomeHeroSwitcher() {
  const [banner, setBanner] = useState<HomeBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHomeBanner = async () => {
      try {
        const res = await fetch(
          '/api/site-banners?type=hero-banner&page=home&active=true',
          { cache: 'no-store' }
        );

        if (!res.ok) {
          throw new Error('Failed to load the homepage banner');
        }

        const data = await res.json();
        if (!cancelled) {
          setBanner(data.banners?.[0] || null);
        }
      } catch (error) {
        // Keep the normal hero available if the banner service is unavailable.
        console.error('Error loading homepage banner:', error);
        if (!cancelled) {
          setBanner(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHomeBanner();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="site-shell bg-white pt-4 md:pt-[60px]" aria-label="Loading homepage hero">
        <div className="relative overflow-hidden rounded-3xl bg-[#014E4E]">
          <Navbar />
          <div className="h-[430px] animate-pulse bg-white/5 md:h-[500px]" />
        </div>
      </section>
    );
  }

  if (!banner?.desktopImage) {
    return <Hero />;
  }

  const desktopImage = getOptimizedUrl(banner.desktopImage, {
    width: 1920,
    quality: 85,
    format: 'auto',
  });
  const mobileImage = getOptimizedUrl(banner.mobileImage || banner.desktopImage, {
    width: 768,
    quality: 80,
    format: 'auto',
  });

  const image = (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobileImage} />
      <img
        src={desktopImage}
        alt={banner.title}
        className="block h-auto w-full object-cover"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );

  return (
    <section className="site-shell bg-white pt-4 md:pt-[60px]" aria-label={banner.title}>
      <div className="relative overflow-hidden rounded-3xl bg-[#014E4E]">
        <Navbar />
        {banner.link ? (
          <Link href={toPublicUrl(banner.link)} className="block" aria-label={banner.title}>
            {image}
          </Link>
        ) : (
          image
        )}
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState, useMemo } from 'react';

interface PageHero {
  _id: string;
  page?: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  desktopImage?: string;
  mobileImage?: string;
  image?: string;
  isActive: boolean;
}

interface DynamicPageHeroProps {
  page: string;
  fallback?: {
    title: string;
    subtitle: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    desktopImage?: string;
    mobileImage?: string;
    image?: string;
  };
}

// Responsive optimization is handled by Next.js for Vercel Blob images.
function getOptimizedImageUrl(url: string, _width: number = 400, _quality: number = 80): string { return url; }

export default function DynamicPageHero({ page, fallback }: DynamicPageHeroProps) {
  const [hero, setHero] = useState<PageHero | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/site-banners?type=hero-banner&page=${page}&active=true`, {
          cache: 'no-store'
        });
        if (!res.ok) {
          setHero(null);
          return;
        }
        const data = await res.json();
        const banners = data.banners || [];
        setHero(banners.length > 0 ? banners[0] : null);
      } catch {
        setHero(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, [page]);

  const currentHero = hero || fallback;

  // Pre-compute optimized image URLs
  const desktopImage = currentHero?.desktopImage || currentHero?.image || '';

  const optimizedDesktopImage = useMemo(() => {
    if (!desktopImage) return '';
    return getOptimizedImageUrl(desktopImage, 1920, 80);
  }, [desktopImage]);

  const optimizedMobileImage = useMemo(() => {
    const mobileImage = currentHero?.mobileImage || desktopImage;
    if (!mobileImage) return '';
    return getOptimizedImageUrl(mobileImage, 768, 75);
  }, [currentHero?.mobileImage, desktopImage]);

  if (loading || !currentHero || !optimizedDesktopImage) {
    return null;
  }

  return (
    <section className="dynamic-page-hero relative overflow-hidden" aria-label={currentHero.title}>
      {!imageLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}

      <picture>
        <source media="(max-width: 767px)" srcSet={optimizedMobileImage} />
        <img
          src={optimizedDesktopImage}
          alt={currentHero.title}
          className={`block h-auto w-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
        />
      </picture>
    </section>
  );
}

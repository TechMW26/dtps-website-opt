'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

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

// Optimize ImageKit URLs with proper transformations
function getOptimizedImageUrl(url: string, width: number, quality: number = 80): string {
  if (!url || !url.includes('ik.imagekit.io')) return url;

  // Remove existing transformations
  const cleaned = url.replace(/\/tr:[^/]+\//, '/');

  try {
    const urlObj = new URL(cleaned);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const endpoint = parts[0];
      const rest = parts.slice(1).join('/');
      // pr-true for progressive loading, f-auto for format auto-detection
      return `${urlObj.origin}/${endpoint}/tr:w-${width},q-${quality},f-auto,pr-true/${rest}`;
    }
  } catch {
    return url;
  }
  return url;
}

export default function DynamicPageHero({ page, fallback }: DynamicPageHeroProps) {
  const [hero, setHero] = useState<PageHero | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/site-banners?type=hero-banner&page=${page}&active=true`, {
          // Add cache for faster subsequent loads
          next: { revalidate: 300 } // Cache for 5 minutes
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
  const optimizedDesktopImage = useMemo(() => {
    if (!currentHero?.desktopImage) return '';
    return getOptimizedImageUrl(currentHero.desktopImage, 1920, 80);
  }, [currentHero?.desktopImage]);

  const optimizedMobileImage = useMemo(() => {
    if (!currentHero?.mobileImage) return '';
    return getOptimizedImageUrl(currentHero.mobileImage, 768, 75);
  }, [currentHero?.mobileImage]);

  if (!currentHero) {
    return null;
  }

  return (
    <section className="wl-hero relative overflow-hidden p-0">
      {/* Loading skeleton while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-0" />
      )}

      {/* Desktop Image - Full Screen */}
      {optimizedDesktopImage && (
        <div className="wl-hero-desktop-image absolute top-0 right-0 w-full h-full z-0">
          <Image
            src={optimizedDesktopImage}
            alt={currentHero.title}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            priority
            fetchPriority="high"
            quality={80}
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Mobile Image - Full Screen */}
      {optimizedMobileImage && (
        <div className="wl-hero-mobile-image absolute top-0 left-0 w-full h-full z-0">
          <Image
            src={optimizedMobileImage}
            alt={currentHero.title}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            priority
            fetchPriority="high"
            quality={75}
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}

      {/* Fallback: Use desktopImage for mobile if mobileImage not provided */}
      {!currentHero.mobileImage && optimizedDesktopImage && (
        <div className="wl-hero-fallback-image absolute top-0 left-0 w-full h-full z-0">
          <Image
            src={optimizedDesktopImage}
            alt={currentHero.title}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            priority
            fetchPriority="high"
            quality={80}
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      )}
    </section>
  );
}

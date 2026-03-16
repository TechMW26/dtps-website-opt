'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
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

export default function DynamicPageHero({ page, fallback }: DynamicPageHeroProps) {
  const [hero, setHero] = useState<PageHero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/site-banners?type=hero-banner&page=${page}&active=true`);
        if (!res.ok) throw new Error('Failed to fetch hero');
        const data = await res.json();
        const banners = data.banners || [];
        setHero(banners.length > 0 ? banners[0] : null);
      } catch (error) {
        console.error('Error fetching page hero:', error);
        setHero(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, [page]);

  const currentHero = hero || fallback;

  if (!currentHero) {
    return null;
  }

  return (
    <section className="wl-hero relative overflow-hidden p-0">
      {/* Desktop Image - Full Screen */}
      {currentHero.desktopImage && (
        <div className="wl-hero-desktop-image absolute top-0 right-0 w-full h-full z-0">
          <Image
            src={currentHero.desktopImage}
            alt={currentHero.title}
            fill
            className="object-cover"
            priority
            quality={85}
          />
        </div>
      )}

      {/* Mobile Image - Full Screen */}
      {currentHero.mobileImage && (
        <div className="wl-hero-mobile-image absolute top-0 left-0 w-full h-full z-0">
          <Image
            src={currentHero.mobileImage}
            alt={currentHero.title}
            fill
            className="object-cover"
            priority
            quality={85}
          />
        </div>
      )}

      {/* Fallback: Use desktopImage for mobile if mobileImage not provided */}
      {!currentHero.mobileImage && currentHero.desktopImage && (
        <div className="wl-hero-fallback-image absolute top-0 left-0 w-full h-full z-0">
          <Image
            src={currentHero.desktopImage}
            alt={currentHero.title}
            fill
            className="object-cover"
            priority
            quality={85}
          />
        </div>
      )}
    </section>
  );
}

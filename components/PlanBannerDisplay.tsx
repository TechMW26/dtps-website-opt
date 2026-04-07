'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PlanBanner {
  _id: string;
  planId: string;
  planName: string;
  title: string;
  image: string;
  mobileImage?: string;
  link?: string;
  isActive: boolean;
}

interface PlanBannerDisplayProps {
  planId: string; // The specific plan's ID
}

export default function PlanBannerDisplay({ planId }: PlanBannerDisplayProps) {
  const [banner, setBanner] = useState<PlanBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!planId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/plan-banners?planId=${planId}&active=true`, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch banner: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.banners && data.banners.length > 0) {
          setBanner(data.banners[0]); // Get the first (and only) active banner
        }
      } catch (err) {
        console.error('Error fetching plan banner:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch banner');
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [planId]);

  if (!banner || loading) {
    return null;
  }

  const BannerContent = (
    <div className="relative overflow-hidden transition-transform hover:scale-[1.02] rounded-lg w-full">
      <picture>
        {banner.mobileImage && (
          <source media="(max-width: 640px)" srcSet={banner.mobileImage} />
        )}
        <img
          src={banner.image}
          alt={banner.title}
          className="w-full h-auto object-cover block"
          style={{ display: 'block' }}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </div>
  );

  if (banner.link) {
    return (
      <div className="w-full cursor-pointer">
        <Link href={banner.link}>
          {BannerContent}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full cursor-pointer">
      {BannerContent}
    </div>
  );
}

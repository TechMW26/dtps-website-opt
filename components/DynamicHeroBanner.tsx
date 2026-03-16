'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOptimizedUrl } from '@/lib/imagekit';

interface BannerItem {
  _id: string;
  type: string;
  title: string;
  icon: string;
  desktopImage?: string;
  mobileImage?: string;
  link?: string;
  isActive: boolean;
}

export default function DynamicHeroBanner() {
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchBannerData = async () => {
      try {
        const res = await fetch('/api/site-banners?type=hero-banner&active=true');
        if (!res.ok) throw new Error('Failed to fetch banner data');
        const data = await res.json();
        if (data.banners && data.banners.length > 0) {
          setBanner(data.banners[0]); // Get first active banner
        }
      } catch (error) {
        console.error('Error fetching banner data:', error);
      }
    };

    fetchBannerData();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!banner) {
    return null;
  }

  // Select appropriate image based on device type
  const imageUrl = isMobile && banner.mobileImage ? banner.mobileImage : banner.desktopImage;

  if (!imageUrl) {
    return null;
  }

  // Get optimized ImageKit URL with compression
  const optimizedUrl = getOptimizedUrl(imageUrl, {
    width: isMobile ? 600 : 1200,
    height: isMobile ? 300 : 400,
    quality: 80,
    format: 'auto',
  });

  const BannerContent = () => (
    <div className="w-full h-auto relative overflow-hidden rounded-xl">
      <img
        src={optimizedUrl}
        alt={banner.title}
        className="w-full h-auto block object-cover"
        loading="lazy"
      />
    </div>
  );

  if (banner.link) {
    return (
      <Link href={banner.link} className="no-underline">
        <BannerContent />
      </Link>
    );
  }

  return <BannerContent />;
}

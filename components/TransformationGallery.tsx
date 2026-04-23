'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Transformation {
  _id: string;
  clientName: string;
  beforeImage?: string;
  afterImage?: string;
  weightLost: string;
  daysToAchieve: string;
  testimonial?: string;
  page: string;
  targetPages?: string[];
  featured: boolean;
  isActive: boolean;
}

interface TransformationGalleryProps {
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  maxItems?: number;
  cardBackgroundClassName?: string;
  paginationElSelector?: string;
  showNavArrows?: boolean;
}

// Optimize ImageKit URLs
function optimizeImageUrl(url: string, width: number = 400): string {
  if (!url || !url.includes('ik.imagekit.io')) return url;
  const cleaned = url.replace(/\/tr:[^/]+\//, '/');
  try {
    const urlObj = new URL(cleaned);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const endpoint = parts[0];
      const rest = parts.slice(1).join('/');
      return `${urlObj.origin}/${endpoint}/tr:w-${width},q-75,f-auto,pr-true/${rest}`;
    }
  } catch {
    return url;
  }
  return url;
}

const fallbackData: Transformation[] = [];

export default function TransformationGallery({
  page,
  maxItems = 6,
  cardBackgroundClassName = 'bg-gray-100',
  paginationElSelector,
  showNavArrows = false,
}: TransformationGalleryProps) {
  const [transformations, setTransformations] = useState<Transformation[]>(fallbackData as any);
  const [loading, setLoading] = useState(true);
  const navPrevClass = useMemo(() => `tg-nav-prev-${Math.random().toString(36).slice(2, 8)}`, []);
  const navNextClass = useMemo(() => `tg-nav-next-${Math.random().toString(36).slice(2, 8)}`, []);

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        const response = await fetch(`/api/transformations?page=${page}&active=true`, {
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.transformations && data.transformations.length > 0) {
            setTransformations(data.transformations.slice(0, maxItems));
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching transformations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransformations();
  }, [page, maxItems]);

  // Memoize optimized image URLs
  const optimizedTransformations = useMemo(() => {
    return transformations.map(t => ({
      ...t,
      optimizedImage: optimizeImageUrl(
        t.afterImage || t.beforeImage || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e5.jpg',
        400
      )
    }));
  }, [transformations]);

  // Show skeleton while loading
  if (loading && transformations.length === 0) {
    return (
      <div className="w-full">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-[300px] h-[400px] bg-gray-200 rounded-[16px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`relative max-w-full mx-auto ${showNavArrows ? 'px-12 md:px-0' : ''}`}>
        <Swiper
          modules={[Pagination, Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{
            clickable: true,
            el: paginationElSelector || '.swiper-pagination-custom',
          }}
          navigation={
            showNavArrows
              ? { prevEl: `.${navPrevClass}`, nextEl: `.${navNextClass}` }
              : false
          }
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}
        >

          {optimizedTransformations.map((transformation, index) => (
            <SwiperSlide key={transformation._id || transformation.clientName}>
              <div className="relative aspect-[4/5]">
                <Image
                  src={transformation.optimizedImage}
                  alt={`${transformation.clientName} Transformation`}
                  fill
                  className="object-cover rounded-[16px]"
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation arrows (only when enabled by parent) */}
        {showNavArrows && (
          <>
            <button
              type="button"
              aria-label="Previous"
              className={`${navPrevClass} md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#014e4e] text-white flex items-center justify-center shadow-md hover:bg-[#013838] transition-colors`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              className={`${navNextClass} md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#014e4e] text-white flex items-center justify-center shadow-md hover:bg-[#013838] transition-colors`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Pagination Dots (default location, can be overridden via paginationElSelector) */}
        {!paginationElSelector && (
          <div className="swiper-pagination-custom flex justify-center gap-2 mt-6 relative" />
        )}
        <style>{`
            .swiper-pagination-custom {
              display: flex !important;
              justify-content: center;
              gap: 8px;
              margin-top: 24px;
              position: relative;
            }
            .swiper-pagination-custom .swiper-pagination-bullet {
              width: 10px;
              height: 10px;
              background: #d0d0d0 !important;
              opacity: 1 !important;
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.3s ease;
              margin: 0 !important;
              flex-shrink: 0;
            }
            .swiper-pagination-custom .swiper-pagination-bullet-active {
              background: #ff850b !important;
              width: 12px;
              height: 12px;
            }
          `}</style>
      </div>
    </div>
  );
}

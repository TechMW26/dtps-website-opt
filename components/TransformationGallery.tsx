'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Transformation {
  _id: string;
  clientName: string;
  beforeImage?: string;
  afterImage?: string;
  weightLost: string;
  daysToAchieve: string;
  testimonial?: string;
  page: string;
  featured: boolean;
  isActive: boolean;
}

interface TransformationGalleryProps {
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  title?: string;
  subtitle?: string;
  maxItems?: number;
}

const fallbackData: Transformation[] = [];

export default function TransformationGallery({ 
  page, 
  title = 'Success Stories',
  subtitle = 'Real Results from Real People',
  maxItems = 6
}: TransformationGalleryProps) {
  const [transformations, setTransformations] = useState<Transformation[]>(fallbackData as any);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        // First try to fetch page-specific transformations
        const response = await fetch(`/api/transformations?page=${page}&active=true`);
        if (response.ok) {
          const data = await response.json();
          if (data.transformations && data.transformations.length > 0) {
            setTransformations(data.transformations.slice(0, maxItems));
            return;
          }
        }
        
        // If no page-specific data, fetch all active transformations
        const allResponse = await fetch('/api/transformations?active=true');
        if (allResponse.ok) {
          const allData = await allResponse.json();
          if (allData.transformations && allData.transformations.length > 0) {
            setTransformations(allData.transformations.slice(0, maxItems));
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

  return (
    <section className="px-0 max-w-full mx-auto">
      {title && (
        <div className="text-center mb-8 md:mb-[50px]">
          <h2 className="text-2xl md:text-5xl font-bold text-black mb-2.5 font-[Epilogue,sans-serif] leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm md:text-[17px] text-[#666] leading-relaxed max-w-full md:max-w-[680px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="max-w-full mx-auto relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-custom',
          }}
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
          {transformations.map((transformation) => (
            <SwiperSlide key={transformation._id || transformation.clientName}>
              <div className="rounded-[16px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
                <img
                  src={transformation.afterImage || transformation.beforeImage || '/api/images/69b7c909bfd19f93f09dc3e5'}
                  alt={`${transformation.clientName} Transformation`}
                  className="w-full h-auto object-contain rounded-[16px]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination Dots */}
        <div className="swiper-pagination-custom flex justify-center gap-2 mt-6 relative">
          <style>{`
            .swiper-pagination-custom {
              display: flex !important;
              justify-content: center;
              gap: 8px;
              margin-top: 24px;
              position: relative;
              width: 100%;
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
    </section>
  );
}

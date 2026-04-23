'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useId, useState } from 'react';

const TransformationGallery = dynamic(
  () => import('@/components/TransformationGallery'),
  { ssr: false }
);

interface TestimonialSliderSectionProps {
  page: 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';
  maxItems?: number;
  /** Header content (eyebrow, title, subtitle). Will be left-aligned on desktop. */
  header: ReactNode;
  /** Optional className for the outer <section>. */
  className?: string;
}

/**
 * Shared testimonial / transformation slider section.
 * Provides identical padding, header layout, and right-aligned dots indicator
 * for every page that displays the transformation slider.
 */
export default function TestimonialSliderSection({
  page,
  maxItems = 6,
  header,
  className = '',
}: TestimonialSliderSectionProps) {
  // Unique selector per instance so multiple sliders can coexist on the same page.
  const reactId = useId().replace(/[:]/g, '');
  const paginationClassDesktop = `transformation-gallery-pagination-d-${reactId}`;
  const paginationClassMobile = `transformation-gallery-pagination-m-${reactId}`;

  // Detect viewport so we can move the swiper pagination element between the
  // header (desktop) and below the slider (mobile).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const activePaginationClass = isMobile ? paginationClassMobile : paginationClassDesktop;

  return (
    <section
      className={`pt-8 pb-8 md:pt-12 md:pb-12 px-0 mx-auto w-full h-auto ${className}`}
      style={{
        // Break out of any parent padding/container so the section spans full viewport width.
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        width: '100vw',
        maxWidth: '100vw',
      }}
    >
      <div className="transformations">
        {/* Mobile-only centered header */}
        <div className="md:hidden text-center mb-8 px-5">
          <div className="max-w-[700px] mx-auto flex flex-col items-center">{header}</div>
        </div>

        {/* Desktop-only header row with right-aligned dots */}
        <div className="hidden md:flex md:items-end md:justify-between gap-4 mb-14">
          <div className="max-w-[700px]">{header}</div>
          <div
            className={`${paginationClassDesktop} flex items-center justify-end gap-2 ml-auto self-end pb-3`}
          />
        </div>

        <TransformationGallery
          page={page}
          maxItems={maxItems}
          cardBackgroundClassName="bg-transparent"
          paginationElSelector={`.${activePaginationClass}`}
          showNavArrows
        />

        {/* Mobile-only pagination below slider */}
        <div
          className={`${paginationClassMobile} flex md:hidden items-center justify-center gap-2 mt-6`}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .${paginationClassDesktop},
            .${paginationClassMobile} {
              display: flex !important;
              align-items: center;
              gap: 8px;
            }
            .${paginationClassDesktop} .swiper-pagination-bullet,
            .${paginationClassMobile} .swiper-pagination-bullet {
              width: 10px;
              height: 10px;
              background: #d0d0d0;
              opacity: 1;
              border-radius: 9999px;
              margin: 0;
              cursor: pointer;
              transition: all 0.3s ease;
              flex-shrink: 0;
            }
            .${paginationClassDesktop} .swiper-pagination-bullet-active,
            .${paginationClassMobile} .swiper-pagination-bullet-active {
              background: #ff850b;
              width: 22px;
              border-radius: 9999px;
            }
          `,
          }}
        />
      </div>
    </section>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useId } from 'react';

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
  const paginationClass = `transformation-gallery-pagination-${reactId}`;

  return (
    <section
      className={`py-12 md:py-20 px-5 md:px-[132px] ${className}`}
      style={{
        // Break out of any parent padding/container so the section spans full viewport width.
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        width: '100vw',
        maxWidth: '100vw',
      }}
    >
      <div className="transformations">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
          <div className="max-w-[700px]">{header}</div>

          {/* Slider dots indicator (right-aligned, baseline of header) */}
          <div
            className={`${paginationClass} flex items-center justify-end gap-2 md:ml-auto md:self-end md:pb-3`}
          />
        </div>

        <TransformationGallery
          page={page}
          maxItems={maxItems}
          cardBackgroundClassName="bg-transparent"
          paginationElSelector={`.${paginationClass}`}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .${paginationClass} {
              display: flex !important;
              align-items: center;
              gap: 8px;
            }
            .${paginationClass} .swiper-pagination-bullet {
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
            .${paginationClass} .swiper-pagination-bullet-active {
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

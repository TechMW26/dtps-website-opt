"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function AboutUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const highlights = [
    'Personalised Nutrition,\nNot Generic Charts',
    'Science-Led,\nCalorie-Deficit Planning',
    'Structured Monitoring\n& Feedback',
    'Therapeutic Diets\nfor Lifestyle Conditions',
  ];

  return (
    <section
      ref={sectionRef}
      className="site-card-padding bg-white py-10 md:py-16 overflow-hidden rounded-[20px] md:rounded-[30px]"
    >
      <div className="site-fill flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

        {/* ─── Left Side – Image ─── */}
        <div
          className={`relative w-full lg:w-[440px] flex-shrink-0 transition-all duration-700 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-[50px] opacity-0'
            }`}
        >
          <div className="flex justify-center items-center rounded-[20px] bg-white p-2 md:p-4">
            <Image
              src="/WhyMostDiets.png"
              alt="Why Most Diets Fail"
              width={700}
              height={700}
              className="w-full h-auto object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* ─── Right Side – Content ─── */}
        <div
          className={`flex-1 w-full transition-all duration-700 ease-out delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'
            }`}
        >
          {/* "About Us" label with orange square */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#f5a623] text-lg">✦</span>
            <span className="text-teal-600 text-base font-semibold">
              About us
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-[1.5rem] md:text-[2rem] lg:text-[30px] font-bold text-[#1E1E1E] leading-[1.2] mb-3 md:mb-4"
            style={{ fontFamily: "'Epilogue', sans-serif" }}
          >
            Why Most Diets Fail &amp;<br />Why This One Works
          </h2>

          {/* Description */}
          <div className="text-[#828283] text-[13px] md:text-[14px] leading-[1.65] mb-5 md:mb-6 max-w-[540px]">
            <p>
              Weight loss fails because most diets don&apos;t fit Indian food or real life. DTPS was built on one simple belief:
              {' '}If a diet can&apos;t work with <strong className="font-bold text-[#828283]">Ghar ka Khana</strong>, it won&apos;t work at all.
            </p>
            <p className="mt-2">
              That&apos;s why our approach is science-led and diet-focused, using personalised calorie planning with normal
              Indian meals. Backed by <strong className="font-bold text-[#828283]">200+ expert dietitians</strong>, we helped more than{' '}
              <strong className="font-bold text-[#828283]">75,000+</strong> people to lose weight
              and manage Medical conditions with a <strong className="font-bold text-[#828283]">98% success rate</strong>. If you&apos;re looking for something that finally fits
              your life,
            </p>
            <p className="mt-1">You&apos;re in the right place.</p>
          </div>

          {/* Highlights Box – gray bg, teal left border */}
          <div
            className="bg-[#EAEEF1] rounded-[6px] px-5 md:px-8 py-4 md:py-5 overflow-hidden"
            style={{ borderLeft: '2px solid #014E4E' }}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {highlights.map((label, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Teal check circle */}
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#014E4E" />
                      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[#575757] text-[12px] md:text-[13px] font-medium whitespace-pre-line leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

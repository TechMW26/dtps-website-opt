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
      className="bg-white py-12 md:py-20 px-4 md:px-8 overflow-hidden rounded-[20px] md:rounded-[30px]"
    >
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-10">

        {/* ─── Left Side – Images ─── */}
        <div
          className={`relative w-full lg:w-[440px] flex-shrink-0 transition-all duration-700 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-[50px] opacity-0'
            }`}
        >
          {/* Desktop Layout */}
          <div className="hidden md:block relative" style={{ height: 400 }}>
            {/* Image 1 – rotated left */}
            <div
              className="absolute top-[30px] w-[225px] h-[330px] rounded-[19px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.12)] z-[2]"
              style={{ left: -20, transform: 'rotate(-6deg)' }}
            >
              <Image
                src="/api/images/69b7c66ea14dfc9fbf5ad4f2"
                alt="Award Ceremony"
                fill
                className="object-cover"
                loading="lazy"
                sizes="225px"
                quality={75}
              />
            </div>

            {/* Image 2 – rotated right, white border */}
            <div
              className="absolute top-[0px] w-[180px] h-[230px] rounded-[19px] overflow-hidden z-[3]"
              style={{ left: 200, transform: 'rotate(11deg)', border: '3px solid white', boxShadow: '0 15px 40px rgba(0,0,0,0.12)' }}
            >
              <Image
                src="/api/images/69b7c6faa14dfc9fbf5ad61e"
                alt="Business Achievers Award"
                fill
                className="object-cover"
                loading="lazy"
                sizes="180px"
                quality={75}
              />
            </div>

            {/* Curly dashed arrow */}
            <div className="absolute z-[4]" style={{ left: 250, top: 220 }}>
              <svg width="53" height="70" viewBox="0 0 53 70" fill="none">
                {/* curly S-shaped dashed path pointing downward */}
                <path
                  d="M30 0 C 28 8, 22 14, 18 20 C 12 28, 8 34, 14 42 C 20 50, 30 48, 32 40 C 34 32, 24 28, 18 34 C 12 40, 16 50, 22 55"
                  stroke="#1E1E1E"
                  strokeWidth="1.8"
                  strokeDasharray="5 4"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Arrow head */}
                <path d="M16 50 L22 60 L28 50" stroke="#1E1E1E" strokeWidth="1.8" fill="#1E1E1E" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* 25+ Years Badge */}
            <div
              className="absolute z-[5] flex items-center gap-[3px] px-[14px] py-[12px]"
              style={{
                left: 200,
                bottom: 10,
                width: 130,
                height: 52,
                background: '#FF850B',
                borderRadius: 10,
                boxShadow: '0 0 7.6px rgba(0,0,0,0.12)',
              }}
            >
              <span className="text-white text-[26px] font-bold leading-none" style={{ fontFamily: "'Epilogue', sans-serif" }}>25</span>
              <span className="text-white text-[24px] font-bold leading-none">+</span>
              <span className="text-white text-[10px] font-normal leading-tight ml-[2px]">Years of<br />experience</span>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex justify-center gap-3 mb-4 relative h-[220px]">
              <div className="relative w-[48%] h-[200px] rounded-[16px] overflow-hidden shadow-lg" style={{ transform: 'rotate(-6deg)' }}>
                <Image src="/api/images/69b7c66ea14dfc9fbf5ad4f2" alt="Award Ceremony" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 48vw, 0px" quality={75} />
              </div>
              <div className="relative w-[40%] h-[160px] rounded-[16px] overflow-hidden shadow-lg border-[3px] border-white" style={{ transform: 'rotate(11deg)' }}>
                <Image src="/api/images/69b7c6faa14dfc9fbf5ad61e" alt="Business Achievers Award" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 40vw, 0px" quality={75} />
              </div>
            </div>
            <div className="mx-auto w-fit flex items-center gap-[3px] px-[14px] py-[12px] rounded-[10px]" style={{ background: '#FF850B', boxShadow: '0 0 7.6px rgba(0,0,0,0.12)' }}>
              <span className="text-white text-[22px] font-bold leading-none">25</span>
              <span className="text-white text-[20px] font-bold leading-none">+</span>
              <span className="text-white text-[10px] font-normal leading-tight ml-[2px]">Years of<br />experience</span>
            </div>
          </div>
        </div>

        {/* ─── Right Side – Content ─── */}
        <div
          className={`flex-1 w-full transition-all duration-700 ease-out delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'
            }`}
        >
          {/* "About Us" label with orange square */}
          <div className="flex items-center gap-1 mb-2">
            <div className="w-3 h-3 bg-[#FF850B]" />
            <span className="text-[#014E4E] text-[14px] font-semibold" style={{ fontFamily: "'Epilogue', sans-serif" }}>
              About Us
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-[1.6rem] md:text-[2rem] lg:text-[30px] font-bold text-[#1E1E1E] leading-[1.2] mb-3 md:mb-4"
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

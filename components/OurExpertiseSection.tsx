"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export default function OurExpertiseSection() {
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

  const expertiseCards = [
    {
      title: 'Chronic Management',
      description: 'Receive personalized nutrition guidance to create balanced, sustainable eating habits that support your health receive personalized nutrition guidance to create balanced.',
      link: '/services'
    },
    {
      title: 'Personalized Health Solutions',
      description: 'Receive personalized nutrition guidance to create balanced, sustainable eating habits that support your health receive personalized nutrition guidance to create balanced.',
      link: '/services'
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="site-card-padding bg-white py-8 md:py-12 overflow-hidden rounded-[20px] md:rounded-[30px]"
    >
      <div className="site-fill">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8 md:mb-10">
          {/* Left - Title */}
          <div className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-[#0d9488] text-sm font-semibold tracking-wide">
                Our Expertise
              </span>
            </div>
            <h2 className="text-[1.8rem] md:text-[2.5rem] font-bold text-[#1a1a1a] leading-[1.15]">
              Mastering wellness for
              <br />
              your success
            </h2>
          </div>

          {/* Right - Description */}
          <div className={`lg:max-w-[450px] lg:pt-2 transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-[#666] text-[0.9rem] md:text-[0.95rem] leading-[1.7]">
              We specialize in personalized health strategies designed to help you achieve balance, energy, and lasting success. With expert guidance and a holistic approach, we empower you to embrace healthier habits.
            </p>
          </div>
        </div>

        {/* Content Section - Image and Cards */}
        <div className="relative">
          {/* Poonam Sagar Image with Vertical Text */}
          <div className={`relative w-full lg:w-[55%] h-[450px] sm:h-[520px] md:h-[560px] lg:h-[520px] rounded-[20px] overflow-hidden transition-all duration-700 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
            {/* Gradient Background - white to teal */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background: 'linear-gradient(to bottom, #ffffff 0%, #f0fafa 30%, #c5e8e4 55%, #1a6b6b 78%, #014E4E 100%)',
              }}
            />

            {/* Poonam Sagar Cutout Image */}
            <div className="absolute inset-0 z-10 flex items-end justify-center">
              <div className="relative w-[280px] h-[400px] sm:w-[320px] sm:h-[460px] md:w-[360px] md:h-[500px] lg:w-[320px] lg:h-[470px]">
                <Image
                  src="https://ik.imagekit.io/br0mssyqj/tr:q-85,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6f6a14dfc9fbf5ad602.jpg"
                  alt="Dietitian Poonam Sagar"
                  fill
                  className="object-contain object-bottom"
                  loading="lazy"
                  sizes="(max-width: 639px) 280px, (max-width: 767px) 320px, (max-width: 1023px) 360px, 320px"
                  quality={85}
                />
              </div>
            </div>

            {/* Vertical POONAM SAGAR Text - Right Side */}
            <div className="absolute right-[12px] sm:right-[18px] md:right-[24px] top-[40px] sm:top-[50px] z-20">
              <div
                className={`${poppins.className} text-center leading-none tracking-[0.1em] font-bold`}
                style={{ writingMode: 'vertical-rl' }}
              >
                <span className="text-[#3AB1A0] text-[32px] sm:text-[38px] md:text-[42px]">POONAM </span>
                <span className="text-[#FF850B] text-[32px] sm:text-[38px] md:text-[42px]">SAGAR</span>
              </div>
            </div>

            {/* Bottom fade to blend with card background */}
            <div className="absolute inset-x-0 bottom-0 h-[60px] z-10" style={{ background: 'linear-gradient(to top, #014E4E, transparent)' }} />
          </div>

          {/* Cards overlapping the image - Desktop */}
          <div className="hidden lg:flex flex-col gap-5 absolute right-0 top-1/2 -translate-y-1/2 w-[440px]" style={{ left: '45%' }}>
            {expertiseCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-[16px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <h3 className="text-[1.15rem] font-bold text-[#1a1a1a] mb-3">
                  {card.title}
                </h3>
                <p className="text-[#666] text-[0.875rem] leading-[1.7] mb-4">
                  {card.description}
                </p>
                <Link
                  href={card.link}
                  className="inline-flex items-center gap-2 text-[#0d9488] font-semibold text-[0.9rem] hover:gap-3 transition-all duration-300"
                >
                  Read More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          {/* Cards for Mobile - Below image */}
          <div className="lg:hidden flex flex-col gap-4 mt-5">
            {expertiseCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${400 + index * 150}ms` }}
              >
                <h3 className="text-[1.1rem] font-bold text-[#1a1a1a] mb-2">
                  {card.title}
                </h3>
                <p className="text-[#666] text-[0.85rem] leading-[1.7] mb-3">
                  {card.description}
                </p>
                <Link
                  href={card.link}
                  className="inline-flex items-center gap-2 text-[#0d9488] font-semibold text-[0.875rem] hover:gap-3 transition-all duration-300"
                >
                  Read More
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

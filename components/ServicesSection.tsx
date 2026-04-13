"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      title: 'Personalized Solutions for Every Health Goal',
      description:
        'At DTPS, we first understand how you eat, how your day looks, and what health issues you\'re dealing with. Then we plan food using regular ghar ka khana in a way that can actually be followed.',
      icon: '/Personalizedicon.svg',
      featured: true,
      link: '/plans/therapeutic',
    },
    {
      title: 'Weight Loss & Wellness',
      description:
        'Weight loss needs proper portions, sensible timing and food you already eat at home. When that is fixed, weight starts moving without any dramatic changes in your lifestyle.',
      icon: '/Weighticon.svg',
      featured: false,
      link: '/weight-loss',
    },
    {
      title: 'PCOD & PCOS Nutrition',
      description:
        'With PCOD, the problem isn\'t food quantity. It\'s irregular meals, sugar spikes, and confused eating patterns. We correct that slowly so the body starts responding instead of resisting.',
      icon: '/pcodicon.svg',
      featured: false,
      link: '/pcod',
    },
    {
      title: 'Therapeutic Nutrition',
      description:
        'When you have thyroid, diabetes, or cholesterol, food can\'t be random. We plan meals that support your treatment and daily energy, not just weight loss.',
      icon: '/Therapeuticicon.svg',
      featured: false,
      link: '/plans/therapeutic',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="site-card-padding bg-gray-100 py-10 md:py-16 rounded-[20px] md:rounded-[30px]"
    >
      <div className="site-fill">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {/* Header Card */}
          <div
            className={`p-6 flex flex-col justify-center transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[30px] opacity-0'
              }`}
          >
            <div className="flex items-center gap-2 mb-4 md:flex md:items-center md:gap-2 md:justify-normal justify-center">
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-teal-600 text-base font-semibold">
                Services
              </span>
            </div>

            <h2 className="text-[1.5rem] sm:text-[2rem] md:text-[2.5rem] font-bold text-gray-900 leading-tight mb-4 whitespace-nowrap md:whitespace-normal">
              <div className="md:hidden text-center">What We Help With</div>
              <span className="hidden md:inline">
                What We Help<br />With
              </span>
            </h2>
            <p className="text-[0.95rem] text-gray-500  text-center md:text-left leading-relaxed mb-6">
              Most people don&apos;t fail at dieting.<br />
              They just get plans that don&apos;t match their daily life.
            </p>
            <Link href="/plans/therapeutic" className="flex justify-center md:justify-start">
              <button
                className=" bg-gradient-to-br from-[#f5a623] to-[#f57c00] text-white text-[0.95rem] font-semibold py-3.5 px-7 rounded-full border-none cursor-pointer shadow-[0_6px_20px_rgba(245,124,0,0.3)] transition-all duration-300 w-fit hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(245,124,0,0.4)]"
              >
                All Services
              </button>
            </Link>
          </div>

          {/* Personalized Solutions Card - Featured Orange */}
          <div
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`bg-gradient-to-br from-[#f5a623] to-[#f57c00] rounded-[20px] p-8 flex flex-col cursor-pointer transition-all duration-500 ease-out ${isVisible
              ? (hoveredCard === 0 ? '-translate-y-2.5 shadow-[0_20px_40px_rgba(245,124,0,0.4)]' : 'translate-y-0')
              : 'translate-y-[30px] opacity-0'
              }`}
          >
            <div className="flex items-center justify-center mb-6 w-14 h-14">
              <Image
                src={services[0].icon}
                alt={services[0].title}
                width={32}
                height={32}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </div>
            <h3 className="text-[1.35rem] font-bold text-white mb-4">
              {services[0].title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-white/90">
              {services[0].description}
            </p>
          </div>

          {/* Weight Loss Card */}
          <div
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`rounded-[20px] p-8 flex flex-col cursor-pointer transition-all duration-500 ease-out ${hoveredCard === 1
              ? 'bg-gradient-to-br from-[#f5a623] to-[#f57c00] -translate-y-2.5 shadow-[0_20px_40px_rgba(245,124,0,0.3)]'
              : 'bg-white'
              } ${isVisible ? '' : 'translate-y-[30px] opacity-0'}`}
          >
            <div
              className="w-14 h-14 flex items-center justify-center mb-6"
            >
              <Image
                src={services[1].icon}
                alt={services[1].title}
                width={32}
                height={32}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </div>
            <h3
              className={`text-[1.35rem] font-bold mb-4 transition-all duration-500 ${hoveredCard === 1 ? 'text-white' : 'text-gray-900'
                }`}
            >
              {services[1].title}
            </h3>
            <p
              className={`text-sm leading-relaxed flex-1 transition-all duration-500 ${hoveredCard === 1 ? 'text-white/90' : 'text-gray-500'
                }`}
            >
              {services[1].description}
            </p>
          </div>

          {/* PCOD Card */}
          <div
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`rounded-[20px] p-8 flex flex-col cursor-pointer transition-all duration-500 ease-out ${hoveredCard === 2
              ? 'bg-gradient-to-br from-[#f5a623] to-[#f57c00] -translate-y-2.5 shadow-[0_20px_40px_rgba(245,124,0,0.3)]'
              : 'bg-white'
              } ${isVisible ? '' : 'translate-y-[30px] opacity-0'}`}
          >
            <div
              className="w-14 h-14 flex items-center justify-center mb-6"
            >
              <Image
                src={services[2].icon}
                alt={services[2].title}
                width={32}
                height={32}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </div>
            <h3
              className={`text-[1.35rem] font-bold mb-4 transition-all duration-500 ${hoveredCard === 2 ? 'text-white' : 'text-gray-900'
                }`}
            >
              {services[2].title}
            </h3>
            <p
              className={`text-sm leading-relaxed flex-1 transition-all duration-500 ${hoveredCard === 2 ? 'text-white/90' : 'text-gray-500'
                }`}
            >
              {services[2].description}
            </p>
          </div>

          {/* Therapeutic Nutrition Card */}
          <div
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`rounded-[20px] p-8 flex flex-col cursor-pointer transition-all duration-500 ease-out ${hoveredCard === 3
              ? 'bg-gradient-to-br from-[#f5a623] to-[#f57c00] -translate-y-2.5 shadow-[0_20px_40px_rgba(245,124,0,0.3)]'
              : 'bg-white'
              } ${isVisible ? '' : 'translate-y-[30px] opacity-0'}`}
          >
            <div
              className="w-14 h-14 flex items-center justify-center mb-6"
            >
              <Image
                src={services[3].icon}
                alt={services[3].title}
                width={32}
                height={32}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                unoptimized
              />
            </div>
            <h3
              className={`text-[1.35rem] font-bold mb-4 transition-all duration-500 ${hoveredCard === 3 ? 'text-white' : 'text-gray-900'
                }`}
            >
              {services[3].title}
            </h3>
            <p
              className={`text-sm leading-relaxed flex-1 transition-all duration-500 ${hoveredCard === 3 ? 'text-white/90' : 'text-gray-500'
                }`}
            >
              {services[3].description}
            </p>
          </div>

          {/* CTA Card - "What happens after I start?" */}
          <div
            className={`rounded-[20px] overflow-hidden relative min-h-[280px] transition-all duration-500 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[30px] opacity-0'
              }`}
          >
            <Image
              src="/girlthali.png"
              alt="What happens after I start"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 767px) 100vw, 50vw"
              quality={75}
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/80 via-black/50 to-black/30">
              <p className="mb-1 text-sm text-white/80">If you&apos;re thinking,</p>
              <h3 className="text-[1.8rem] font-bold text-white leading-tight mb-4">
                What happens<br />after I start?
              </h3>
              <p className="text-sm leading-relaxed text-white/90">
                You&apos;re guided, tracked, and supported<br />until results show.<br />
                Click Here to know the full process!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

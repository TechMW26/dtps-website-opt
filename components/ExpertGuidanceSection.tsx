"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Epilogue, Inter, Poppins } from "next/font/google";

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type CounterState = {
  rating: number;
  success: number;
  clients: number;
};

const badges = [
  { label: "200+ Certified Dietitians", icon: "dietitians" },
  { label: "Science-Based Planning", icon: "brain" },
  { label: "Ghar Ka Khana Expertise", icon: "home" },
  { label: "Proven Results", icon: "chart" },
  { label: "Award-Winning Dietitian", icon: "award" },
  { label: "Clinically Guided Nutrition", icon: "nutrition" },
] as const;

const mediaCards = [
  {
    image: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c64aa14dfc9fbf5ad48f.jpg",
    title: "Iconic Business Women (Health & Nutrition) Award 2024",
    desc: "Poonam Ma'am was recognized for her impactful work in wellness and evidence-based nutrition. The award was graciously presented by Actress Bhagyashree.",
  },
  {
    image: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6f2a14dfc9fbf5ad5ea.jpg",
    title: "Dainik Bhaskar Women Entrepreneur Award",
    desc: "Poonam Ma'am was honored for her exceptional leadership in the health and nutrition field. The award was presented by India's first female IPS officer, Dr. Kiran Bedi.",
  },
  {
    image: "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6eaa14dfc9fbf5ad5ba.jpg",
    title: "News 18 Narayani Namah Award",
    desc: "This award acknowledges Poonam Ma'am's dedication to transforming lives through personalized nutrition. Her commitment to community well-being continues to inspire many.",
  },
];

const newsLogos = [
  "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c662a14dfc9fbf5ad4d0.jpg",
  "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c64aa14dfc9fbf5ad48d.jpg",
  "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c659a14dfc9fbf5ad4bc.jpg",
  "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c649a14dfc9fbf5ad48b.jpg",
  "https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c668a14dfc9fbf5ad4dd.jpg",
];

function BadgeIcon({ type }: { type: (typeof badges)[number]["icon"] }) {
  const iconSrcMap: Record<(typeof badges)[number]["icon"], string> = {
    dietitians: "/images/license.png",
    brain: "/images/neurology.png",
    home: "/images/japanese_curry%20(1).png",
    chart: "/images/bar_chart_4_bars.png",
    award: "/images/award_star.png",
    nutrition: "/images/nutrition.png",
  };

  const iconSrc = iconSrcMap[type];

  if (!iconSrc) {
    return null;
  }

  return (
    <Image
      src={iconSrc}
      alt=""
      width={24}
      height={24}
      className="object-contain"
      style={{ width: 'auto', height: 'auto' }}
      loading="lazy"
      sizes="24px"
      unoptimized
    />
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5.25 3.5L8.75 7L5.25 10.5"
        stroke="#1E1E1E"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CounterBox({
  value,
  label,
  stacked = false,
}: {
  value: string;
  label: string;
  stacked?: boolean;
}) {
  return (
    <div className="bg-[#FF850B] rounded-[16px] h-[140px] flex flex-col items-center justify-center text-center">
      {!stacked ? (
        <div className={poppins.className}>
          <div className="text-white text-[36px] leading-none font-semibold">{value}</div>
          <div className="mt-3 text-white text-[14px] leading-[1.15] font-semibold">{label}</div>
        </div>
      ) : (
        <div className={`${poppins.className} flex flex-col items-center gap-2`}>
          <div className="text-white text-[14px] leading-none font-semibold">Personalised</div>
          <div className="text-white text-[36px] leading-none font-semibold">Ghar</div>
          <div className="text-white text-[14px] leading-[1.15] font-semibold">ka Khana Diet Plan</div>
        </div>
      )}
    </div>
  );
}

export default function ExpertGuidanceSection({ variant = 'teal' }: { variant?: 'teal' | 'maroon' }) {
  const colors = variant === 'maroon'
    ? { bg: '#4E0101', bgDark: '#4E0101', accent: '#3AB1A0', gradient: '#4E0101' }
    : { bg: '#005A5A', bgDark: '#014E4E', accent: '#3AB1A0', gradient: '#014E4E' };

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState<CounterState>({
    rating: 0,
    success: 0,
    clients: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      const progress = step / steps;

      setCounters({
        rating: Math.round(48 * progress) / 10,
        success: Math.round(98 * progress),
        clients: Math.round(75 * progress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full max-w-7xl mx-auto my-8 md:my-12 lg:my-16 overflow-hidden rounded-[24px] ${epilogue.className}`}
      style={{ backgroundColor: colors.bg }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="absolute left-[-10px] top-[10px] h-[74px] w-[34px] rounded-full border border-white/30" />
        <div className="absolute left-[14px] top-[40px] h-[44px] w-[20px] rounded-full border border-white/30" />
        <div className="absolute left-[20px] top-[560px] h-[120px] w-[50px] rounded-full border border-white/20 rotate-[24deg]" />
        <div className="absolute right-[10px] top-[70px] h-[120px] w-[50px] rounded-full border border-white/20 rotate-[22deg]" />
      </div>

      <div className="mx-auto max-w-[1200px] px-2 md:px-4 lg:px-6">
        <div className="pt-6 md:pt-[60px] flex flex-col items-center gap-[6px]">
          <h2 className="text-center text-[#FBFBFB] text-[28px] leading-[1.05] md:text-[32px] md:leading-[36px] font-bold max-w-[330px] md:max-w-none">
            You are under Expert&apos;s Guidance
          </h2>
          <p className={`${inter.className} text-center text-[#FAFAFA] text-[16px] md:text-[20px] font-normal`}>
            Meet the Founder Behind DTPS
          </p>
        </div>

        <div className="mt-8 md:mt-[68px] flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-8 lg:px-10 xl:px-14">
          <div
            className={`relative order-1 lg:order-2 w-full lg:w-[283px] h-[500px] sm:h-[560px] lg:h-[547px] lg:mr-8 xl:mr-16 transition-all duration-700 delay-150 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
          >
            <div className="absolute inset-0">
              <div className="absolute left-1/2 -translate-x-[58%] lg:-translate-x-1/2 top-[62px] lg:top-[5px] w-[250px] h-[420px] sm:w-[280px] sm:h-[470px] lg:w-[253px] lg:h-[542px]">
                <Image
                  src="/images/realpoonam.png"
                  alt="Dietitian Poonam Sagar"
                  fill
                  className="object-contain object-bottom"
                  loading="lazy"
                  sizes="(max-width: 639px) 250px, (max-width: 1023px) 280px, 253px"
                  quality={75}
                />
                <div className="absolute inset-x-0 bottom-[-2px] h-[84px]" style={{ background: `linear-gradient(to top, ${colors.bg}, ${colors.bg}B3, transparent)` }} />
              </div>
            </div>
          </div>

          <div
            className={`order-2 lg:order-1 w-full max-w-[589px] transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
          >
            <div className="text-white text-[14px] leading-[1.6] md:text-[16px] md:leading-[26px] font-normal">
              <p>
                DTPS is led by Dietitian Poonam Sagar, a name trusted by thousands of families
                across India and beyond. With 25+ years of hands-on experience, she has worked
                with Indian as well as international clients. Her work has been recognised with
                multiple awards in the field of nutrition and wellness, but what truly sets her
                apart is not the titles. It&apos;s her belief that diet should support your life, not
                control it.
              </p>

              <p className="mt-3 md:mt-4">
                While the world pushed salads, supplements, and starvation, she built a system
                around ghar ka khana, nutrition science, and consistency. That belief is what
                became DTPS.
              </p>

              <p className="mt-2 md:mt-3">DTPS does not run on one dietitian alone.</p>

              <p className="mt-2 md:mt-3">
                It runs on a team of 200+ qualified dietitians and health counsellors, trained to
                work with real people, real routines, and real challenges.
              </p>
            </div>

            <div className="mt-8 md:mt-[38px] grid grid-cols-2 gap-4 md:gap-x-[13px] md:gap-y-[13px] max-w-[533px]">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className="min-h-[76px] md:min-h-[48px] rounded-[8px] bg-[#FF850B] px-[4px] py-[4px] flex flex-col md:flex-row items-center justify-center md:justify-start gap-[8px] text-center md:text-left"
                >
                  <div className="w-[40px] h-[40px] rounded-[5px] bg-transparent flex items-center justify-center shrink-0">
                    <BadgeIcon type={badge.icon} />
                  </div>
                  <div className="text-white text-[12px] leading-[1.1] md:text-[16px] md:leading-[1.2] font-semibold capitalize">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[40px] md:mt-[76px]">
          <div className="items-center justify-center hidden gap-20 md:flex">
            {mediaCards.map((card, index) => (
              <div
                key={card.title}
                className={`w-[290px] rounded-[12px] bg-white p-[16px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="relative h-[170px] w-full overflow-hidden rounded-[6px]">
                  <Image src={card.image} alt={card.title} fill className="object-cover" loading="lazy" sizes="228px" quality={75} />
                </div>

                <div className="mt-[16px] flex flex-col gap-[10px]">
                  <h3 className="text-[#1E1E1E] text-[18px] leading-[1.05] font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-[#1E1E1E] text-[10px] leading-[15.51px] font-light">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-[16px] w-full px-[8px] py-[8px] inline-flex items-center justify-center gap-[4px] text-[#1E1E1E]"
                >
                  <span className="text-[12px] font-medium">Read More</span>
                  <ArrowIcon />
                </button>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden md:hidden">
            <div className="flex gap-4 media-track-mobile w-max">
              {[...mediaCards, ...mediaCards].map((card, index) => (
                <div
                  key={`${card.title}-${index}`}
                  className="w-[256px] shrink-0 rounded-[12px] bg-white p-[16px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative h-[170px] w-full overflow-hidden rounded-[6px]">
                    <Image src={card.image} alt={card.title} fill className="object-cover" loading="lazy" sizes="224px" quality={75} />
                  </div>

                  <div className="mt-[16px] flex flex-col gap-[10px]">
                    <h3 className="text-[#1E1E1E] text-[18px] leading-[1.02] font-semibold">
                      {card.title}
                    </h3>
                    <p className="text-[#1E1E1E] text-[10px] leading-[15.51px] font-light">
                      {card.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-[16px] w-full px-[8px] py-[8px] inline-flex items-center justify-center gap-[4px] text-[#1E1E1E]"
                  >
                    <span className="text-[12px] font-medium">Read More</span>
                    <ArrowIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[38px] md:mt-[58px] relative left-1/2 -translate-x-1/2 w-screen overflow-hidden">
          <div
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${colors.gradient} 0%, white 30%, white 70%, ${colors.gradient} 100%)`,
            }}
          >
            <div className="logo-track flex w-max items-center gap-[24px]">
              {[...newsLogos, ...newsLogos, ...newsLogos].map((logo, index) => (
                <div
                  key={index}
                  className="relative w-[120px] h-[60px] sm:w-[160px] sm:h-[80px] md:w-[220px] md:h-[110px] lg:w-[300px] lg:h-[141px] shrink-0"
                >
                  <Image src={logo} alt={`Media logo ${index + 1}`} fill className="object-contain" loading="lazy" sizes="(max-width: 639px) 120px, (max-width: 767px) 160px, (max-width: 1023px) 220px, 300px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[40px] md:mt-[88px] pb-[18px] md:pb-[48px]">
          <div className="mx-auto grid max-w-[845px] grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <CounterBox value={counters.rating.toFixed(1)} label="Google Rating" />
            <CounterBox value={`${counters.success}%`} label="Success Rate" />
            <CounterBox value={`${counters.clients}K+`} label="Satisfied Clients" />
            <CounterBox value="" label="" stacked />
          </div>
        </div>
      </div>

      <style jsx>{`
        .logo-track {
          animation: logoScroll 30s linear infinite;
        }

        .media-track-mobile {
          animation: mediaScroll 16s linear infinite;
          padding-right: 16px;
        }

        @keyframes logoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes mediaScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 8px));
          }
        }

        @media (hover: hover) {
          .logo-track:hover,
          .media-track-mobile:hover {
            animation-play-state: paused;
          }
        }
      `}</style>
    </section>
  );
}
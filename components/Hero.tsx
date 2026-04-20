"use client";
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './Navbar';

// Optimized hero image URL with proper transformations
const HERO_IMAGE_MOBILE = "https://ik.imagekit.io/br0mssyqj/tr:w-400,q-75,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png";
const HERO_IMAGE_DESKTOP = "https://ik.imagekit.io/br0mssyqj/tr:w-600,q-80,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png";

export default function Hero() {
  return (
    <section className="site-shell pt-4 md:pt-[60px] bg-white" suppressHydrationWarning>
      <div className="bg-[#014E4E] rounded-3xl overflow-hidden relative">
        <Navbar />

        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        {/* ================= MOBILE ================= */}

        <div className="flex flex-col px-4 pb-0 hero-container-mobile md:hidden">

          {/* Image Section - Dietitian Poonam Sagar */}
          <div className="relative flex justify-center pt-4 hero-image-mobile">
            <div className="relative">
              {/* Main Hero Image with Text */}
              <Image
                src={HERO_IMAGE_MOBILE}
                alt="Dietitian Poonam Sagar"
                width={340}
                height={380}
                className="h-[320px] w-auto"
                priority
                fetchPriority="high"
                sizes="340px"
                quality={75}
                placeholder="empty"
              />

              {/* 25+ Years Badge */}
              <div className="absolute right-[5px] top-[50%] bg-[#ff9100] py-1.5 px-2.5 rounded-[8px] flex items-center gap-1 z-[4] shadow-[0_10px_30px_rgba(245,124,0,0.3)]">
                <span className="text-[1rem] font-extrabold text-white leading-none">25+</span>
                <span className="text-[0.45rem] text-white leading-[1.2] font-medium">
                  Years of<br />experience
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="hero-content-mobile relative z-[2] px-2 text-left pt-6 pb-8">

            <div className="inline-flex items-center gap-2 text-[#ff9100] font-medium text-sm mb-3">
              <span className="text-[#ff9100]">✦</span> Holistic Care
            </div>

            <h1 className="text-[1.75rem] font-bold text-white leading-[1.2] mb-3">
              Transform your health<br />
              embrace life today!
            </h1>

            <p className="text-white/75 text-[0.85rem] leading-[1.7] mb-5">
              Achieve your wellness goals with personalized guidance, expert support,
              and sustainable habits for a healthier, happier you.
            </p>

            <div className="flex flex-row items-center gap-4">

              <Link href="/weight-loss-plan" className="px-6 py-3 text-sm btn btn-primary">
                Know More
              </Link>

              <div className="flex items-center gap-2">

                <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-white/10 border-white/20">
                  <Image
                    src="/phoneicon.svg"
                    alt="Phone Icon"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-white/60 text-[0.7rem]">Call Us 24/7</span>
                  <span className="text-white font-bold text-[0.9rem]">9893027688</span>
                </div>

              </div>

            </div>

            {/* Reviews */}
            <div className="flex items-center gap-3 mt-5">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#0d4043] bg-[#0d9488] flex items-center justify-center text-white text-[10px] font-bold">K</div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0d4043] -ml-2 bg-[#0d9488] flex items-center justify-center text-white text-[10px] font-bold">F</div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0d4043] -ml-2 bg-[#0d9488] flex items-center justify-center text-white text-[10px] font-bold">R</div>
              </div>
              <div className="flex items-center gap-1 text-white">
                <span className="text-sm font-bold">5.0</span>
                <span>⭐</span>
                <span className="text-white/60 text-[0.75rem]">(15.5k review)</span>
              </div>
            </div>

          </div>
        </div>

        {/* ================= DESKTOP ================= */}

        <div className="hero-container site-card-padding hidden md:grid md:grid-cols-2 md:items-end w-full pb-0 h-[520px] lg:h-[560px] xl:h-[580px]">

          {/* LEFT CONTENT */}

          <div className="hero-content relative z-[2] text-left self-center pb-12 lg:pb-16">

            <div className="hero-label inline-flex items-center gap-2 text-[#ff9100] font-medium text-base mb-4">
              <span className="star text-[#ff9100]">✦</span> Holistic Care
            </div>

            <h1 className="hero-title text-[2.5rem] lg:text-[3rem] xl:text-[3.3rem] 2xl:text-[3.6rem] font-bold text-white leading-[1.2] mb-5">
              Transform your<br />
              health embrace<br />
              life today!
            </h1>

            <p className="hero-desc text-white/75 text-sm lg:text-base leading-[1.7] mb-6 max-w-[450px]">
              Achieve your wellness goals with personalized guidance, expert support,
              and sustainable habits for a healthier, happier you.
            </p>

            <div className="flex flex-row items-center justify-start gap-4 mb-8 hero-actions">

              <Link href="/weight-loss-plan" className="px-6 py-3 text-sm btn btn-primary lg:text-base lg:px-8">
                Know More
              </Link>

              <div className="flex items-center gap-3 hero-phone">
                <div className="flex items-center justify-center w-10 h-10 border rounded-full phone-icon lg:w-12 lg:h-12 bg-white/10 border-white/20">
                  <Image
                    src="/phoneicon.svg"
                    alt="Phone Icon"
                    width={24}
                    height={24}
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col phone-info">
                  <span className="phone-label text-white/60 text-[0.7rem] lg:text-[0.8rem]">Call Us 24/7</span>
                  <span className="phone-number text-white font-bold text-[0.9rem] lg:text-[1.05rem]">
                    9893027688
                  </span>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-start gap-3 hero-reviews">

              <div className="flex items-center review-avatars">

                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#0d4043] bg-[#0d9488] flex items-center justify-center text-white text-[10px] lg:text-[11px] font-bold">K</div>

                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#0d4043] -ml-2 lg:-ml-2.5 bg-[#0d9488] flex items-center justify-center text-white text-[10px] lg:text-[11px] font-bold">F</div>

                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#0d4043] -ml-2 lg:-ml-2.5 bg-[#0d9488] flex items-center justify-center text-white text-[10px] lg:text-[11px] font-bold">R</div>

                <span className="review-count w-8 h-8 lg:w-9 lg:h-9 bg-[#0d9488] rounded-full flex items-center justify-center text-white text-[0.65rem] lg:text-[0.7rem] font-bold -ml-2 lg:-ml-2.5">
                  15K
                </span>

              </div>

              <div className="flex items-center gap-1 text-white review-rating">
                <span className="text-sm font-bold rating-score lg:text-base">5.0</span>
                <span className="rating-star">⭐</span>
                <span className="rating-text text-white/60 text-[0.75rem] lg:text-[0.85rem]">(15.5k review)</span>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE - Dietitian Poonam Sagar */}

          <div className="relative flex items-end self-end justify-center hero-image">

            <div className="relative">
              {/* Main Hero Image with Text */}
              <Image
                src={HERO_IMAGE_DESKTOP}
                alt="Dietitian Poonam Sagar"
                width={500}
                height={600}
                className="h-[480px] w-auto max-h-full"
                priority
                fetchPriority="high"
                sizes="(max-width: 1023px) 0px, (max-width: 1279px) 420px, (max-width: 1535px) 540px, 600px"
                quality={80}
                placeholder="empty"
              />

              {/* 25 Years Badge */}
              <div className="hero-badge-bottom absolute right-[10px] lg:right-[20px] xl:right-[30px] top-[50%]
bg-[#ff9100] px-4 py-[4px] rounded-[10px]
flex items-center gap-2 z-[4] w-fit h-fit">

                <span className="badge-number text-[1.4rem] lg:text-[1.6rem] xl:text-[1.7rem]
  font-extrabold text-white leading-none">
                  25+
                </span>

                <span className="badge-text text-[0.65rem] lg:text-[0.75rem]
  text-white leading-[1] font-medium">
                  Years of<br />experience
                </span>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
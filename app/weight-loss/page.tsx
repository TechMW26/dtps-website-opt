'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import PageWrapper from '@/components/PageWrapper';
import TransformationGallery from '@/components/TransformationGallery';
import DynamicPopup from '@/components/DynamicPopup';
import PlanBannerDisplay from '@/components/PlanBannerDisplay';
import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import { getPricingByCategory } from '@/lib/api';
import DynamicPageHero from '@/components/DynamicPageHero';
import { getOptimizedUrl } from '@/lib/imagekit';
import type { Pricing } from '@/lib/api';

/* ─── SVG ICON COMPONENTS FOR WHAT TO EXPECT ─── */
function SupplementIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" />
      <path d="M16.5 7.5l-9 9M7.5 7.5l3 3M13.5 13.5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StarvationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 11h8M8 14.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V19a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GymIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5v11M17.5 6.5v11" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 8.5v7M20 8.5v7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6.5 12h11" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── DATA ─── */
const expectFeatures = [
  { iconComponent: <SupplementIcon />, title: 'No Supplements', desc: 'Achieve your health goals naturally' },
  { iconComponent: <StarvationIcon />, title: 'No Starvation', desc: 'Enjoy balanced meals without feeling deprived.' },
  { iconComponent: <HomeIcon />, title: 'Home Based Diet', desc: 'Convenient and effective plans for your home.' },
  { iconComponent: <GymIcon />, title: 'No Gymnasium', desc: 'Get fit without stepping into a gym.' },
];

const whatYouGet = [
  'Ghar ka Khana Focus',
  'Weekly Follow-ups',
  'Personal Diet Assistant',
  'Multiple Food Options',
  'Lifestyle based curated Diet Plans',
  'Sustainable Weight Management',
];

const expertBadges = [
  { icon: '⭐', text: '200+ Certified Dietitians' },
  { icon: '🧠', text: 'Science-Based Planning' },
  { icon: '🍛', text: 'Ghar Ka Khana Expertise' },
  { icon: '📊', text: 'Proven Results' },
  { icon: '🏆', text: 'Award-Winning Dietitian' },
  { icon: '🥗', text: 'Clinically Guided Nutrition' },
];

const stats = [
  { value: '4.8', label: 'Google Rating' },
  { value: '98%', label: 'Success Rate' },
  { value: '75K+', label: 'Clients' },
];

const fallbackTestimonials = [
  { name: 'Bessie Cooper', role: 'Co-Founder', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: '/api/images/69b7c744a14dfc9fbf5ad78c' },
  { name: 'Floyd Miles', role: 'Chairman', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: '/api/images/69b7c744a14dfc9fbf5ad78e' },
  { name: 'Kathryn Murphy', role: 'CEO', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: '/api/images/69b7c75ca14dfc9fbf5ad7de' },
  { name: 'Jerome Bell', role: 'Finance Director', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: '/api/images/69b7c66ea14dfc9fbf5ad4f4' },
];

type Testimonial = { _id?: string; name: string; role?: string; content: string; image: string };

/* ─── SMALL COMPONENTS ─── */
function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="w-[14px] h-[14px] rounded-sm bg-[#FF850B] inline-block" />
      <span className="text-[#014E4E] font-semibold text-[11px] md:text-[13px]" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>
        {children}
      </span>
    </div>
  );
}

function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`text-[28px] md:text-[36px] lg:text-[46px] font-extrabold leading-[1.12] ${className}`}
      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
    >
      {children}
    </h2>
  );
}

function CheckIcon40({ color = '#014E4E' }: { color?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="shrink-0">
      <circle cx="20" cy="20" r="20" fill={color} />
      <path d="M12 20l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon24() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="12" fill="#FF850B" />
      <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Gold coin is now rendered with the actual image */

/* ────────────────────────────────────────────────────────────── */
export default function WeightLossPage() {
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [expandedPricingCards, setExpandedPricingCards] = useState<Record<string, boolean>>({});

  const testimonialImages = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const heroImage1 = testimonialImages[0]?.image || '/api/images/69b7c744a14dfc9fbf5ad78c';
  const heroImage2 = testimonialImages[1]?.image || '/api/images/69b7c744a14dfc9fbf5ad78e';
  const heroImage3 = testimonialImages[2]?.image || '/api/images/69b7c75ca14dfc9fbf5ad7de';

  /* Fetch pricing */
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const dbPricing = await getPricingByCategory('weight-loss');
        if (dbPricing && dbPricing.length > 0) {
          const formattedPricing = dbPricing.map((plan: Pricing) => ({
            label: plan.planName,
            badge: plan.badge,
            badgeColor: plan.badgeColor?.toLowerCase() || 'gray',
            price: `₹${plan.price.toLocaleString()}`,
            original: `₹${plan.originalPrice.toLocaleString()}`,
            features: plan.features.map(f => f.text),
            planId: plan._id,
          }));
          setPricingPlans(formattedPricing);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
        setPricingPlans([]);
      } finally {
        setLoadingPricing(false);
      }
    };
    fetchPricing();
  }, []);

  /* Fetch testimonials */
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials?page=weight-loss&active=true');
        if (!res.ok) throw new Error('Failed to fetch testimonials');
        const data = await res.json();
        const normalized = (data.testimonials || []).map((item: any) => ({
          _id: item._id,
          name: item.name || 'Client',
          role: item.role || '',
          content: item.content || '',
          image: getOptimizedUrl(item.image || '/api/images/69b7c909bfd19f93f09dc3e1', { width: 180, height: 180, quality: 80, format: 'auto' }),
        }));
        if (normalized.length > 0) setTestimonials(normalized);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials(fallbackTestimonials);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <main className="bg-white">
      <DynamicPopup page="weight-loss" />

      {/* ═════ HERO ═════ */}
      <PageWrapper>
        <DynamicPageHero
          page="weight-loss"
          fallback={{
            title: 'Guaranteed Weight Loss',
            subtitle: 'Upto 5 Kg in a Month',
            description: "It's a journey to self-discovery and a healthier, happier you. We believe weight loss is more than just a number on the scale.",
            buttonText: 'Buy Weight Loss Plan Now',
            buttonLink: '/appointment',
          }}
        />
      </PageWrapper>

 {/* ═════ TESTIMONIALS GALLERY ═════ */}
<section className="py-12 md:py-20 px-4 md:px-12 lg:px-[120px]">
  <div className="max-w-[1000px] mx-auto">

    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">

      <div className="max-w-[630px]">
        <SectionLabel>Our Testimonials</SectionLabel>

        <SectionTitle className="text-[#1E1E1E] mt-2">
          Success stories from our clients
        </SectionTitle>

        <p
          className="text-[#828283] text-[12px] md:text-[14px] mt-2"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Join our Plan today and embark on a journey to better health with our weight loss plan!
        </p>
      </div>

    </div>

    {/* Transformation Cards Slider */}
    <TransformationGallery
      page="weight-loss"
      title=""
      subtitle=""
      maxItems={6}
    />

  </div>
</section>

      {/* ═════ FIVE CYCLE PROGRAM ═════ */}
      <section className="px-4 md:px-12 lg:px-[120px]">
        {/* Desktop Version */}
        <div className="hidden lg:block">
          <Image
            src="/api/images/69b7c6b6a14dfc9fbf5ad567"
            alt="Our Five-Cycle Program - Desktop"
            width={1200}
            height={600}
            loading="lazy"
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="w-full h-auto"
          />
        </div>

        {/* Mobile Version */}
        <div className="lg:hidden">
          <Image
            src="/api/images/69b7c6caa14dfc9fbf5ad56f"
            alt="Our Five-Cycle Program - Mobile"
            width={600}
            height={800}
            loading="lazy"
            sizes="100vw"
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* ═════ WHAT TO EXPECT ═════ */}
      <section className="py-14 md:py-24 px-4 md:px-12 lg:px-[120px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block">
            <Image
              src="/api/images/69b7c729a14dfc9fbf5ad70f"
              alt="What to Expect - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="w-full h-auto"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden">
            <Image
              src="/api/images/69b7c729a14dfc9fbf5ad70f"
              alt="What to Expect - Mobile"
              width={600}
              height={800}
              loading="lazy"
              sizes="100vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ═════ MONEY BACK GUARANTEE ═════ */}
      <section className="px-4 md:px-12 lg:px-[120px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block">
            <Image
              src="/api/images/69b7c710a14dfc9fbf5ad6a4"
              alt="100% Money Back Guarantee - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="w-full h-auto"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden">
            <Image
              src="/api/images/69b7c711a14dfc9fbf5ad6ab"
              alt="100% Money Back Guarantee - Mobile"
              width={600}
              height={800}
              loading="lazy"
              sizes="100vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ═════ WHAT DO YOU GET ═════ */}
      <section className="px-4 md:px-12 lg:px-[120px] py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block">
            <Image
              src="/api/images/69b7c732a14dfc9fbf5ad73f"
              alt="What You Get - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="w-full h-auto"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden">
            <Image
              src="/api/images/69b7c73ca14dfc9fbf5ad766"
              alt="What You Get - Mobile"
              width={600}
              height={800}
              loading="lazy"
              sizes="100vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* ═════ EXPERT'S GUIDANCE ═════ */}
      <div className="section-wrapper">
        <ExpertGuidanceSection />
      </div>

      {/* ═════ OUR PROGRAMS ═════ */}
      <div className="section-wrapper">
      <section className="bg-white py-16 md:py-20 px-4 md:px-8 rounded-[30px] overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-start justify-between mb-6 md:mb-10 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#ff9100] text-xl">✦</span>
                <span className="text-teal-600 font-semibold text-base">Hear from our Happy Clients</span>
              </div>
              <h2 className="text-[2rem] md:text-[2.5rem] font-bold text-gray-900 leading-tight">
                Tailored programs for<br />your wellness
              </h2>
            </div>
          </div>
          <YouTubeShortsSlider />
        </div>
      </section>
      </div>

      {/* ═════ PRICING ═════ */}
      <section className="py-12 md:py-20 px-4 md:px-12 lg:px-[120px]">
        <div className="text-center mb-10">
          <SectionLabel className="justify-center">Our Plans</SectionLabel>
          <SectionTitle className="text-[#1E1E1E] mt-2">Our Pricing</SectionTitle>
          <p className="text-[#828283] text-[12px] md:text-[14px] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join our Plan today and embark on a journey to better health with our weight loss plan!
          </p>
        </div>

        {loadingPricing ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#014E4E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-[1000px] mx-auto">
            {pricingPlans.map((plan: any, index: number) => (
              <div key={index} className="w-full h-full">
                {/* Plan Banner */}
                {plan.planId && (
                  <div className="mb-2">
                    <PlanBannerDisplay planId={plan.planId} />
                  </div>
                )}
                {/* Card */}
                <div className="bg-white rounded-[12px] shadow-[0_0_4px_rgba(0,0,0,0.25)] overflow-hidden p-6 flex flex-col h-full relative">
                  {(() => {
                    const cardKey = String(plan.planId || plan.label || index);
                    const isExpanded = !!expandedPricingCards[cardKey];
                    const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, 4);
                    const hasMoreFeatures = plan.features.length > 4;

                    return (
                      <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-[#6B7280] text-[14px] font-semibold" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{plan.label}</p>
                      <p className="text-[#1E1E1E] text-[18px] font-semibold capitalize" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>PLAN</p>
                    </div>
                    <span className="border border-[#FF850B] rounded-full px-4 py-2 text-[10px] font-bold tracking-[1px] text-[#1E1E1E]" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>
                      {plan.badge}
                    </span>
                  </div>
                  {/* Price */}
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-[#014E4E] text-[28px] md:text-[32px] font-semibold capitalize" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{plan.price}</span>
                    <span className="text-[#6B7280] text-[16px] line-through mb-1" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{plan.original}</span>
                  </div>
                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />
                  {/* Features */}
                  <p className="font-semibold text-[#1E1E1E] text-[16px] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>What you&apos;ll get:</p>
                  <div className={`flex flex-col gap-1 ${isExpanded ? '' : 'min-h-[176px]'}`}>
                    {visibleFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckIcon24 />
                        <span className="text-[#6B7280] text-[13px] md:text-[14px] leading-snug" style={{ fontFamily: 'DM Sans, sans-serif' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {hasMoreFeatures && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedPricingCards((prev) => ({
                          ...prev,
                          [cardKey]: !prev[cardKey],
                        }));
                      }}
                      className="mt-3 text-[#FF850B] text-[12px] md:text-[13px] font-bold w-fit"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                  )}

                  {/* Buy button */}
                  <button
                    onClick={() => {
                      const price = plan.price.replace('₹', '').replace(',', '');
                      const product = {
                        id: `weight-loss-${plan.label.toLowerCase().replace(/\s+/g, '-')}`,
                        name: `Weight Loss Plan - ${plan.label}`,
                        price: parseInt(price),
                        quantity: 1,
                      };
                      sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
                      window.location.href = '/checkout';
                    }}
                    className="bg-[#FF850B] text-white font-bold text-[11px] px-5 py-2.5 rounded-full w-fit cursor-pointer mt-auto"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    BUY NOW
                  </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials Section */}
      <div className="section-wrapper">
        <section className="bg-[#f0f4f8] py-12 md:py-20 px-4 md:px-8 rounded-[30px]">
          <div className="max-w-[1200px] mx-auto">

            {/* Mobile Layout */}
            <div className="block lg:hidden">
              {/* Single image at top for mobile */}
              <div className="relative mb-6">
                <div className="w-full rounded-[16px] overflow-hidden bg-gray-200">
                  <Image
                    src="/images/threetesti.png"
                    alt="Testimonials"
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    sizes="100vw"
                    quality={80}
                    placeholder="empty"
                  />
                </div>
              </div>

              {/* Header for mobile */}
              <div className="text-left mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#ff9100] text-lg">✦</span>
                  <span className="text-teal-600 font-semibold text-sm">Our Testimonials</span>
                </div>
                <h2 className="text-[1.4rem] font-bold text-gray-900 leading-tight">
                  Success stories from our clients
                </h2>
              </div>

              {/* Testimonial Cards for mobile - carousel */}
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-[#ff9100] text-white">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic">
                    &ldquo;I am extremely happy and satisfied with my experience with Dietitian. Just 1 month, I lost 3 kg! I am genuinely thrilled with the results.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-white/20 text-white">R</div>
                    <div>
                      <div className="font-bold text-sm text-white">Rekha Rajput</div>
                      <div className="text-[0.7rem] text-white/70">Client</div>
                    </div>
                  </div>
                </div>
                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;Great experience with DTPS team. In 3 months, I achieved noticeable weight loss approx 7kgs and 2 inches reduced in upper body.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-teal-600 text-white">C</div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">Chanchal Agrawal</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>

                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;My weight and inch loss journey has been very encouraging. I have noticed a clear difference in my body measurements, especially around my waist and hips.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-teal-600 text-white">S</div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">Swati Sharma</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>

                <div className="snap-start shrink-0 w-[86%] rounded-[16px] p-4 bg-white shadow-md">
                  <p className="text-[0.8rem] leading-relaxed mb-3 italic text-gray-600">
                    &ldquo;The personalized diet plan worked wonders for me. Lost 5kg in 2 months with proper guidance and support from the team.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-teal-600 text-white">P</div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">Priya Verma</div>
                      <div className="text-[0.7rem] text-gray-500">Client</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex gap-10 items-start">
              {/* Left - Header and Testimonial Cards */}
              <div className="flex-1 max-w-[520px]">
                {/* Header */}
                <div className="text-left mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#ff9100] text-xl">✦</span>
                    <span className="text-teal-600 font-semibold text-base">Our Testimonials</span>
                  </div>
                  <h2 className="text-[2.2rem] font-bold text-gray-900 leading-tight">
                    Success stories from our clients
                  </h2>
                </div>

                {/* Testimonial Cards Grid - 2 columns, 2 rows */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 - Highlighted */}
                  <div className="rounded-[16px] p-5 bg-[#ff9100] text-white shadow-[0_10px_30px_rgba(255,145,0,0.25)]">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-white">
                      &ldquo;I am extremely happy and satisfied with my experience with Dietitian. Just 1 month, I lost 3 kg! I am genuinely thrilled with the results.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base bg-white/20 text-white">R</div>
                      <div>
                        <div className="font-bold text-sm text-white">Rekha Rajput</div>
                        <div className="text-[0.72rem] text-white/70">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;Great experience with DTPS team. In 3 months, I achieved noticeable weight loss approx 7kgs and 2 inches reduced in upper body.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base bg-teal-600 text-white">C</div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">Chanchal Agrawal</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;My weight and inch loss journey has been very encouraging. I have noticed a clear difference in my body measurements, especially around my waist and hips.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base bg-teal-600 text-white">S</div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">Swati Sharma</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4 - Additional */}
                  <div className="rounded-[16px] p-5 bg-white shadow-md">
                    <p className="text-[0.82rem] leading-relaxed mb-4 italic text-gray-600">
                      &ldquo;The personalized diet plan worked wonders for me. Lost 5kg in 2 months with proper guidance and support from the team.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base bg-teal-600 text-white">P</div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">Priya Verma</div>
                        <div className="text-[0.72rem] text-gray-500">Client</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Single testimonial image */}
              <div className="flex-1 flex justify-center items-center">
                <div className="w-full max-w-[520px] rounded-[20px] overflow-hidden bg-gray-200">
                  <Image
                    src="/images/threetesti.png"
                    alt="Testimonials"
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    sizes="(min-width: 1024px) 520px, 100vw"
                    quality={80}
                    placeholder="empty"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

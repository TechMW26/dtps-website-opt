'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageWrapper from '@/components/PageWrapper';
import DynamicPageHero from '@/components/DynamicPageHero';
import TestimonialsSection from '@/components/TestimonialsSection';
import { getPricingByCategory } from '@/lib/api';
import { getOptimizedUrl } from '@/lib/imagekit';
import type { Pricing } from '@/lib/api';
import Navbar from '@/components/Navbar';

// Dynamic imports for below-fold components
const YouTubeShortsSlider = dynamic(() => import('@/components/YouTubeShortsSlider'), {
  loading: () => <div className="min-h-[300px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: false,
});

const TransformationGallery = dynamic(() => import('@/components/TransformationGallery'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

const DynamicPopup = dynamic(() => import('@/components/DynamicPopup'), {
  ssr: false,
});

const PlanBannerDisplay = dynamic(() => import('@/components/PlanBannerDisplay'), {
  loading: () => <div className="min-h-[200px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

const ExpertGuidanceSection = dynamic(() => import('@/components/ExpertGuidanceSection'), {
  loading: () => <div className="min-h-[300px] animate-pulse bg-gray-100 rounded-[20px]" />,
  ssr: true,
});

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
  { name: 'Bessie Cooper', role: 'Co-Founder', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c744a14dfc9fbf5ad78c.jpg' },
  { name: 'Floyd Miles', role: 'Chairman', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c744a14dfc9fbf5ad78e.jpg' },
  { name: 'Kathryn Murphy', role: 'CEO', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c75ca14dfc9fbf5ad7de.jpg' },
  { name: 'Jerome Bell', role: 'Finance Director', content: "I've struggled with chronic pain for years, but health coaching gave me the tools and support.", image: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66ea14dfc9fbf5ad4f4.jpg' },
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
  const heroImage1 = testimonialImages[0]?.image || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c744a14dfc9fbf5ad78c.jpg';
  const heroImage2 = testimonialImages[1]?.image || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c744a14dfc9fbf5ad78e.jpg';
  const heroImage3 = testimonialImages[2]?.image || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c75ca14dfc9fbf5ad7de.jpg';

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
        if (!res.ok) {
          setTestimonials(fallbackTestimonials);
          return;
        }
        const data = await res.json();
        const normalized = (data.testimonials || []).map((item: any) => ({
          _id: item._id,
          name: item.name || 'Client',
          role: item.role || '',
          content: item.content || '',
          image: getOptimizedUrl(item.image || 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c909bfd19f93f09dc3e1.jpg', { width: 180, height: 180, quality: 80, format: 'auto' }),
        }));
        if (normalized.length > 0) setTestimonials(normalized);
      } catch {
        setTestimonials(fallbackTestimonials);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="pt-4 md:pt-[60px] px-3 md:px-[60px] lg:px-[120px] bg-white" suppressHydrationWarning>

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
      <section className="py-12 md:py-20">
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
      <section>
        {/* Desktop Version */}
        <div className="hidden lg:block bg-gray-100 rounded-[20px] overflow-hidden">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6b6a14dfc9fbf5ad567.jpg"
            alt="Our Five-Cycle Program - Desktop"
            width={1200}
            height={600}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={75}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
          />
        </div>

        {/* Mobile Version */}
        <div className="lg:hidden bg-gray-100 rounded-[16px] overflow-hidden">
          <Image
            src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6caa14dfc9fbf5ad56f.jpg"
            alt="Our Five-Cycle Program - Mobile"
            width={600}
            height={800}
            loading="lazy"
            decoding="async"
            sizes="100vw"
            quality={70}
            className="w-full h-auto"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
          />
        </div>
      </section>

      {/* ═════ WHAT TO EXPECT ═════ */}
      <section className="py-14 md:py-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block bg-gray-100 rounded-[20px] overflow-hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c729a14dfc9fbf5ad70f.jpg"
              alt="What to Expect - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1200px) 100vw, 1200px"
              quality={75}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden bg-gray-100 rounded-[16px] overflow-hidden">
            <Image
              src="/images/what-to-expect-mobile.png"
              alt="What to Expect - Mobile"
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              sizes="100vw"
              quality={70}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>
        </div>
      </section>

      {/* ═════ MONEY BACK GUARANTEE ═════ */}
      <section>
        <div className="max-w-[1200px] lg:max-w-none mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block bg-gray-100 rounded-[20px] overflow-hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c710a14dfc9fbf5ad6a4.jpg"
              alt="100% Money Back Guarantee - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1200px) 100vw, 1200px"
              quality={75}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden bg-gray-100 rounded-[16px] overflow-hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c711a14dfc9fbf5ad6ab.jpg"
              alt="100% Money Back Guarantee - Mobile"
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              sizes="100vw"
              quality={70}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>
        </div>
      </section>

      {/* ═════ WHAT DO YOU GET ═════ */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1200px] lg:max-w-none mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block bg-gray-100 rounded-[20px] overflow-hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c732a14dfc9fbf5ad73f.jpg"
              alt="What You Get - Desktop"
              width={1200}
              height={600}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1200px) 100vw, 1200px"
              quality={75}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>

          {/* Mobile Version */}
          <div className="lg:hidden bg-gray-100 rounded-[16px] overflow-hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c73ca14dfc9fbf5ad766.jpg"
              alt="What You Get - Mobile"
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              sizes="100vw"
              quality={70}
              className="w-full h-auto"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBQYhEhMxQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAaEQACAgMAAAAAAAAAAAAAAAABAgADBBES/9oADAMBAAIRAxEAPwCzq+6ru21m5tLa1tYYYpGRXaNi7gEgFiSOT9wKiHerEkm0tySegf2lKYUNB5ZOiVYfJ//Z"
            />
          </div>
        </div>
      </section>

      {/* ═════ EXPERT'S GUIDANCE ═════ */}
      <div className="px-3 md:px-[60px] lg:px-[120px]">
        <ExpertGuidanceSection />
      </div>

      {/* ═════ OUR PROGRAMS ═════ */}
      <div className="px-3 md:px-[60px] lg:px-[120px]">
        <section className="bg-white py-16 md:py-20 rounded-[30px] overflow-hidden">
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
      <section className="py-12 md:py-2">
        <div className="text-center mb-10 mt-2">
          <SectionLabel className="justify-center">Our Plans</SectionLabel>
          <SectionTitle className="text-[#1E1E1E] mt-4">Our Pricing</SectionTitle>
          <p className="text-[#828283] text-[12px] md:text-[14px] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join our Plan today and embark on a journey to better health with our weight loss plan!
          </p>
        </div>

        {loadingPricing ? (
          <div className="flex justify-center py-14">
            <div className="w-10 h-10 border-4 border-[#014E4E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 max-w-[1200px] mx-auto">
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
      <div className="">
        <TestimonialsSection />
      </div>
    </section>
  );
}

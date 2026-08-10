'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import {
  IndependenceDayOfferCard,
  IndependenceDayOfferPrice,
  isIndependenceDayTrialOffer,
} from '@/components/IndependenceDayOffer';
import PageWrapper from '@/components/PageWrapper';
import PlanBannerDisplay from '@/components/PlanBannerDisplay';
import TestimonialsSection from '@/components/TestimonialsSection';
import TransformationGallery from '@/components/TransformationGallery';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import type { Pricing } from '@/lib/api';

type TrialPlan = Pricing & { currency?: string };

const PROMO_SECTIONS = [
  {
    desktop: 'https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6b6a14dfc9fbf5ad567.jpg',
    mobile: 'https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c6caa14dfc9fbf5ad56f.jpg',
    alt: 'Our Five-Cycle Program',
  },
  {
    desktop: 'https://ik.imagekit.io/br0mssyqj/tr:w-900,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c729a14dfc9fbf5ad70f.jpg',
    mobile: '/images/what-to-expect-mobile.png',
    alt: 'What to Expect',
    narrow: true,
  },
  {
    desktop: 'https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c710a14dfc9fbf5ad6a4.jpg',
    mobile: 'https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c711a14dfc9fbf5ad6ab.jpg',
    alt: '100% Money Back Guarantee',
  },
  {
    desktop: 'https://ik.imagekit.io/br0mssyqj/tr:w-1200,q-75,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c732a14dfc9fbf5ad73f.jpg',
    mobile: 'https://ik.imagekit.io/br0mssyqj/tr:w-600,q-70,f-auto,pr-true/DTPS-Ecommerce/static/gridfs-69b7c73ca14dfc9fbf5ad766.jpg',
    alt: 'What You Get',
  },
] as const;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FF850B" />
      <path d="M7 12.3L10.1 15.2L17 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function findTrialPlan(plans: TrialPlan[]) {
  return (
    plans.find((plan) => /10\s*days?/i.test(`${plan.planName} ${plan.duration}`)) ??
    plans.find((plan) => plan.originalPrice === 299) ??
    plans.find((plan) => plan.price <= 299) ??
    null
  );
}

function PricingCard({ plan }: { plan: TrialPlan }) {
  const [expanded, setExpanded] = useState(false);
  const features = plan.features.filter((feature) => feature.included !== false);
  const visibleFeatures = expanded ? features : features.slice(0, 5);
  const currency = plan.currency || '₹';
  const hasIndependenceDayOffer = isIndependenceDayTrialOffer(plan);

  const handleCheckout = () => {
    const product = {
      id: `weight-loss-${plan.planName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`,
      name: `Weight Loss Plan - ${plan.planName}`,
      duration: plan.duration,
      price: plan.price,
      quantity: 1,
    };

    sessionStorage.setItem('checkoutProducts', JSON.stringify([product]));
    window.location.assign('/checkout');
  };

  return (
    <IndependenceDayOfferCard
      enabled={hasIndependenceDayOffer}
      className="flex w-full flex-col rounded-[12px] bg-white p-6 shadow-[0_10px_26px_rgba(0,0,0,0.14)]"
    >
      {(offerRevealed) => (
        <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.03em] text-[#6B7280]">
            {plan.planName}
          </p>
          <p className="mt-1 text-[17px] font-bold uppercase leading-none text-[#1F2937]">Plan</p>
        </div>
        {plan.badge ? (
          <span className="rounded-full border border-[#FF850B] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#1E1E1E]">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <IndependenceDayOfferPrice
        enabled={hasIndependenceDayOffer}
        revealed={offerRevealed}
        regularPrice={plan.originalPrice}
        offerPrice={plan.price}
        currency={currency}
        className="mt-5 text-[38px] font-extrabold leading-none"
      />

      <div className="my-5 h-px bg-[#E8E8E8]" />
      <h2 className="text-[17px] font-bold text-[#252525]">What you&apos;ll get:</h2>

      <div className="mt-4 space-y-3">
        {visibleFeatures.map((feature) => (
          <div key={feature.text} className="flex items-start gap-2.5 text-[14px] leading-[1.35] text-[#6B7280]">
            <CheckIcon />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      {features.length > 5 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 w-fit text-[13px] font-bold text-[#FF850B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF850B]"
          aria-expanded={expanded}
        >
          {expanded ? 'Show Less' : `Show All ${features.length} Benefits`}
        </button>
      ) : null}

      {plan.durationLabel ? (
        <p className="mt-5 text-[12px] leading-[1.45] text-[#8B8B8B]">Duration: {plan.durationLabel}</p>
      ) : null}

      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={handleCheckout}
          className="inline-flex w-full items-center justify-center rounded-full bg-[#FF8A14] px-4 py-3.5 text-[12px] font-bold uppercase tracking-[0.03em] text-white transition-colors hover:bg-[#EA7C10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Buy Now
        </button>
      </div>
        </>
      )}
    </IndependenceDayOfferCard>
  );
}

function PlanLoadingCard() {
  return (
    <div className="flex min-h-[466px] w-full animate-pulse flex-col rounded-[12px] bg-white p-6" role="status" aria-label="Loading plan">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-3 h-5 w-16 rounded bg-slate-200" />
      <div className="mt-7 h-10 w-40 rounded bg-slate-200" />
      <div className="my-5 h-px bg-slate-200" />
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-4 rounded bg-slate-200" />)}
      </div>
      <div className="mt-auto h-12 rounded-full bg-slate-200" />
    </div>
  );
}

export default function Plan299Page() {
  const [plan, setPlan] = useState<TrialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pricing?category=weight-loss&active=true', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load the plan.');

      const trialPlan = findTrialPlan(Array.isArray(data.pricing) ? data.pricing : []);
      if (!trialPlan) throw new Error('The weight-loss trial plan is not available right now.');
      setPlan(trialPlan);
    } catch (loadError) {
      setPlan(null);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load the plan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  return (
    <div className="site-shell bg-white pb-8 pt-4 md:pb-14 md:pt-[60px]">
      <PageWrapper>
        <div className="site-card-padding grid items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-10 lg:py-12">
          <div className="text-center">
            <h1 className="text-[32px] font-bold leading-[1.08] text-white md:text-[48px]">
              Guaranteed <span className="text-[#FF8A14]">Weight Loss</span>
              <span className="block">with <span className="text-[#FF8A14]">Ghar Ka Khana</span> Diet Plan</span>
            </h1>
            <div className="mx-auto mt-7 inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full border border-white px-8">
              <span className="text-[16px] font-semibold uppercase text-white">Up to</span>
              <span className="text-[58px] font-extrabold leading-none text-[#FF8A14]">5</span>
              <span className="text-[16px] font-semibold uppercase text-white">kgs in a month</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[350px] lg:mx-0 lg:justify-self-end">
            {plan ? <div className="mb-3"><PlanBannerDisplay planId={plan._id} /></div> : null}
            {loading ? <PlanLoadingCard /> : null}
            {!loading && plan ? <PricingCard plan={plan} /> : null}
            {!loading && error ? (
              <div className="rounded-[12px] bg-white p-6 text-center shadow-lg" role="alert">
                <p className="text-sm text-slate-700">{error}</p>
                <button type="button" onClick={() => void loadPlan()} className="mt-4 rounded-full bg-[#FF8A14] px-5 py-2.5 text-sm font-bold text-white">
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </PageWrapper>

      <section className="py-12 md:py-20">
        <div className="site-fill">
          <div className="mb-10 text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="text-lg text-[#F5A623]">✦</span>
              <span className="text-base font-semibold text-teal-600">Our Testimonials</span>
            </div>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#1E1E1E] md:text-[42px]">Success stories from our clients</h2>
          </div>
          <TransformationGallery page="weight-loss" maxItems={6} cardBackgroundClassName="bg-transparent" />
        </div>
      </section>

      {PROMO_SECTIONS.map((section, index) => (
        <section key={section.alt} className={index % 2 === 0 ? 'pb-12 md:pb-20' : 'pb-12 md:pb-20'}>
          <div className="site-fill">
            <div className={`hidden overflow-hidden rounded-[20px] bg-gray-100 lg:block ${'narrow' in section && section.narrow ? 'mx-auto w-[70%]' : ''}`}>
              <Image src={section.desktop} alt={`${section.alt} - Desktop`} width={1200} height={600} loading="lazy" sizes="(max-width: 1200px) 100vw, 1200px" quality={75} className="h-auto w-full" />
            </div>
            <div className="overflow-hidden rounded-[16px] bg-gray-100 lg:hidden">
              <Image src={section.mobile} alt={`${section.alt} - Mobile`} width={600} height={800} loading="lazy" sizes="100vw" quality={70} className="h-auto w-full" />
            </div>
          </div>
        </section>
      ))}

      <ExpertGuidanceSection />

      <section className="overflow-hidden rounded-[30px] bg-white py-16 md:py-20">
        <div className="site-fill">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#FF9100]">✦</span>
              <span className="text-base font-semibold text-teal-600">Hear from our Happy Clients</span>
            </div>
            <h2 className="mt-2 text-[1.5rem] font-bold leading-tight text-gray-900 md:text-[2.5rem]">Tailored programs for<br />your wellness</h2>
          </div>
          <YouTubeShortsSlider />
        </div>
      </section>

      <section className="py-16 md:py-24" id="plan-offer">
        <div className="mx-auto max-w-[690px] px-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#F5A623]">✦</span>
            <span className="font-semibold text-teal-600">Our Plan</span>
          </div>
          <h2 className="mt-2 text-[32px] font-extrabold text-[#252525] md:text-[48px]">Our Pricing</h2>
          <p className="mt-2 text-sm text-[#8B8B8B]">Start your weight-loss journey with our introductory plan.</p>
          <div className="mx-auto mt-10 max-w-[420px] text-left">
            {plan ? <div className="mb-3"><PlanBannerDisplay planId={plan._id} /></div> : null}
            {loading ? <PlanLoadingCard /> : null}
            {!loading && plan ? <PricingCard plan={plan} /> : null}
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </div>
  );
}

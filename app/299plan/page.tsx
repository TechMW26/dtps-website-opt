'use client';
import { storeCheckoutProducts } from '@/lib/meta-funnel';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import {
  IndependenceDayOfferCard,
  IndependenceDayOfferPrice,
  isIndependenceDayTrialOffer,
} from '@/components/IndependenceDayOffer';
import PageWrapper from '@/components/PageWrapper';
import Plan299Hero from '@/components/Plan299Hero';
import TestimonialsSection from '@/components/TestimonialsSection';
import TransformationGallery from '@/components/TransformationGallery';
import YouTubeShortsSlider from '@/components/YouTubeShortsSlider';
import type { Pricing } from '@/lib/api';
import { DEFAULT_PLAN_299_SETTINGS, type Plan299PageSettings } from '@/lib/plan299-page';

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

function CheckIcon({ color = '#FF850B' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill={color} />
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

function PricingCard({
  plan,
  settings = DEFAULT_PLAN_299_SETTINGS,
  compact = false,
}: {
  plan: TrialPlan;
  settings?: Plan299PageSettings;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const features = plan.features.filter((feature) => feature.included !== false);
  const visibleFeatures = expanded ? features : features.slice(0, settings.cardFeatureCount);
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

    storeCheckoutProducts([product]);
    window.location.assign(settings.cardButtonLink || '/checkout');
  };

  return (
    <IndependenceDayOfferCard
      enabled={hasIndependenceDayOffer}
      className="flex w-full flex-col overflow-hidden rounded-[12px] shadow-[0_10px_26px_rgba(0,0,0,0.14)]"
    >
      {(offerRevealed) => (
        <div className={`flex h-full flex-col ${compact ? 'p-4' : 'p-6'}`} style={{ backgroundColor: settings.cardBackgroundColor }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.03em]" style={{ color: settings.cardMutedColor }}>
            {plan.planName}
          </p>
          <p className="mt-1 text-[17px] font-bold uppercase leading-none" style={{ color: settings.cardHeadingColor }}>Plan</p>
        </div>
        {settings.showCardBadge && plan.badge ? (
          <span className="rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em]" style={{ borderColor: settings.cardButtonBackgroundColor, color: settings.cardHeadingColor }}>
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
        className={`${compact ? 'mt-3 text-[34px]' : 'mt-5 text-[38px]'} font-extrabold leading-none`}
      />

      {settings.showCardFeatures && (
        <>
          <div className={`${compact ? 'my-3' : 'my-5'} h-px bg-[#E8E8E8]`} />
          <h2 className="text-[17px] font-bold" style={{ color: settings.cardHeadingColor }}>{settings.cardSectionTitle}</h2>

          <div className={`${compact ? 'mt-3 space-y-2' : 'mt-4 space-y-3'}`}>
            {visibleFeatures.map((feature) => (
              <div key={feature.text} className="flex items-start gap-2.5 text-[14px] leading-[1.35]" style={{ color: settings.cardMutedColor }}>
                <CheckIcon color={settings.cardButtonBackgroundColor} />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {!compact && features.length > settings.cardFeatureCount ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-4 w-fit text-[13px] font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: settings.cardButtonBackgroundColor }}
              aria-expanded={expanded}
            >
              {expanded ? 'Show Less' : `Show All ${features.length} Benefits`}
            </button>
          ) : null}
        </>
      )}

      {settings.showCardDuration && plan.durationLabel ? (
        <p className={`${compact ? 'mt-3' : 'mt-5'} text-[12px] leading-[1.45]`} style={{ color: settings.cardMutedColor }}>Duration: {plan.durationLabel}</p>
      ) : null}

      {settings.showCardBuyButton && <div className={`mt-auto ${compact ? 'pt-3' : 'pt-6'}`}>
        <button
          type="button"
          onClick={handleCheckout}
          className={`inline-flex w-full items-center justify-center rounded-full px-4 ${compact ? 'py-2.5' : 'py-3.5'} text-[12px] font-bold uppercase tracking-[0.03em] text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          style={{ backgroundColor: settings.cardButtonBackgroundColor }}
        >
          {settings.cardButtonText}
        </button>
      </div>}
        </div>
      )}
    </IndependenceDayOfferCard>
  );
}

function PlanLoadingCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex w-full animate-pulse flex-col rounded-[12px] bg-white ${compact ? 'min-h-[390px] p-4' : 'min-h-[466px] p-6'}`} role="status" aria-label="Loading plan">
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
  const [heroSettings, setHeroSettings] = useState<Plan299PageSettings>(DEFAULT_PLAN_299_SETTINGS);

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

  useEffect(() => {
    let cancelled = false;
    fetch('/api/plan-299-page', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load hero settings');
        return data.settings as Plan299PageSettings;
      })
      .then((settings) => {
        if (!cancelled) setHeroSettings(settings);
      })
      .catch((loadError) => console.error('₹299 hero settings error:', loadError));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="site-shell bg-white pb-8 pt-4 md:pb-14 md:pt-[60px]">
      <PageWrapper>
        <Plan299Hero
          settings={heroSettings}
          cardContent={(
            <>
            {loading ? <PlanLoadingCard compact /> : null}
            {!loading && plan ? <PricingCard plan={plan} settings={heroSettings} compact /> : null}
            {!loading && error ? (
              <div className="rounded-[12px] bg-white p-6 text-center shadow-lg" role="alert">
                <p className="text-sm text-slate-700">{error}</p>
                <button type="button" onClick={() => void loadPlan()} className="mt-4 rounded-full bg-[#FF8A14] px-5 py-2.5 text-sm font-bold text-white">
                  Try Again
                </button>
              </div>
            ) : null}
            </>
          )}
        />
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
            {loading ? <PlanLoadingCard /> : null}
            {!loading && plan ? <PricingCard plan={plan} /> : null}
          </div>
        </div>
      </section>

      <TestimonialsSection />
    </div>
  );
}

"use client";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import TransformationGallery from '@/components/TransformationGallery';
import ExpertGuidanceSection from '@/components/ExpertGuidanceSection';
import PlanBannerDisplay from '@/components/PlanBannerDisplay';
import { getPricingByCategory } from '@/lib/api';
import type { Pricing } from '@/lib/api';

/* ─── DATA ─── */
const roleDietCards = [
  {
    title: 'Insulin Regulation',
    description: 'Unstructured meals and frequent sugar spikes increase insulin resistance. Insulin resistance is the common root behind diabetes, fatty liver, and rising cholesterol levels.',
  },
  {
    title: 'Liver Fat Accumulation',
    description: 'Excess calories and poor nutrient timing cause fat to deposit in the liver. A fatty liver worsens insulin resistance and disrupts cholesterol processing.',
  },
  {
    title: 'Cholesterol Metabolism',
    description: 'Dietary imbalance alters how cholesterol is produced, transported, and cleared. High LDL and triglycerides often rise alongside insulin resistance and fatty liver.',
  },
  {
    title: 'Hormonal & Thyroid Function',
    description: 'Inadequate protein, micronutrient imbalance, and extreme dieting can impair thyroid hormone activity, slowing metabolism and increasing fat storage.',
  },
  {
    title: 'Metabolic Interconnection',
    description: 'Diabetes, thyroid imbalance, fatty liver, and cholesterol abnormalities are metabolically linked. If diet is not corrected, one condition accelerates the progression of the others.',
  },
];

const therapeuticNutritionPoints = [
  { label: 'Insulin\nresponse' },
  { label: 'Liver\nload' },
  { label: 'Hormonal\nsignalling' },
  { label: 'Lipid\nmetabolism' },
];

const approachBenefits = [
  {
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad693.jpg',
    alt: 'Insulin response',
    lines: ['Reduce', 'insulin resistance'],
  },
  {
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad697.jpg',
    alt: 'Liver load',
    lines: ['Support liver fat', 'reversal'],
  },
  {
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad68f.jpg',
    alt: 'Hormonal signalling',
    lines: ['Improve thyroid', 'hormone efficiency'],
  },
  {
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad695.jpg',
    alt: 'Lipid metabolism',
    lines: ['Correct cholesterol', 'metabolism'],
  },
];

const planFeatures = [
  { lines: ['Based on', 'medical reports'] },
  { lines: ['Structured', 'around Indian food'] },
  { lines: ['Adjusted with', 'medication timing'] },
  { lines: ['Monitored', 'continuously'] },
];

const whatYouGetCards = [
  {
    title: 'Ongoing Therapeutic Support',
    description: 'Regular follow-ups to monitor progress, adjust nutrition, and prevent condition worsening over time.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c711a14dfc9fbf5ad6ad.jpg',
  },
  {
    title: 'Condition-Specific Care',
    description: 'Your plan is handled by dietitians experienced in diabetes, thyroid, fatty liver, and cholesterol management.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6faa14dfc9fbf5ad61a.jpg',
  },
  {
    title: 'Tailored to Your Reports',
    description: 'Diet plans are customised based on your medical reports, medications, routine, and food preferences.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c725a14dfc9fbf5ad6fa.jpg',
  },
  {
    title: 'Sustainable Metabolic Control',
    description: 'Focus on long-term stability, improved markers, and reduced disease progression not temporary fixes.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c719a14dfc9fbf5ad6d5.jpg',
  },
  {
    title: 'Medication Compatible Planning',
    description: 'Nutrition aligned with ongoing treatment to support better response and avoid unnecessary escalation.',
    icon: 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70fa14dfc9fbf5ad69d.jpg',
  },
];

const gharKaKhanaBenefits = [
  {
    title: 'Visceral Fat Reduction',
    description: 'Targets internal fat stored around organs, supporting fatty liver improvement and better cholesterol metabolism.',
    position: 'top',
  },
  {
    title: 'Hormonal & Thyroid Support',
    description: 'Balanced protein and micronutrient intake supports efficient thyroid hormone activity and metabolic regulation.',
    position: 'left',
  },
  {
    title: 'Inflammation Reduction',
    description: 'Reduces chronic low-grade inflammation that worsens insulin resistance, liver fat accumulation, and metabolic dysfunction.',
    position: 'right',
  },
  {
    title: 'Blood Sugar Stability',
    description: 'Structured meals prevent glucose spikes and crashes, improving insulin sensitivity and diabetes control.',
    position: 'left-bottom',
  },
  {
    title: 'Cholesterol Regulation',
    description: 'Improves lipid processing and clearance, helping reduce LDL and triglyceride levels over time.',
    position: 'right-bottom',
  },
];

const gharKaKhanaBottom = [
  { title: 'Metabolic Control', description: 'Improved insulin response and reduced disease progression' },
  { title: 'Organ Function Support', description: 'Supports liver, thyroid, and cardiovascular health' },
  { title: 'Long-Term Stability', description: 'Sustainable improvement without extreme restriction or rebound' },
];

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

function CheckIcon24() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="12" fill="#FF850B" />
      <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TherapeuticApproachIcon({
  src,
  alt,
  outerSize,
  innerSize,
  iconSize,
}: {
  src: string;
  alt: string;
  outerSize: number;
  innerSize: number;
  iconSize: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full border border-[#FE7F2D]"
      style={{ width: outerSize, height: outerSize }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-[#FF850B]"
        style={{ width: innerSize, height: innerSize }}
      >
        <Image
          src={src}
          alt={alt}
          width={iconSize}
          height={iconSize}
          className="object-contain brightness-0 invert"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function CheckSquare32() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#014E4E]">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3.75 9l3.25 3.25L14.25 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}



function CheckSquare28() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4.67px] bg-[#014E4E]">
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3.75 9l3.25 3.25L14.25 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function TherapeuticPlanPage() {
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);
  const [expandedPricingCards, setExpandedPricingCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const dbPricing = await getPricingByCategory('therapeutic-diet-plans');
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

  return (
    <main className="bg-white" suppressHydrationWarning>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO BANNER — "Yes! Diabetes, Thyroid…"
      ═══════════════════════════════════════════════════════════ */}
      <section className="hero-section site-shell pt-4 md:pt-[60px]" suppressHydrationWarning>
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden w-full">
          <div className="relative w-full">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Layout */}
            <div className="flex flex-col items-center w-full px-6 py-12 text-center md:hidden" suppressHydrationWarning>
              <h1 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-2">
                Yes! <span className="text-[#FF850B]">Diabetes, Thyroid, Fatty Liver,</span>
              </h1>
              <h2 className="text-[1.8rem] font-bold text-white leading-[1.3] mb-4">
                <span className="text-[#FF850B]">Cholestrol</span> Can Be Reversed.
              </h2>
              <p className="text-white/80 text-[15px] leading-[1.6] mt-3">
                And it can be done with just <span className="text-[#FF850B] font-semibold">Ghar Ka Khana</span>,<br />guided by nutritional science.
              </p>
            </div>

            {/* Desktop Layout */}
            <div className="flex-col items-center hidden w-full py-16 text-center md:flex lg:py-20" suppressHydrationWarning>
              <h1 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-2">
                Yes! <span className="text-[#FF850B]">Diabetes, Thyroid, Fatty Liver,</span>
              </h1>
              <h2 className="text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem] font-bold text-white leading-[1.2] mb-4">
                <span className="text-[#FF850B]">Cholestrol</span> Can Be Reversed.
              </h2>
              <p className="text-white/80 text-[18px] leading-[1.7] mt-4 max-w-[580px]">
                And it can be done with just <span className="text-[#FF850B] font-semibold">Ghar Ka Khana</span>,<br />guided by nutritional science.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          2. ROLE OF DIET IN DIABETES, THYROID…
      ═══════════════════════════════════════════════════════════ */}
      <section className="site-shell bg-white py-12 md:py-20">
        <div className="site-fill">
          {/* Header */}
          <div className="mb-10 text-center md:mb-14">
            <h2 className="text-[28px] md:text-[40px] lg:text-[46px] font-extrabold leading-[1.15] text-[#1E1E1E]" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>
              Role of Diet in <span className="text-[#FF850B]">Diabetes, Thyroid,<br className="hidden md:block" /> Fatty Liver &amp; Cholesterol</span>
            </h2>
            <p className="text-[#828283] text-[13px] md:text-[15px] mt-3 max-w-[700px] mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
              Diet plays a central role in metabolic disorders because it directly influences insulin response, liver function, hormone regulation, and fat metabolism.
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-5">

              {/* Row 1: Insulin */}
              <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
                <div className="w-full h-[180px] relative">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c674a14dfc9fbf5ad51f.jpg" alt="Insulin Regulation" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                  <h3 className="text-white text-[18px] font-bold mb-2">{roleDietCards[0].title}</h3>
                  <p className="text-white/90 text-[13px] leading-relaxed">{roleDietCards[0].description}</p>
                </div>
              </div>

              {/* Row 1: Liver */}
              <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
                <div className="w-full h-[180px] relative">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c674a14dfc9fbf5ad521.jpg" alt="Liver Fat Accumulation" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                  <h3 className="text-white text-[18px] font-bold mb-2">{roleDietCards[1].title}</h3>
                  <p className="text-white/90 text-[13px] leading-relaxed">{roleDietCards[1].description}</p>
                </div>
              </div>

              {/* Row 1-2: Metabolic Interconnection Combined Card */}
              <div className="row-span-2 flex h-full flex-col overflow-hidden rounded-[16px] bg-[#FF850B]">
                <div className="relative min-h-[420px] flex-1 w-full bg-[#10253d]">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad562.jpg"
                    alt="Metabolic Interconnection Diagram"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 767px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                  <h3 className="text-white text-[18px] font-bold mb-2">{roleDietCards[4].title}</h3>
                  <p className="text-white/90 text-[13px] leading-relaxed">{roleDietCards[4].description}</p>
                </div>
              </div>

              {/* Row 2: Hormonal */}
              <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
                <div className="w-full h-[180px] relative">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4fe.jpg" alt="Hormonal Function" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                  <h3 className="text-white text-[18px] font-bold mb-2">{roleDietCards[3].title}</h3>
                  <p className="text-white/90 text-[13px] leading-relaxed">{roleDietCards[3].description}</p>
                </div>
              </div>

              {/* Row 2: Cholesterol */}
              <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
                <div className="w-full h-[180px] relative">
                  <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66da14dfc9fbf5ad4ed.jpg" alt="Cholesterol Metabolism" fill className="object-cover" loading="lazy" sizes="(max-width: 767px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                  <h3 className="text-white text-[18px] font-bold mb-2">{roleDietCards[2].title}</h3>
                  <p className="text-white/90 text-[13px] leading-relaxed">{roleDietCards[2].description}</p>
                </div>
              </div>

            </div>
          </div>
          {/* Mobile Layout - Vertical Stack */}
          <div className="flex flex-col gap-5 md:hidden">
            {/* Insulin Regulation */}
            <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
              <div className="w-full h-[160px] relative overflow-hidden">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c674a14dfc9fbf5ad51f.jpg" alt="Insulin Regulation" fill className="object-cover" loading="lazy" sizes="100vw" />
              </div>
              <div className="p-5">
                <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                <h3 className="text-white text-[16px] font-bold mb-2" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>{roleDietCards[0].title}</h3>
                <p className="text-white/90 text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{roleDietCards[0].description}</p>
              </div>
            </div>

            {/* Liver Fat Accumulation */}
            <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
              <div className="w-full h-[160px] relative overflow-hidden">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c674a14dfc9fbf5ad521.jpg" alt="Liver Fat Accumulation" fill className="object-cover" loading="lazy" sizes="100vw" />
              </div>
              <div className="p-5">
                <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                <h3 className="text-white text-[16px] font-bold mb-2" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>{roleDietCards[1].title}</h3>
                <p className="text-white/90 text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{roleDietCards[1].description}</p>
              </div>
            </div>

            {/* Hormonal & Thyroid Function */}
            <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
              <div className="w-full h-[160px] relative overflow-hidden">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66fa14dfc9fbf5ad4fe.jpg" alt="Hormonal & Thyroid Function" fill className="object-cover" loading="lazy" sizes="100vw" />
              </div>
              <div className="p-5">
                <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                <h3 className="text-white text-[16px] font-bold mb-2" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>{roleDietCards[3].title}</h3>
                <p className="text-white/90 text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{roleDietCards[3].description}</p>
              </div>
            </div>

            {/* Cholesterol Metabolism */}
            <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
              <div className="w-full h-[160px] relative overflow-hidden">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c66da14dfc9fbf5ad4ed.jpg" alt="Cholesterol Metabolism" fill className="object-cover" loading="lazy" sizes="100vw" />
              </div>
              <div className="p-5">
                <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                <h3 className="text-white text-[16px] font-bold mb-2" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>{roleDietCards[2].title}</h3>
                <p className="text-white/90 text-[12px] leading-relaxed" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{roleDietCards[2].description}</p>
              </div>
            </div>

            {/* Metabolic Interconnection Card */}
            <div className="bg-[#FF850B] rounded-[16px] overflow-hidden">
              <div className="relative w-full h-[300px] overflow-hidden bg-[#10253d]">
                <Image src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6b3a14dfc9fbf5ad562.jpg" alt="Metabolic Interconnection Diagram" fill className="object-cover object-center" loading="lazy" sizes="100vw" />
              </div>
              <div className="p-5 pt-4">
                <div className="w-8 h-[3px] bg-white/60 mb-3 rounded-full" />
                <h3 className="text-white text-[17px] font-bold leading-tight mb-2" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>{roleDietCards[4].title}</h3>
                <p className="text-white/90 text-[12px] leading-[1.55]" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>{roleDietCards[4].description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          3. WHY THESE CONDITIONS NEED THERAPEUTIC NUTRITION
      ═══════════════════════════════════════════════════════════ */}
      <section className="site-shell pt-2 pb-10 md:pt-8 md:pb-20">
        <div className="site-fill bg-gradient-to-br from-[#0d4043] to-[#0a2f31] rounded-[24px] py-12 md:py-16 px-6 md:px-16">
          <div className="text-center">
            <h2 className="text-[22px] md:text-[36px] lg:text-[42px] font-extrabold text-white leading-[1.2]" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>
              Why These Conditions Need<br />
              <span className="text-[#FF850B]">Therapeutic Nutrition</span> (Not Normal Dieting)
            </h2>
            <p className="text-white/75 text-[12px] md:text-[15px] mt-4 max-w-[700px] mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Diabetes, thyroid, fatty liver and cholesterol are not weight problems. They are metabolic disorders. Generic diet charts focus on calories. Therapeutic nutrition focuses on
            </p>
          </div>

          {/* 4 Icon Points - Desktop */}
          <div className="justify-center hidden gap-12 mt-10 md:flex lg:gap-16">
            {/* Insulin Response */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-[135px] w-[135px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad693.jpg"
                    alt="Insulin response"
                    width={50}
                    height={50}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[15px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Insulin<br />response
              </p>
            </div>
            {/* Liver Load */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-[135px] w-[135px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad697.jpg"
                    alt="Liver load"
                    width={50}
                    height={50}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[15px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Liver<br />load
              </p>
            </div>
            {/* Hormonal Signalling */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-[135px] w-[135px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad68f.jpg"
                    alt="Hormonal signalling"
                    width={50}
                    height={50}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[15px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Hormonal<br />signalling
              </p>
            </div>
            {/* Lipid Metabolism */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex h-[135px] w-[135px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad695.jpg"
                    alt="Lipid metabolism"
                    width={50}
                    height={50}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[15px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Lipid<br />metabolism
              </p>
            </div>
          </div>

          {/* 4 Icon Points - Mobile (2x2 grid) */}
          <div className="grid grid-cols-2 gap-6 mt-8 md:hidden">
            {/* Insulin Response */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad693.jpg"
                    alt="Insulin response"
                    width={40}
                    height={40}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[13px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Insulin<br />response
              </p>
            </div>
            {/* Liver Load */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad697.jpg"
                    alt="Liver load"
                    width={40}
                    height={40}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[13px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Liver<br />load
              </p>
            </div>
            {/* Hormonal Signalling */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad68f.jpg"
                    alt="Hormonal signalling"
                    width={40}
                    height={40}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[13px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Hormonal<br />signalling
              </p>
            </div>
            {/* Lipid Metabolism */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border-[1.5px] border-[#FF850B] bg-transparent">
                <div className="relative flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ea14dfc9fbf5ad695.jpg"
                    alt="Lipid metabolism"
                    width={40}
                    height={40}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-white text-[13px] font-semibold text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                Lipid<br />metabolism
              </p>
            </div>
          </div>

          {/* Bottom warning */}
          <p className="text-[#FF850B] text-[13px] md:text-[16px] font-semibold text-center mt-10 leading-relaxed italic" style={{ fontFamily: 'Inter, sans-serif' }}>
            Without condition-specific nutrition, weight loss<br />may happen but the disease worsens.
          </p>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
      4. OUR THERAPEUTIC APPROACH (HOW WE WORK DIFFERENTLY)
═══════════════════════════════════════════════════════════ */}
      <section className="site-shell bg-white pt-6 pb-12 md:pt-10 md:pb-20">
        <div className="site-fill bg-[#EAEEF1] rounded-[24px] overflow-hidden relative">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(340px,472px)_1fr] lg:items-end">
            <div className="pl-[16.54px]">
              <div className="relative min-h-[620px] xl:min-h-[703px]">
                <Image
                  src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad59a.jpg"
                  alt="Our Therapeutic Team"
                  fill
                  className="object-contain object-left-bottom"
                  loading="lazy"
                  sizes="(max-width: 1279px) 340px, 472px"
                />
              </div>
            </div>

            <div className="px-8 py-12 xl:px-10 xl:py-14">
              <div className="mx-auto max-w-[680px]">
                <h2
                  className="text-center text-[40px] font-bold leading-[1.18] text-black xl:text-[48px] xl:leading-[1.2]"
                  style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                >
                  Our Therapeutic Approach
                  <br />
                  <span className="text-[#FF850B]">(How We Work Differently)</span>
                </h2>

                <div className="mt-8 flex flex-col items-center gap-6">
                  <p
                    className="text-center text-[20px] font-normal text-black"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Our therapeutic nutrition plans are designed to
                  </p>
                  <div className="h-[2px] w-full max-w-[466px] bg-[#014E4E]/35" />
                </div>

                <div className="mx-auto mt-8 grid max-w-[620px] grid-cols-2 gap-x-8 gap-y-4">
                  {approachBenefits.map((benefit) => (
                    <div key={benefit.alt} className="flex items-center gap-4">
                      <TherapeuticApproachIcon
                        src={benefit.icon}
                        alt={benefit.alt}
                        outerSize={80}
                        innerSize={68}
                        iconSize={34}
                      />
                      <div
                        className="max-w-[210px] text-[20px] font-semibold leading-[1.2] text-[#014E4E]"
                        style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                      >
                        {benefit.lines.map((line) => (
                          <div key={line}>{line}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mx-auto mt-8 max-w-[631px] rounded-[16px] bg-[#014E4E]/10 p-4">
                  <div className="rounded-[8px] bg-[#FF850B] px-6 py-3 text-center">
                    <span
                      className="text-[20px] font-medium uppercase text-white"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      Each Plan Is Carefully
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                    {planFeatures.map((feature) => (
                      <div key={feature.lines.join(' ')} className="flex items-center gap-3.5">
                        <CheckSquare32 />
                        <div
                          className="text-[20px] font-medium leading-[1] text-[#014E4E]"
                          style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                        >
                          {feature.lines.map((line) => (
                            <div key={line}>{line}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="px-[10px] py-2 lg:hidden">
            <div className="flex flex-col items-center gap-6">
              <div className="inline-flex w-full items-center justify-center gap-2 self-stretch rounded-[16px] bg-[linear-gradient(180deg,#EAEEF1_0%,#FFFFFF_100%)]">
                <Image
                  src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c6e6a14dfc9fbf5ad59a.jpg"
                  alt="Our Therapeutic Team"
                  width={304}
                  height={422}
                  className="h-[421.62px] w-[303.64px] object-contain"
                  loading="lazy"
                  sizes="304px"
                />
              </div>


              <div className="flex w-full flex-col items-start gap-6">
                <h2
                  className="w-full text-center text-[24px] font-bold leading-8 text-black"
                  style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                >
                  Our Therapeutic Approach
                  <br />
                  <span className="text-[#FF850B]">(How We Work Differently)</span>
                </h2>

                <div className="h-[2px] w-full max-w-[322px] self-center bg-[#014E4E]/35" />

                <div className="flex w-full flex-col items-center gap-6">
                  <p
                    className="w-full text-center text-[15px] font-normal text-black"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Our therapeutic nutrition plans are designed to
                  </p>

                  <div className="grid w-full grid-cols-2 gap-4">
                    {approachBenefits.map((benefit) => (
                      <div
                        key={benefit.alt}
                        className="flex min-h-[176px] flex-col items-center justify-center gap-4 rounded-[16px] bg-white py-4"
                      >
                        <TherapeuticApproachIcon
                          src={benefit.icon}
                          alt={benefit.alt}
                          outerSize={80}
                          innerSize={68}
                          iconSize={34}
                        />
                        <div
                          className="px-2 text-center text-[14px] font-semibold leading-6 text-[#014E4E]"
                          style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                        >
                          {benefit.lines.map((line) => (
                            <div key={line}>{line}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex w-full flex-col items-center gap-6 rounded-[16px] bg-[#014E4E]/10 p-4">
                  <div className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#FF850B] py-3">
                    <span
                      className="text-center text-[20px] font-medium uppercase text-white"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      Each Plan Is Carefully
                    </span>
                  </div>

                  <div className="flex w-full flex-col items-center gap-4">
                    <div className="flex w-full flex-col items-start gap-4">
                      {planFeatures.map((feature) => (
                        <div key={feature.lines.join(' ')} className="inline-flex items-center gap-2">
                          <CheckSquare28 />
                          <div
                            className="text-[18px] font-medium leading-5 text-[#014E4E]"
                            style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                          >
                            {feature.lines.join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
    5. WHAT YOU WILL GET?
═══════════════════════════════════════════════════════════ */}
      <section className="site-shell bg-white py-12 md:py-16">

        <div className="site-fill">

          {/* Heading */}
          <div className="mb-10 text-center">
            <h2
              className="text-[28px] md:text-[42px] lg:text-[46px] font-extrabold text-[#1E1E1E] leading-[1.1]"
              style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
            >
              What You Will <span className="text-[#FF850B]">Get</span>?
            </h2>
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden md:block">

            {/* Row 1 */}
            <div className="flex justify-center gap-6 mb-6">
              {whatYouGetCards.slice(0, 2).map((card, index) => (
                <div
                  key={index}
                  className="bg-[#FF850B] rounded-[18px] px-6 py-5 flex gap-5 items-start w-[470px]"
                >

                  {/* Icon */}
                  <div className="w-[78px] h-[78px] rounded-[16px] bg-[#0d4043] flex items-center justify-center shrink-0">

                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={50}
                      height={50}
                      className="object-contain"
                      loading="lazy"
                    />

                  </div>

                  {/* Text */}
                  <div className="flex-1">

                    <h3
                      className="text-[white] text-[18px] font-bold mb-2 leading-tight"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      {card.title}
                    </h3>

                    <p
                      className="text-white text-[13px] leading-relaxed"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      {card.description}
                    </p>

                  </div>

                </div>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-6 mb-6">
              {whatYouGetCards.slice(2, 4).map((card, index) => (
                <div
                  key={index}
                  className="bg-[#FF850B] rounded-[18px] px-6 py-5 flex gap-5 items-start w-[470px]"
                >

                  <div className="w-[78px] h-[78px] rounded-[16px] bg-[#0d4043] flex items-center justify-center shrink-0">

                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={50}
                      height={50}
                      className="object-contain"
                      loading="lazy"
                    />

                  </div>

                  <div className="flex-1">

                    <h3
                      className="text-[white] text-[18px] font-bold mb-2 leading-tight"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      {card.title}
                    </h3>

                    <p
                      className="text-white text-[13px] leading-relaxed"
                      style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                    >
                      {card.description}
                    </p>

                  </div>

                </div>
              ))}
            </div>

            {/* Row 3 (center card) */}
            <div className="flex justify-center">

              <div className="bg-[#FF850B] rounded-[18px] px-6 py-5 flex gap-5 items-start w-[470px]">

                <div className="w-[78px] h-[78px] rounded-[16px] bg-[#0d4043] flex items-center justify-center shrink-0">

                  <Image
                    src={whatYouGetCards[4].icon}
                    alt={whatYouGetCards[4].title}
                    width={50}
                    height={50}
                    className="object-contain"
                    loading="lazy"
                  />

                </div>

                <div className="flex-1">

                  <h3
                    className="text-[white] text-[18px] font-bold mb-2 leading-tight"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    {whatYouGetCards[4].title}
                  </h3>

                  <p
                    className="text-white text-[13px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    {whatYouGetCards[4].description}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* MOBILE LAYOUT */}
          <div className="flex flex-col gap-4 md:hidden">

            {whatYouGetCards.map((card, index) => (

              <div
                key={index}
                className="bg-[#FF850B] rounded-[18px] px-5 py-5 flex gap-4 items-start"
              >

                <div className="w-[72px] h-[72px] rounded-[16px] bg-[#0d4043] flex items-center justify-center shrink-0">

                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={46}
                    height={46}
                    className="object-contain"
                    loading="lazy"
                  />

                </div>

                <div className="flex-1">

                  <h3
                    className="text-white text-[17px] font-bold mb-1 leading-tight"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    {card.title}
                  </h3>

                  <p
                    className="text-white text-[13px] leading-relaxed"
                    style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
                  >
                    {card.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ═══════════════════════════════════════════════════════════
          6. HOW GHAR KA KHANA DIET PLAN HELPS
      ═══════════════════════════════════════════════════════════ */}
      <section className="site-shell py-12 md:py-20">
        <div className="site-fill">
          {/* Desktop version */}
          <div className="hidden md:block">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70ca14dfc9fbf5ad684.jpg"
              alt="How Ghar Ka Khana Diet Plan Helps Diabetes, Thyroid, Cholesterol & Fatty Liver"
              width={1100}
              height={700}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </div>
          {/* Mobile version */}
          <div className="md:hidden">
            <Image
              src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c70aa14dfc9fbf5ad679.jpg"
              alt="How Ghar Ka Khana Diet Plan Helps Diabetes, Thyroid, Cholesterol & Fatty Liver"
              width={400}
              height={1200}
              className="w-full h-auto"
              loading="lazy"
              sizes="100vw"
            />
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          7. EXPERT'S GUIDANCE (same as homepage)
      ═══════════════════════════════════════════════════════════ */}
      <div className="section-wrapper">
        <ExpertGuidanceSection />
      </div>


      {/* ═══════════════════════════════════════════════════════════
          8. TESTIMONIALS — Over 75,000+ People
      ═══════════════════════════════════════════════════════════ */}
      <section className="site-shell py-12 md:py-20">
        <div className="site-fill">
          
            <div className="mb-10 flex flex-col items-center gap-4 md:mb-14 md:flex-col md:items-start md:justify-between">
           <div className="flex items-center  gap-2">
                    <span className="text-[#f5a623] text-lg">✦</span>
             <span className="text-teal-600 text-base font-semibold">
                  Our Testimonials
                </span>
              </div>
               <div className="mx-auto max-w-[630px] text-center md:mx-0 md:text-left">
              {/* <span className="text-[#FF850B] text-sm md:text-base font-semibold">Our Testimonials</span> */}
              <h2 className="mt-2 text-2xl font-bold leading-tight text-[#1E1E1E] md:text-[42px]">
                Over <span className="text-[#FF850B] " >75,000+</span>  <br />
                People Enjoy Weight Loss
              </h2>
              {/* <p className="text-[#828283] text-xs md:text-sm mt-2">
                Choose a plan as per your requirements and start your wellness journey. See you around!
              </p> */}
            </div>
          </div>
          <TransformationGallery page="therapeutic" maxItems={6} />
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          9. PRICING
      ═══════════════════════════════════════════════════════════ */}
      <section className="site-shell py-12 md:py-20">
        <div className="mb-10 text-center">
         <div className="flex items-center flex-col gap- mb-1 md:flex md:items-center md:gap-2 md:justify-normal justify-center">
            <div className='flex gap-2 items-center' >
              <span className="text-[#f5a623] text-lg">✦</span>
              <span className="text-teal-600 text-base font-semibold">
                Our Plans
              </span>
            </div>
            <SectionTitle className="text-[#1E1E1E] mt-4">Our Pricing</SectionTitle>
            <p className="text-[#828283]  text-center text-[12px] md:text-[14px] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Choose a plan as per your requirements and start your wellness journey. See you around!
            </p>

          </div>
        </div>

        {loadingPricing ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#014E4E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full">
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
                        <div className="w-full h-px mb-4 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                        {/* Features */}
                        <p className="font-semibold text-[#1E1E1E] text-[16px] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>What you&apos;ll get:</p>
                        <div className="flex flex-col gap-1">
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
                              id: `therapeutic-${plan.label.toLowerCase().replace(/\s+/g, '-')}`,
                              name: `Therapeutic Diet Plan - ${plan.label}`,
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

    </main>
  );
}

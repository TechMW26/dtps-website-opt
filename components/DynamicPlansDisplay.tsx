'use client';

import { useState, useEffect } from 'react';
import { getPricingByCategory, getPricingByPage } from '@/lib/api';
import type { Pricing } from '@/lib/api';

type PricingCategory = 'weight-loss' | 'pcod' | 'new-wedding-plan' | 'therapeutic-diet-plans';
type PricingPage = 'weight-loss' | 'pcod' | 'therapeutic' | 'wedding';

interface DynamicPlansDisplayProps {
  category?: PricingCategory;
  page?: PricingPage;
  showHeader?: boolean;
  title?: string;
  description?: string;
  columns?: string;
  onSelectPlan?: (plan: Pricing) => void;
  compact?: boolean;
}

export default function DynamicPlansDisplay({
  category,
  page,
  showHeader = true,
  title = 'Choose Your Plan',
  description = 'Select the perfect plan that fits your needs',
  columns = '3',
  onSelectPlan,
}: DynamicPlansDisplayProps) {
  const [plans, setPlans] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        let fetchedPlans: Pricing[] = [];
        if (category) {
          fetchedPlans = await getPricingByCategory(category);
        } else if (page) {
          fetchedPlans = await getPricingByPage(page);
        }
        if (fetchedPlans.length === 0) {
          setError('No plans available');
        }
        const sortedPlans = fetchedPlans.sort((a, b) => {
          if (a.popular === b.popular) return 0;
          return a.popular ? -1 : 1;
        });
        setPlans(sortedPlans);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [category, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const gridCols = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '3-2': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (columns === '3-2') {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full">
          {showHeader && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">{description}</p>
            </div>
          )}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 w-full justify-center mb-6 md:mb-8 lg:mb-10">
              {plans.slice(0, 3).map((plan) => (
                <PlanCard key={plan._id} plan={plan} onSelect={onSelectPlan} />
              ))}
            </div>
            {plans.length > 3 && (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 w-full lg:w-2/3 gap-6 md:gap-8 lg:gap-10">
                  {plans.slice(3, 5).map((plan) => (
                    <PlanCard key={plan._id} plan={plan} onSelect={onSelectPlan} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{description}</p>
          </div>
        )}
        <div className={`grid ${gridCols} gap-6 md:gap-8 lg:gap-10 w-full justify-center`}>
          {plans.map((plan) => (
            <PlanCard key={plan._id} plan={plan} onSelect={onSelectPlan} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: Pricing;
  onSelect?: (plan: Pricing) => void;
}

function PlanCard({ plan, onSelect }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleFeatures = expanded ? plan.features : plan.features.slice(0, 4);
  const hasMoreFeatures = plan.features.length > 4;

  return (
    <div className="bg-white rounded-[12px] shadow-[0_0_4px_rgba(0,0,0,0.25)] overflow-hidden p-6 flex flex-col h-full relative">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[#6B7280] text-[14px] font-semibold" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            {plan.planName}
          </p>
          <p className="text-[#1E1E1E] text-[18px] font-semibold capitalize" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            PLAN
          </p>
        </div>
        {plan.badge && (
          <span className="border border-[#FF850B] rounded-full px-4 py-2 text-[10px] font-bold tracking-[1px] text-[#1E1E1E]" style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}>
            {plan.badge}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-[#014E4E] text-[28px] md:text-[32px] font-semibold capitalize" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
          ₹{plan.price.toLocaleString()}
        </span>
        {plan.originalPrice > plan.price && (
          <span className="text-[#6B7280] text-[16px] line-through mb-1" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            ₹{plan.originalPrice.toLocaleString()}
          </span>
        )}
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4" />
      <p className="font-semibold text-[#1E1E1E] text-[16px] mb-3 text-left" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        What you&apos;ll get:
      </p>
      <div className="flex flex-col gap-2.5 w-full">
        {visibleFeatures.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2.5 w-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="12" fill="#FF850B" />
              <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[#6B7280] text-[13px] md:text-[14px] leading-relaxed text-left flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
      {hasMoreFeatures && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 mb-4 text-[#FF850B] text-[12px] md:text-[13px] font-bold w-fit"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
      <div className="flex-1" />
      <button
        onClick={() => onSelect?.(plan)}
        className="bg-[#FF850B] text-white font-bold text-[11px] px-5 py-2.5 rounded-full w-fit cursor-pointer"
        style={{ fontFamily: 'var(--font-epilogue), Epilogue, sans-serif' }}
      >
        BUY NOW
      </button>
    </div>
  );
}
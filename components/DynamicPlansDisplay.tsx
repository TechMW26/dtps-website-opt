'use client';

import { useState, useEffect } from 'react';
import { getPricingByCategory, getPricingByPage } from '@/lib/api';
import type { Pricing } from '@/lib/api';
import { Check, X } from 'lucide-react';

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
  compact = false,
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
          fetchedPlans = await getPricingByCategory(category as PricingCategory);
        } else if (page) {
          fetchedPlans = await getPricingByPage(page as PricingPage);
        }

        if (fetchedPlans.length === 0) {
          setError('No plans available');
        }
        
        const sortedPlans = fetchedPlans.sort((a, b) => {
          if (a.popular === b.popular) {
            return 0;
          }
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
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

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
            <PlanCard 
              key={plan._id} 
              plan={plan} 
              onSelect={onSelectPlan}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: Pricing;
  onSelect?: (plan: Pricing) => void;
  compact?: boolean;
}

function PlanCard({ plan, onSelect, compact }: PlanCardProps) {
  const isPrimary = plan.popular;

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isPrimary
          ? 'ring-2 ring-orange-500 md:scale-105 shadow-2xl'
          : 'border border-gray-200 shadow-lg hover:shadow-xl'
      } bg-white h-full flex flex-col`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className={`px-4 py-2 text-white text-sm font-semibold text-center ${
          plan.badgeColor === 'orange' ? 'bg-orange-500' :
          plan.badgeColor === 'teal' ? 'bg-teal-500' :
          plan.badgeColor === 'green' ? 'bg-green-500' :
          'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          {plan.badge}
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col flex-grow ${compact ? 'p-4' : 'p-6'}`}>
        {/* Plan Name */}
        <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
          {plan.planName}
        </h3>

        {/* Duration */}
        {plan.durationLabel && (
          <p className="text-sm text-gray-600 mb-4">{plan.durationLabel}</p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className={`font-bold text-gray-900 ${compact ? 'text-2xl' : 'text-3xl'}`}>
            ₹{plan.price.toLocaleString()}
          </div>
          {plan.originalPrice > plan.price && (
            <del className="text-sm text-gray-500">₹{plan.originalPrice.toLocaleString()}</del>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6 flex-grow">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => onSelect?.(plan)}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            isPrimary
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
              : 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
          }`}
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
}

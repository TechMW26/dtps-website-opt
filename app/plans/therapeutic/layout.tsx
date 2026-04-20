import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Therapeutic Nutrition Plans',
  description:
    'Custom therapeutic diet plans for diabetes, thyroid, fatty liver, high cholesterol, cardiac health, and more. Manage chronic conditions through evidence-based nutrition by Dietitian Poonam Sagar.',
  keywords: [
    'therapeutic nutrition',
    'diabetes diet plan',
    'thyroid diet',
    'cholesterol management diet',
    'cardiac diet India',
    'fatty liver diet',
    'Poonam Sagar therapeutic',
    'clinical dietitian India',
  ],
  openGraph: {
    title: 'Therapeutic Nutrition Plans | Dietitian Poonam Sagar',
    description:
      'Evidence-based diet plans for diabetes, thyroid, fatty liver, high cholesterol, and other chronic conditions.',
    type: 'website',
  },
  alternates: {
    canonical: '/plans/therapeutic',
  },
};

export default function TherapeuticLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

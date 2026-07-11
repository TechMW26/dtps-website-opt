import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '₹2,499 Weight Loss Plan – Dietitian Poonam Sagar',
  description:
    'Start your transformation with our ₹2,499 weight loss plan. Get a personalised diet chart, 2 consultations, chat support & progress tracking. Expert-guided, home-food based plan by Dietitian Poonam Sagar.',
  keywords: [
    '2499 weight loss plan',
    'affordable diet plan India',
    'personalised diet chart',
    'weight loss dietitian Bhopal',
    'online diet consultation',
    'Poonam Sagar 2499 plan',
    'budget diet plan',
  ],
  openGraph: {
    title: '₹2,499 Weight Loss Plan | Dietitian Poonam Sagar',
    description:
      'Start your transformation with our ₹2,499 weight loss plan. Personalised diet chart, 2 consultations, chat support & progress tracking.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '₹2,499 Weight Loss Plan | Dietitian Poonam Sagar',
    description:
      'Start your transformation with our ₹2,499 weight loss plan. Personalised diet chart, 2 consultations, chat support & progress tracking.',
  },
  alternates: { canonical: '/weight-loss-plan-2499' },
};

export default function WeightLossPlan2499Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

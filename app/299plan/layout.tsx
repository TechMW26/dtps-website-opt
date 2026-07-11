import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '₹299 Weight Loss Trial Plan – Dietitian Poonam Sagar',
  description:
    'Try our 10-day weight loss trial plan at just ₹299. Get a personalised diet plan, expert guidance, and see real results before committing. No supplements, no starvation — 100% home-food based.',
  keywords: [
    '299 trial diet plan',
    '10 day weight loss trial',
    'diet plan trial India',
    'affordable diet trial',
    'Poonam Sagar trial plan',
    'weight loss trial Bhopal',
    '299 rupees diet plan',
  ],
  openGraph: {
    title: '₹299 Weight Loss Trial Plan | Dietitian Poonam Sagar',
    description:
      'Try our 10-day weight loss trial plan at just ₹299. Personalised diet, expert guidance, see real results before committing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '₹299 Weight Loss Trial Plan | Dietitian Poonam Sagar',
    description:
      'Try our 10-day weight loss trial plan at just ₹299. Personalised diet, expert guidance, see real results before committing.',
  },
  alternates: { canonical: '/299plan' },
};

export default function Plan299Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

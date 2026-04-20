import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PCOD Diet & Nutrition Plan',
  description:
    'Manage PCOD/PCOS naturally with a personalised diet plan by Dietitian Poonam Sagar. Hormone-balancing nutrition protocols to reduce symptoms, regulate cycles, and improve energy.',
  keywords: [
    'PCOD diet plan',
    'PCOS nutrition',
    'PCOD management India',
    'hormone balancing diet',
    'PCOS dietitian',
    'Poonam Sagar PCOD',
    'polycystic ovary diet',
  ],
  openGraph: {
    title: 'PCOD Diet & Nutrition Plan | Dietitian Poonam Sagar',
    description:
      'Manage PCOD/PCOS naturally with personalised, hormone-balancing nutrition plans. Expert guidance by Dietitian Poonam Sagar.',
    type: 'website',
  },
  alternates: {
    canonical: '/pcod',
  },
};

export default function PcodLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

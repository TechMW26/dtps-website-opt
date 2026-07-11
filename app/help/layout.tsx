import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support – Dietitian Poonam Sagar',
  description:
    'Find answers to common questions about our diet plans, consultations, pricing, refunds, and the DTPS app. Get the support you need for your wellness journey with Dietitian Poonam Sagar.',
  keywords: [
    'diet plan help',
    'DTPS support',
    'dietitian FAQ',
    'weight loss plan questions',
    'Poonam Sagar help',
    'nutrition consultation support',
    'diet plan refund policy',
  ],
  openGraph: {
    title: 'Help & Support | Dietitian Poonam Sagar',
    description:
      'Find answers to common questions about our diet plans, consultations, pricing, refunds, and the DTPS app.',
    type: 'website',
  },
  alternates: { canonical: '/help' },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wedding Nutrition Plan',
  description:
    'Look your best on your special day with Dietitian Poonam Sagar\'s wedding nutrition programme. Personalised plans for brides, grooms, couples, and families — glow inside out.',
  keywords: [
    'wedding diet plan',
    'bridal nutrition',
    'pre-wedding weight loss',
    'wedding dietitian India',
    'bride diet plan',
    'groom fitness diet',
    'Poonam Sagar wedding plan',
  ],
  openGraph: {
    title: 'Wedding Nutrition Plan | Dietitian Poonam Sagar',
    description:
      'Look and feel amazing on your wedding day. Personalised nutrition plans for brides, grooms, couples, and families.',
    type: 'website',
  },
  alternates: {
    canonical: '/plans/wedding',
  },
};

export default function WeddingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

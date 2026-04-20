import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health & Nutrition Blog',
  description:
    'Expert articles on weight loss, PCOD management, therapeutic nutrition, healthy recipes, and wellness tips by Dietitian Poonam Sagar.',
  keywords: [
    'nutrition blog',
    'diet tips',
    'weight loss advice',
    'PCOD nutrition',
    'healthy eating',
    'dietitian blog India',
    'Poonam Sagar blog',
  ],
  openGraph: {
    title: 'Health & Nutrition Blog | Dietitian Poonam Sagar',
    description:
      'Expert articles on weight loss, PCOD management, therapeutic nutrition, healthy recipes, and wellness tips.',
    type: 'website',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

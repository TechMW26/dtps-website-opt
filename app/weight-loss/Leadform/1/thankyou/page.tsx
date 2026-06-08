import type { Metadata } from 'next';
import FAQSection from '@/components/FAQSection';
import { ThankYouHero, WhatHappensNext } from '@/app/checkout/success/SuccessContent';

export const metadata: Metadata = {
  title: 'Thank You | Dietitian Poonam Sagar',
  description:
    'Thank you for submitting your details. Explore what happens next in your personalised health journey with Dietitian Poonam Sagar.',
  robots: { index: false, follow: false },
};

export default function LeadFormThankYouPage() {
  return (
    <div className="min-h-screen bg-white pb-8 md:pb-12">
      <ThankYouHero order={null} />
      <WhatHappensNext />
      <FAQSection />
    </div>
  );
}

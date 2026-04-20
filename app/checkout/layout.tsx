import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order and start your personalised nutrition journey with Dietitian Poonam Sagar.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

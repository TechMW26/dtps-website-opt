'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Footer from './Footer';

// Load route transition lazily so it stays out of the critical bundle.
const PageTransition = dynamic(() => import('./PageTransition'), {
  ssr: false,
});

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <PageTransition />}
    </div>
  );
}

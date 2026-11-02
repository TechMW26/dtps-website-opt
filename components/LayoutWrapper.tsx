'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Footer from './Footer';
import DynamicMarquee from './DynamicMarquee';

// Load route transition lazily so it stays out of the critical bundle.
const PageTransition = dynamic(() => import('./PageTransition'), {
  ssr: false,
});

// Visitor analytics tracker (skips admin routes internally).
const VisitorTracker = dynamic(() => import('./VisitorTracker'), {
  ssr: false,
});

// Diwali festive theme (auto on/off by date, see lib/festive.ts). Lazy so it never blocks first paint.
const DiwaliFestive = dynamic(() => import('./diwali/DiwaliDecor'), { ssr: false });
const DiwaliTopLadi = dynamic(() => import('./diwali/DiwaliDecor').then((m) => m.DiwaliTopLadi), { ssr: false });
const DiwaliFooterDecor = dynamic(() => import('./diwali/DiwaliDecor').then((m) => m.DiwaliFooterDecor), { ssr: false });

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLeadFormRoute = pathname?.startsWith('/wldtps/lead/') || pathname?.startsWith('/weight-loss/Leadform');
  const showSiteChrome = !isAdminRoute && !isLeadFormRoute;

  return (
    <div className="min-h-screen flex flex-col">
      {showSiteChrome && <DynamicMarquee />}
      <main className="relative flex-1">
        {showSiteChrome && <DiwaliTopLadi />}
        {children}
      </main>
      {showSiteChrome && <DiwaliFooterDecor />}
      {showSiteChrome && <Footer />}
      {!isAdminRoute && <PageTransition />}
      {!isAdminRoute && <VisitorTracker />}
      {showSiteChrome && <DiwaliFestive />}
    </div>
  );
}

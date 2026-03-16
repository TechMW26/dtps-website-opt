'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isHome = pathname === '/';

  return (
    <>
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}

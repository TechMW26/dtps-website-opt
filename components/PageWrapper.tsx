'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
   <div className="bg-[#014E4E] rounded-3xl overflow-hidden relative">
          <Navbar />
      {children}
    </div>
  );
}

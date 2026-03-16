'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="page-wrapper">
      <Navbar />
      {children}
    </div>
  );
}

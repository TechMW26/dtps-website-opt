'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import CheckoutContent from './CheckoutContent';

function CheckoutLoading() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-center">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}


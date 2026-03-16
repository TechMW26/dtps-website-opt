'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import { CheckCircle, Home } from 'lucide-react';
import SuccessContent from './SuccessContent';

function LoadingFallback() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

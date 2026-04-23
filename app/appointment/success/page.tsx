'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FAQSection from '@/components/FAQSection';
import { ThankYouHero, WhatHappensNext } from '@/app/checkout/success/SuccessContent';

interface AppointmentSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
}

function AppointmentDetailsCard({ appt }: { appt: AppointmentSummary }) {
  return (
    <section className="site-shell mt-6 md:mt-10">
      <div className="mx-auto max-w-[1010px] rounded-[22px] border border-[#F1F1F1] bg-white px-5 py-6 shadow-[0_0_20px_rgba(0,0,0,0.04)] md:px-8 md:py-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#828283]">Appointment Confirmed</p>
              <p className="text-[15px] font-semibold text-[#1E1E1E]">Ref #{appt.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#1E1E1E]">
            <div>
              <span className="text-[#828283]">Name: </span>
              <span className="font-semibold">{appt.name}</span>
            </div>
            <div>
              <span className="text-[#828283]">Date: </span>
              <span className="font-bold text-[#FF850B]">{appt.preferredDate}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#F1F1F1] pt-5 md:grid-cols-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">Email</p>
            <p className="mt-1 break-all text-[13px] font-medium text-[#1E1E1E]">{appt.email}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">Phone</p>
            <p className="mt-1 text-[13px] font-medium text-[#1E1E1E]">{appt.phone}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#828283]">Service</p>
            <p className="mt-1 text-[13px] font-medium text-[#1E1E1E] capitalize">{appt.service.replace(/-/g, ' ')}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex h-[44px] items-center justify-center rounded-full bg-[#FF850B] px-6 text-[13px] font-bold text-white transition hover:opacity-95">Back to Home</Link>
          <Link href="/contact" className="inline-flex h-[44px] items-center justify-center rounded-full border border-[#FF850B] px-6 text-[13px] font-bold text-[#FF850B] transition hover:bg-[#FFF3E6]">Contact Support</Link>
        </div>
      </div>
    </section>
  );
}

function AppointmentSuccessContent() {
  const params = useSearchParams();
  const [appt, setAppt] = useState<AppointmentSummary | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('lastAppointment');
      if (stored) setAppt(JSON.parse(stored));
    } catch {}
    // Allow URL fallback
    const id = params.get('id');
    if (!appt && id) {
      setAppt({
        id,
        name: params.get('name') || '',
        email: params.get('email') || '',
        phone: params.get('phone') || '',
        service: params.get('service') || '',
        preferredDate: params.get('date') || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white">
      <ThankYouHero order={null} />
      {appt ? <AppointmentDetailsCard appt={appt} /> : null}
      <WhatHappensNext />
      <FAQSection />
    </div>
  );
}

function Loading() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function AppointmentSuccessPage() {
  return (
    <div className="bg-white min-h-screen">
      <Suspense fallback={<Loading />}>
        <AppointmentSuccessContent />
      </Suspense>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 – Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: false },
};

const quickLinks = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Weight Loss', href: '/weight-loss', icon: '⚖️' },
  { label: 'PCOD', href: '/pcod', icon: '🌿' },
  { label: 'Blog', href: '/blog', icon: '📖' },
  { label: 'Book Appointment', href: '/appointment', icon: '📅' },
  { label: 'Contact Us', href: '/contact', icon: '✉️' },
];

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen flex flex-col">

      {/* ── Header shell (same teal card style as all other pages) ── */}
      <div className="site-shell pt-4 md:pt-[60px]">
        <div className="bg-[#014E4E] rounded-3xl overflow-hidden">
          <Navbar />

          {/* ── 404 hero content ── */}
          <div className="relative overflow-hidden px-6 pt-10 pb-16 md:pt-16 md:pb-24 text-center">

            {/* Decorative blurred circles */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-10 -left-16 w-72 h-72 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #FF8A0A 0%, transparent 70%)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #F9D67B 0%, transparent 70%)' }}
            />

            {/* Big "404" display */}
            <div className="relative inline-block mb-4">
              <span
                className="block font-bold text-white/[0.07] select-none leading-none"
                style={{ fontSize: 'clamp(120px, 22vw, 220px)' }}
                aria-hidden
              >
                404
              </span>
              {/* Floating plate illustration */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-[56px] md:text-[72px] leading-none drop-shadow-lg select-none">
                  🍽️
                </div>
                <span className="bg-[#FF8A0A] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Empty Plate
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-[1.7rem] md:text-[2.5rem] font-bold text-white leading-tight max-w-[580px] mx-auto mt-2">
              Oops! This page went{' '}
              <span className="text-[#FF8A0A]">off the menu.</span>
            </h1>

            <p className="mt-4 text-white/60 text-[15px] md:text-base max-w-[420px] mx-auto leading-relaxed">
              Looks like this page didn&apos;t make it to the table. It may have moved,
              been removed, or never existed.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-[#FF8A0A] px-7 py-3 text-white text-[14px] font-semibold hover:bg-[#e07a00] transition-colors shadow-lg"
              >
                Back to Home
              </Link>
              <Link
                href="/appointment"
                className="rounded-full border border-white/30 px-7 py-3 text-white text-[14px] font-semibold hover:bg-white/10 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick links section ── */}
      <div className="site-shell py-12 md:py-16 flex-1">
        <div className="max-w-[860px] mx-auto text-center">
          <p className="text-[13px] uppercase tracking-widest font-semibold text-[#8C8C8C] mb-6">
            Where would you like to go?
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-gray-100 bg-white p-5 hover:border-[#014E4E]/30 hover:bg-[#F6FAFA] hover:shadow-md transition-all duration-200"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </span>
                <span className="text-[13px] font-semibold text-[#3a3a3a] group-hover:text-[#014E4E] transition-colors text-center leading-tight">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Divider with fun copy */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-[13px] text-[#BCBCBC] whitespace-nowrap">
              Still lost? We can help.
            </span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* Contact nudge */}
          <div className="mt-8 inline-flex items-center gap-3 bg-[#F6FAFA] border border-[#014E4E]/10 rounded-2xl px-6 py-4">
            <div className="w-10 h-10 rounded-full bg-[#014E4E] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[12px] text-[#8C8C8C]">Call us directly</p>
              <a
                href="tel:+919893027688"
                className="text-[15px] font-bold text-[#014E4E] hover:text-[#FF8A0A] transition-colors"
              >
                +91 98930 27688
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

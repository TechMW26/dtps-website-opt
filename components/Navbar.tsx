'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Weight Loss', href: '/weight-loss' },
  { label: 'PCOD', href: '/pcod' },
  {
    label: 'All Plans',
    href: '#',
    children: [
      { label: 'Wedding Plan', href: '/plans/wedding' },
      { label: 'Therapeutic Plan', href: '/plans/therapeutic' },
    ],
  },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Good Read', href: '/blog' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="relative z-50 w-full">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="flex items-center justify-between gap-4 py-2 md:py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/api/images/69b7c675a14dfc9fbf5ad523"
                alt="Dietitian Poonam Sagar"
                width={180}
                height={60}
                className="h-[48px] w-auto"
                priority
              />
            </Link>

            <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
              {navItems.map((item) => (
                <div key={item.label} className="relative" ref={item.children ? dropdownRef : undefined}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`rounded-full px-4 py-2 text-[15px] font-semibold text-white/90 transition-colors hover:text-[#F9D67B] ${
                          isActive('/plans') ? 'text-[#F9D67B]' : ''
                        }`}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                      >
                        <span className="inline-flex items-center gap-1">
                          {item.label}
                          <svg
                            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-[#F9D67B] p-2 text-[#1E1E1E] shadow-xl">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors hover:bg-white/70"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-[15px] font-semibold text-white/90 transition-colors hover:text-[#F9D67B] ${
                        isActive(item.href) ? 'text-[#F9D67B]' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <Link
              href="/appointment"
              className="hidden rounded-full bg-[#FF8A1F] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e07a1a] lg:inline-flex"
            >
              Book Appointment
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF8A1F] text-white lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-4 right-4 top-20 z-40 rounded-2xl bg-[#F9D67B] p-5 shadow-xl lg:hidden">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-[#014E4E] ${
                      isActive('/plans') ? 'bg-white/60' : ''
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${isMobileDropdownOpen ? 'max-h-40' : 'max-h-0'}`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-6 py-2 text-[15px] font-semibold text-[#014E4E] hover:text-[#0b4c4c]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-[15px] font-semibold text-[#014E4E] ${
                    isActive(item.href) ? 'bg-white/60' : ''
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <Link
            href="/appointment"
            className="mt-4 inline-flex w-full justify-center rounded-full bg-[#014E4E] px-6 py-3 text-sm font-semibold text-[#F9D67B]"
          >
            Book Appointment
          </Link>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedin, FaApple, FaAndroid } from 'react-icons/fa'; // FontAwesome Icons

const serviceLinks = [
  { label: 'Home', href: '/' },
  { label: 'Weight Loss', href: '/weight-loss' },
  { label: 'PCOD', href: '/pcod' },
  { label: 'All Plans', href: '#', hasDropdown: true },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Good Read', href: '/blog' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Term & Conditions', href: '/terms' },
  { label: 'Help', href: '/help' },
];

const socialLinks = [
  { label: 'Facebook', icon: <FaFacebookF />, href: 'https://www.facebook.com/p/Dt-Poonam-Sagar-100087289226000/' },
  { label: 'Instagram', icon: <FaInstagram />, href: 'https://www.instagram.com/dt.poonamsagar/' },
  { label: 'YouTube', icon: <FaYoutube />, href: 'https://www.youtube.com/channel/UC_6LfLF7RtbHVZfOogc9zag' },
  { label: 'LinkedIn', icon: <FaLinkedin />, href: 'https://in.linkedin.com/company/dietitian-poonam-sagar' },
];

export default function Footer() {
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  return (
    <footer className="bg-white py-10 px-4 md:px-[120px]">
      <div className="w-full mx-auto">
        <div
          className="bg-[#014E4E] rounded-[20px] md:rounded-[40px] pt-[30px] md:pt-[50px] px-5 md:px-[70px] pb-0 text-white bg-cover bg-center bg-[url('https://staging.dtpoonamsagar.com/healix/wp-content/uploads/2025/03/hero-bg-gradiant-shape.png')]"
        >
          {/* Main Content */}
          <div className="flex justify-between gap-8 md:gap-[60px] flex-wrap pb-10">
            {/* Left Column - Logo & Info */}
            <div className="flex-1 min-w-full md:min-w-0 md:max-w-[550px]">
              <Image
                src="https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg"
                alt="Dietitian Poonam Sagar"
                width={180}
                height={60}
                className="h-[48px] w-auto"
                loading="lazy"
              />
              <p className="mt-6 text-[15px] leading-relaxed text-white/85">
                India&apos;s only diet where &apos;Ghar Ka Khana&apos; becomes your superpower for getting fit and losing weight!
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href="tel:+919893027688"
                  className="rounded-xl border border-white/35 py-3.5 px-6 text-sm text-white no-underline font-medium"
                >
                  +91 9893027688
                </a>
                <a
                  href="mailto:support@dtpoonamsagar.com"
                  className="rounded-xl border border-white/35 py-3.5 px-6 text-sm text-white no-underline font-medium"
                >
                  support@dtpoonamsagar.com
                </a>
              </div>
              <div className="mt-8 flex items-center gap-5">
                <span className="text-base font-semibold">Follow on:</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-white/35 text-[15px] text-white no-underline"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center gap-5">
                <span className="text-base font-semibold">Download on :</span>
                <div className="flex items-center gap-3">
                  <a href="https://apps.apple.com/us/app/dtps-nutrition/id6759550995" target="_blank" rel="noopener noreferrer" aria-label="Download on iOS">
                    <FaApple className="text-white text-xl" />
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=mw.dtps.app&pcampaignid=web_share" target="_blank" rel="noopener noreferrer" aria-label="Get it on Android">
                    <FaAndroid className="text-white text-xl" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Services */}
            <div className="min-w-0 w-full md:w-auto md:min-w-[180px]">
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Quick Links </h3>
              <ul className="list-none p-0 m-0 grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0">
                {serviceLinks.map((link) => (
                  <li key={link.href + link.label} className="mb-4">
                    {link.hasDropdown ? (
                      <div className="relative">
                        <button
                          onClick={() => setIsPlansOpen(!isPlansOpen)}
                          className="text-white/90 no-underline text-[15px] font-medium inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
                        >
                          {link.label}
                          <svg
                            className={`transition-transform duration-200 ${isPlansOpen ? 'rotate-180' : ''}`}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        <div className={`overflow-hidden transition-all duration-200 ${isPlansOpen ? 'max-h-40 mt-2' : 'max-h-0'}`}>
                          <Link href="/plans/wedding" className="block text-white/75 no-underline text-[14px] font-medium py-1 pl-3 hover:text-white">
                            Wedding Plan
                          </Link>
                          <Link href="/plans/therapeutic" className="block text-white/75 no-underline text-[14px] font-medium py-1 pl-3 hover:text-white">
                            Therapeutic Plan
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/90 no-underline text-[15px] font-medium inline-flex items-center gap-1.5"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-4 md:py-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-5 text-xs md:text-sm text-white/80 text-center md:text-left">
            <p className="m-0">Copyright © {new Date().getFullYear()} All Rights Reserved.</p>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
              {legalLinks.map((link, index) => (
                <span key={link.href} className="flex items-center gap-4">
                  <Link href={link.href} className="text-white/80 no-underline">
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && <span className="text-white/50">–</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

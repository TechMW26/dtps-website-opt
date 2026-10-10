import type { Metadata, Viewport } from 'next';
import { poppins, epilogue, latinFontPreloads } from '@/lib/fonts';
import Script from 'next/script';
import './globals.css';
import './fonts.css';
import { AuthProvider } from './providers';
import { ThemeProvider } from './providers/ThemeProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import PixelTracker from '@/components/PixelTracker';
import ClarityTracker from '@/components/ClarityTracker';
import { Suspense } from 'react';
import { META_PIXEL_ID, META_PIXEL_BOOTSTRAP } from '@/lib/meta-config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#014E4E',
};

const SITE_URL = 'https://www.dtpoonamsagar.com';
const LOGO_URL =
  'https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';
const GA4_MEASUREMENT_ID = 'G-R647JLBMXD';
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const CLARITY_ALLOWED_HOSTS = ['www.dtpoonamsagar.com', 'dtpoonamsagar.com'];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dietitian Poonam Sagar – Expert Nutrition & Weight Loss',
    template: '%s | Dietitian Poonam Sagar',
  },
  description:
    'Achieve your wellness goals with personalised diet plans from Dietitian Poonam Sagar. 25+ years of expertise, 1 lakh+ clients transformed. Weight loss, PCOD, therapeutic nutrition & more.',
  keywords: [
    'dietitian Bhopal',
    'Poonam Sagar',
    'weight loss dietitian',
    'PCOD diet plan',
    'therapeutic nutrition',
    'online diet consultation',
    'nutrition expert India',
    'personalized diet plan',
    'health coach',
    'wellness',
  ],
  authors: [{ name: 'Dietitian Poonam Sagar', url: SITE_URL }],
  creator: 'Dietitian Poonam Sagar',
  publisher: 'Dietitian Poonam Sagar',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Dietitian Poonam Sagar – Expert Nutrition & Weight Loss',
    description:
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 1 lakh+ clients transformed.',
    url: SITE_URL,
    siteName: 'Dietitian Poonam Sagar',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: LOGO_URL,
        width: 1200,
        height: 630,
        alt: 'Dietitian Poonam Sagar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dietitian Poonam Sagar – Expert Nutrition & Weight Loss',
    description:
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 1 lakh+ clients transformed.',
    images: [LOGO_URL],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${epilogue.variable}`}>
      <head>
        {/* Preconnect to critical external domains */}
        <link rel="preconnect" href="https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
        {latinFontPreloads.map(href => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {/* DNS prefetch for secondary domains */}
        <link rel="dns-prefetch" href="https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Preload critical hero image */}
        <link
          rel="preload"
          href="https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png"
          as="image"
          type="image/webp"
        />

        <Script id="meta-pixel-base" strategy="beforeInteractive">
          {META_PIXEL_BOOTSTRAP}
        </Script>

        {/*
          Google Analytics 4 (gtag.js).
          - Auto page_view on initial load is disabled (`send_page_view: false`)
            because <PixelTracker /> fires page_view on EVERY route change
            (initial + SPA navigations) so we don't double-count.
          - Funnel events (begin_checkout, add_payment_info, purchase) are sent
            by the same code paths as the Meta Pixel — single source of truth.
        */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.__GA4_MEASUREMENT_ID__ = '${GA4_MEASUREMENT_ID}';
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>


      </head>
      <body>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
        </noscript>
        <AuthProvider>
          <ThemeProvider>
            <ClarityTracker projectId={CLARITY_PROJECT_ID} enabledHosts={CLARITY_ALLOWED_HOSTS} />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            {/* PageView on client navigation; Meta conversion events remain disabled. */}
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

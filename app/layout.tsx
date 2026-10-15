import type { Metadata, Viewport } from 'next';
import { poppins, epilogue, latinFontPreloads } from '@/lib/fonts';
import './globals.css';
import './fonts.css';
import { AuthProvider } from './providers';
import { ThemeProvider } from './providers/ThemeProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import PixelTracker from '@/components/PixelTracker';
import ClarityTracker from '@/components/ClarityTracker';
import ZappushTracker from '@/components/ZappushTracker';
import ConsentGatedTags from '@/components/ConsentGatedTags';
import { Suspense } from 'react';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#014E4E',
};

const SITE_URL = 'https://www.dtpoonamsagar.com';
const LOGO_URL =
  'https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';
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
        <link rel="preconnect" href="https://api.zappush.com" crossOrigin="anonymous" />
        {latinFontPreloads.map(href => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {/* DNS prefetch for secondary domains */}
        <link rel="dns-prefetch" href="https://n1ryg7cslgpozeiu.public.blob.vercel-storage.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        {/*
          The Zappush tracker is NOT loaded from the document head. It is injected
          by <ZappushTracker /> only after the visitor grants analytics and
          advertising consent, so a visitor who has not chosen makes no request to
          the tracker at all. See docs/zappush-integration.md.
        */}

        {/*
          The hero image is preloaded by `next/image` itself (Hero.tsx and
          LeadFormLandingPage.tsx set `priority`), which emits an optimised
          `/_next/image` preload in the head. A manual <link rel="preload"> here
          pointed at the raw blob URL with a hardcoded `type="image/webp"`, so the
          browser never reused it and every route paid for a wasted hero download.
        */}

        {/*
          Meta Pixel and Google Analytics 4 are loaded by <ConsentGatedTags />
          only after the visitor grants analytics and advertising consent, so a
          visitor who denies (or has not yet chosen) makes no request to
          connect.facebook.net or googletagmanager.com. See
          components/ConsentGatedTags.tsx and docs/zappush-integration.md.
        */}
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ClarityTracker projectId={CLARITY_PROJECT_ID} enabledHosts={CLARITY_ALLOWED_HOSTS} />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            {/* Meta Pixel + GA4 scripts, consent-gated. */}
            <ConsentGatedTags />
            {/* PageView on initial load and client navigation; gated by consent
                inside lib/pixel.ts. */}
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>
            {/* Zappush tracker (consent-gated) + the consent prompt itself. */}
            <Suspense fallback={null}>
              <ZappushTracker />
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

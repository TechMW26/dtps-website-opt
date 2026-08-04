import type { Metadata, Viewport } from 'next';
import { Poppins, Epilogue } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from './providers';
import { ThemeProvider } from './providers/ThemeProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import PixelTracker from '@/components/PixelTracker';
import ClarityTracker from '@/components/ClarityTracker';
import { Suspense } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-epilogue',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#014E4E',
};

const SITE_URL = 'https://www.dtpoonamsagar.com';
const LOGO_URL =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';
const META_PIXEL_PRIMARY_ID = '1249607162337272';
const META_PIXEL_SECONDARY_ID = '451000204060350';
const META_PIXEL_TERTIARY_ID = '28310721625213137';
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
    'Achieve your wellness goals with personalised diet plans from Dietitian Poonam Sagar. 25+ years of expertise, 1,00,000+ clients transformed. Weight loss, PCOD, therapeutic nutrition & more.',
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
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 1,00,000+ clients transformed.',
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
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 1,00,000+ clients transformed.',
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
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.clarity.ms" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for secondary domains */}
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />

        {/* Preload critical hero image */}
        <link
          rel="preload"
          href="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-80,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png"
          as="image"
          type="image/webp"
        />

        {/*
          Meta Pixel base snippet.
          - Loaded `afterInteractive` so it is ready before users click "Buy Now"
            (the previous `lazyOnload` could miss early click events).
          - All custom events are fired by <PixelTracker /> via lib/pixel.ts.
          - To add / remove pixels in the future, edit META_PIXEL_IDS only.
        */}
        <Script id="meta-pixel-base" strategy="afterInteractive">
          {`
            window.__META_PIXEL_IDS__ = ['${META_PIXEL_PRIMARY_ID}', '${META_PIXEL_SECONDARY_ID}', '${META_PIXEL_TERTIARY_ID}'];
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            window.__META_PIXEL_IDS__.forEach(function(id){ fbq('init', id); });
            fbq('track', 'PageView');
          `}
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
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_PRIMARY_ID}&ev=PageView&noscript=1`}
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_SECONDARY_ID}&ev=PageView&noscript=1`}
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_TERTIARY_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <AuthProvider>
          <ThemeProvider>
            <ClarityTracker projectId={CLARITY_PROJECT_ID} enabledHosts={CLARITY_ALLOWED_HOSTS} />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            {/* Global Meta Pixel router — auto-tracks PageView on every SPA
                navigation, InitiateCheckout on any /checkout link click, and
                Purchase on /checkout/success. Wrapped in Suspense because it
                uses useSearchParams(). */}
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

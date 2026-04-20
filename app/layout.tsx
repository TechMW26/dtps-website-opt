import type { Metadata, Viewport } from 'next';
import { Poppins, Epilogue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './providers';
import { ThemeProvider } from './providers/ThemeProvider';
import LayoutWrapper from '@/components/LayoutWrapper';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-epilogue',
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#014E4E',
};

const SITE_URL = 'https://www.dtpoonamsagar.com';
const LOGO_URL =
  'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-69b7c675a14dfc9fbf5ad523.jpg';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dietitian Poonam Sagar – Expert Nutrition & Weight Loss',
    template: '%s | Dietitian Poonam Sagar',
  },
  description:
    'Achieve your wellness goals with personalised diet plans from Dietitian Poonam Sagar. 25+ years of expertise, 15,000+ clients transformed. Weight loss, PCOD, therapeutic nutrition & more.',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Dietitian Poonam Sagar – Expert Nutrition & Weight Loss',
    description:
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 15,000+ clients transformed.',
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
      'Personalised diet plans for weight loss, PCOD, therapeutic nutrition & wedding wellness. 25+ years of expertise, 15,000+ clients transformed.',
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
    <html lang="en" className={`${poppins.variable} ${epilogue.variable}`}>
      <head>
        {/* Preconnect to critical external domains */}
        <link rel="preconnect" href="https://ik.imagekit.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical hero image */}
        <link
          rel="preload"
          href="https://ik.imagekit.io/br0mssyqj/tr:w-600,q-80,f-auto/DTPS-Ecommerce/static/home/hero/dtps-hero-poonam-sagar-v2.png"
          as="image"
          type="image/webp"
        />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

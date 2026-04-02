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

export const metadata: Metadata = {
  title: 'Dietitian Poonam Sagar - Transform Your Health',
  description:
    'Achieve your wellness goals with personalized guidance, expert support, and sustainable habits for a healthier, happier you. 25+ years of expertise guiding over 15,000+ clients.',
  keywords: [
    'dietitian',
    'nutrition',
    'weight loss',
    'PCOD',
    'health coach',
    'wellness',
    'Poonam Sagar',
  ],
  authors: [{ name: 'Dietitian Poonam Sagar' }],
  openGraph: {
    title: 'Dietitian Poonam Sagar - Transform Your Health',
    description:
      'Achieve your wellness goals with personalized guidance, expert support, and sustainable habits.',
    type: 'website',
    locale: 'en_IN',
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

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const noCacheHeaders = [
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
];

const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://ik.imagekit.io https://www.facebook.com https://*.facebook.com https://*.fbcdn.net https://img.youtube.com https://placehold.co https://randomuser.me https://cdn.jsdelivr.net https://staging.dtpoonamsagar.com https://*.dtpoonamsagar.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com https://www.google.co.in https://www.clarity.ms https://*.clarity.ms",
  "media-src 'self' https://ik.imagekit.io",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://*.facebook.net https://checkout.razorpay.com https://www.youtube.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.clarity.ms https://*.clarity.ms",
  "frame-src 'self' https://www.youtube.com https://api.razorpay.com https://checkout.razorpay.com https://www.facebook.com https://td.doubleclick.net https://www.google.com https://maps.google.com https://www.google.co.in",
  "connect-src 'self' https://ik.imagekit.io https://api.razorpay.com https://www.facebook.com https://*.facebook.com https://connect.facebook.net https://*.facebook.net https://cdn.jsdelivr.net https://*.a.run.app https://*.conversionsapigateway.com https://ip-api.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.clarity.ms https://*.clarity.ms" + (isDev ? " ws://localhost:* wss://localhost:* http://localhost:*" : ""),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const nextConfig = {
  turbopack: { root: __dirname },
  transpilePackages: ['@microsoft/clarity'],
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  generateEtags: false,
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'recharts',
      'swiper',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80, 90],
    minimumCacheTTL: 0,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'staging.dtpoonamsagar.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'www.dtpoonamsagar.com' },
      { protocol: 'https', hostname: 'dtpoonamsagar.com' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
    ],
  },
  async redirects() {
    return [
      { source: '/weight-loss', destination: '/weight-loss-plan', permanent: true },
      { source: '/contact-form', destination: '/contact', permanent: true },
    ];
  },
  async headers() {
    return [
      // Static assets — cache aggressively (fingerprinted by build)
      {
        source: '/:all*(\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp|\\.avif|\\.svg|\\.ico|\\.woff|\\.woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // JS/CSS bundles — cache with revalidation (fingerprinted)
      {
        source: '/_next/static/:all*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Static pre-rendered pages — cache with stale-while-revalidate
      {
        source: '/((?!api|admin|checkout|_next).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          ...securityHeaders,
        ],
      },
      // Dynamic/API routes — no cache
      {
        source: '/(api|admin|checkout)/:path*',
        headers: [
          ...noCacheHeaders,
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          ...securityHeaders,
        ],
      },
    ];
  },
};

module.exports = nextConfig;

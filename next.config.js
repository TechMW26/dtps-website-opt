/** @type {import('next').NextConfig} */
const noCacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  },
  {
    key: 'Pragma',
    value: 'no-cache',
  },
  {
    key: 'Expires',
    value: '0',
  },
];

const nextConfig = {
  turbopack: {
    root: __dirname,
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  poweredByHeader: false,

  // Strip non-error console statements from production bundles to avoid
  // leaking debug info to end users.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  // Disable ETags so browsers do not keep revalidating stale assets.
  generateEtags: false,

  // Experimental optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Tree-shake heavy libraries to reduce unused JS in shared chunks.
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
    qualities: [85, 90],
    minimumCacheTTL: 0,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'staging.dtpoonamsagar.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'www.dtpoonamsagar.com',
      },
      {
        protocol: 'https',
        hostname: 'dtpoonamsagar.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },

  // Redirect old /weight-loss URL to new /weight-loss-plan
  async redirects() {
    return [
      {
        source: '/weight-loss',
        destination: '/weight-loss-plan',
        permanent: true,
      },
      {
        source: '/contact-form',
        destination: '/contact',
        permanent: true,
      },
    ];
  },

  // Add security headers, cache static assets aggressively, and disable
  // browser caching only for HTML/API responses.
  async headers() {
    return [
      // Hashed Next.js build assets – immutable & long-lived.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Static images shipped from /public – long-lived (revalidate via filename).
      {
        source: '/:all*(\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp|\\.avif|\\.svg|\\.ico|\\.woff|\\.woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Everything else (HTML / API): no caching.
      {
        source: '/:path*',
        headers: [
          ...noCacheHeaders,
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

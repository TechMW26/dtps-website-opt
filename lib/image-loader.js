'use strict';

/**
 * Custom image loader for Next.js.
 * - ImageKit URLs: builds a transformation URL served directly from ImageKit CDN (no /_next/image proxy).
 * - Other URLs: falls back to the default Next.js image optimization path.
 */
function imageLoader({ src, width, quality }) {
  // For ImageKit URLs, generate a direct CDN transformation URL
  if (src.includes('ik.imagekit.io')) {
    const q = quality || 80;

    // If the URL already contains a /tr: segment, strip it so we can apply fresh params
    const cleaned = src.replace(/\/tr:[^/]+\//, '/');

    try {
      const url = new URL(cleaned);
      // Insert transformation right after the URL-endpoint path segment
      // URL structure: https://ik.imagekit.io/<id>/DTPS-Ecommerce/...
      // We need:       https://ik.imagekit.io/<id>/tr:w-WIDTH,q-Q,f-auto/DTPS-Ecommerce/...
      const parts = url.pathname.split('/').filter(Boolean); // e.g. ['br0mssyqj', 'DTPS-Ecommerce', ...]
      if (parts.length >= 2) {
        const endpoint = parts[0]; // e.g. 'br0mssyqj'
        const rest = parts.slice(1).join('/');
        return `${url.origin}/${endpoint}/tr:w-${width},q-${q},f-auto/${rest}`;
      }
    } catch {
      // If URL parsing fails, return as-is
    }

    return src;
  }

  // For non-ImageKit URLs, use default Next.js optimization
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

module.exports = imageLoader;

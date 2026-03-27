'use client';

/**
 * Custom image loader for Next.js (must use ES module export default).
 * - ImageKit URLs: builds a transformation URL served directly from ImageKit CDN.
 * - Other URLs: returns src as-is (static public files).
 */
export default function imageLoader({ src, width, quality }) {
    // For ImageKit URLs, generate a direct CDN transformation URL
    if (src.includes('ik.imagekit.io')) {
        const q = quality || 80;

        // Strip any existing /tr: segment so we can apply fresh params
        const cleaned = src.replace(/\/tr:[^/]+\//, '/');

        try {
            const url = new URL(cleaned);
            // URL structure: https://ik.imagekit.io/<id>/DTPS-Ecommerce/...
            // Becomes:       https://ik.imagekit.io/<id>/tr:w-WIDTH,q-Q,f-auto/DTPS-Ecommerce/...
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
                const endpoint = parts[0]; // e.g. 'br0mssyqj'
                const rest = parts.slice(1).join('/');
                return `${url.origin}/${endpoint}/tr:w-${width},q-${q},f-auto/${rest}`;
            }
        } catch {
            // URL parsing failed, return as-is
        }

        return src;
    }

    // For non-ImageKit URLs (local public files), return as-is.
    return src;
}

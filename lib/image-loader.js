'use client';

/**
 * Custom image loader for Next.js with advanced optimization.
 * - ImageKit URLs: builds a transformation URL served directly from ImageKit CDN.
 * - Supports responsive widths and quality settings.
 * - Other URLs: returns src as-is (static public files).
 */
export default function imageLoader({ src, width, quality }) {
    const q = quality || 90;

    // For ImageKit URLs, generate a direct CDN transformation URL
    if (src.includes('ik.imagekit.io')) {
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
                // f-auto automatically serves WebP/AVIF based on browser support
                return `${url.origin}/${endpoint}/tr:w-${width},q-${q},f-auto/${rest}`;
            }
        } catch {
            // URL parsing failed, return as-is
        }

        return src;
    }

    // For non-ImageKit URLs, preserve src but include width/quality query
    // so Next.js sees that this custom loader handles width properly.
    if (src.startsWith('/') || src.startsWith('./') || src.startsWith('http')) {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}w=${width}&q=${q}`;
    }

    return src;
}

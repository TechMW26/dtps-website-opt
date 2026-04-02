'use client';

/**
 * Custom image loader for Next.js with advanced optimization.
 * - ImageKit URLs: builds a transformation URL served directly from ImageKit CDN.
 * - Supports responsive widths and quality settings.
 * - Other URLs: returns src as-is (static public files).
 */
export default function imageLoader({ src, width, quality }) {
    // For ImageKit URLs, generate a direct CDN transformation URL
    if (src.includes('ik.imagekit.io')) {
        // Use passed quality or default based on width (smaller = lower quality acceptable)
        const q = quality || (width <= 640 ? 70 : width <= 1080 ? 75 : 80);

        // Strip any existing /tr: segment so we can apply fresh params
        const cleaned = src.replace(/\/tr:[^/]+\//, '/');

        try {
            const url = new URL(cleaned);
            // URL structure: https://ik.imagekit.io/<id>/DTPS-Ecommerce/...
            // Becomes:       https://ik.imagekit.io/<id>/tr:w-WIDTH,q-Q,f-auto,pr-true/DTPS-Ecommerce/...
            const parts = url.pathname.split('/').filter(Boolean);
            if (parts.length >= 2) {
                const endpoint = parts[0]; // e.g. 'br0mssyqj'
                const rest = parts.slice(1).join('/');
                // pr-true enables progressive loading for JPEGs
                // f-auto automatically serves WebP/AVIF based on browser support
                return `${url.origin}/${endpoint}/tr:w-${width},q-${q},f-auto,pr-true/${rest}`;
            }
        } catch {
            // URL parsing failed, return as-is
        }

        return src;
    }

    // For non-ImageKit URLs (local public files), return as-is with width parameter support
    // This handles SVGs, PNGs, and other static files from the public directory
    if (src.startsWith('/') || src.startsWith('./')) {
        // Local files don't need transformation, return as-is
        return src;
    }

    return src;
}

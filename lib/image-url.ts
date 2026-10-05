/** Next.js handles responsive optimization for the existing Vercel Blob assets. */
export function getOptimizedUrl(url: string, _options: { width?: number; height?: number; quality?: number; format?: 'auto' | 'webp' | 'jpg' | 'png'; blur?: number } = {}): string {
  return url;
}

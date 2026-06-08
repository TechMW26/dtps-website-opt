export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    blur?: number;
  } = {}
): string {
  if (!url || !url.includes('imagekit.io')) return url;

  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return url;
  }

  if (urlObj.pathname.includes('/tr:')) return url;

  const transformations: string[] = [];

  if (options.width) transformations.push(`w-${options.width}`);
  if (options.height) transformations.push(`h-${options.height}`);
  if (options.quality) transformations.push(`q-${options.quality}`);
  if (options.format) transformations.push(`f-${options.format}`);
  if (options.blur) transformations.push(`bl-${options.blur}`);

  if (!options.quality) transformations.push('q-80');
  if (!options.format) transformations.push('f-auto');

  if (transformations.length === 0) return url;

  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  if (pathSegments.length === 0) return url;

  const inferredEndpoint = `${urlObj.origin}/${pathSegments[0]}`;
  const inferredPath = `/${pathSegments.slice(1).join('/')}`;

  return `${inferredEndpoint}/tr:${transformations.join(',')}${inferredPath}`;
}

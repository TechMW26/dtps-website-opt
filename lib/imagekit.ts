import ImageKit from 'imagekit';

const hasImageKitConfig = Boolean(
  process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
);

// Initialize ImageKit only when config is available (server-side)
const imagekit = hasImageKitConfig
  ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
    })
  : null;

// Folder structure for DTPS-Ecommerce
export const IMAGEKIT_FOLDERS = {
  ROOT: '/DTPS-Ecommerce',
  TESTIMONIALS: '/DTPS-Ecommerce/testimonials',
  RECOGNITION: '/DTPS-Ecommerce/recognition',
  PRICING: '/DTPS-Ecommerce/pricing',
  SUCCESS_STORIES: '/DTPS-Ecommerce/success-stories',
  TRANSFORMATIONS: '/DTPS-Ecommerce/transformations',
  BLOGS: '/DTPS-Ecommerce/blogs',
  ADMIN: '/DTPS-Ecommerce/admin',
  PLAN_BANNERS: '/DTPS-Ecommerce/dynamic/plan-banners',
} as const;

export type ImageKitFolderType = keyof typeof IMAGEKIT_FOLDERS;

interface UploadOptions {
  file: string | Buffer; // Base64 string or Buffer
  fileName: string;
  folder: string;
  tags?: string[];
  useUniqueFileName?: boolean;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  fileId?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * Upload image to ImageKit with compression
 * ImageKit automatically compresses and optimizes images
 */
export async function uploadImage(options: UploadOptions): Promise<UploadResponse> {
  if (!imagekit) {
    if (typeof window === 'undefined') {
      console.warn('ImageKit upload skipped: missing IMAGEKIT_* environment variables.');
    }
    return {
      success: false,
      error: 'ImageKit is not configured',
    };
  }
  try {
    const response = await imagekit.upload({
      file: options.file,
      fileName: options.fileName,
      folder: options.folder,
      tags: options.tags || [],
      useUniqueFileName: options.useUniqueFileName ?? true,
      // ImageKit transformation for compression on delivery
      extensions: [
        {
          name: 'google-auto-tagging',
          maxTags: 5,
          minConfidence: 95,
        },
      ],
    });

    return {
      success: true,
      url: response.url,
      fileId: response.fileId,
      thumbnailUrl: response.thumbnailUrl,
    };
  } catch (error: unknown) {
    console.error('ImageKit upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Delete image from ImageKit
 */
export async function deleteImage(fileId: string): Promise<{ success: boolean; error?: string }> {
  if (!imagekit) {
    if (typeof window === 'undefined') {
      console.warn('ImageKit delete skipped: missing IMAGEKIT_* environment variables.');
    }
    return { success: false, error: 'ImageKit is not configured' };
  }
  try {
    await imagekit.deleteFile(fileId);
    return { success: true };
  } catch (error: unknown) {
    console.error('ImageKit delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

/**
 * Get optimized/compressed image URL with transformations
 * @param url - Original ImageKit URL
 * @param options - Transformation options
 */
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

  // Default compression settings
  if (!options.quality) transformations.push('q-80');
  if (!options.format) transformations.push('f-auto');

  if (transformations.length === 0) return url;

  // Insert transformations into URL
  const endpointFromEnv = process.env.IMAGEKIT_URL_ENDPOINT;
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return url;

  const inferredEndpoint = endpointFromEnv
    ? endpointFromEnv
    : `${urlObj.origin}/${pathSegments[0]}`;
  const inferredPath = endpointFromEnv
    ? url.replace(endpointFromEnv, '')
    : `/${pathSegments.slice(1).join('/')}`;

  return `${inferredEndpoint}/tr:${transformations.join(',')}${inferredPath}`;
}

/**
 * Get authentication parameters for client-side upload
 */
export function getAuthenticationParameters() {
  if (!imagekit) {
    if (typeof window === 'undefined') {
      console.warn('ImageKit auth skipped: missing IMAGEKIT_* environment variables.');
    }
    return null;
  }
  return imagekit.getAuthenticationParameters();
}

export default imagekit;

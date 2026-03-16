import sharp from 'sharp';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Compress and optimize image before upload
 * @param buffer - Original image buffer
 * @param options - Compression options
 * @returns Compressed image buffer
 */
export async function compressImage(
  buffer: Buffer,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp',
  } = options;

  let sharpInstance = sharp(buffer);

  // Get image metadata
  const metadata = await sharpInstance.metadata();

  // Resize if larger than max dimensions while maintaining aspect ratio
  if (metadata.width && metadata.height) {
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // Apply format-specific compression
  switch (format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      break;
  }

  return sharpInstance.toBuffer();
}

/**
 * Compress image for thumbnail
 */
export async function createThumbnail(
  buffer: Buffer,
  size: number = 150
): Promise<Buffer> {
  return sharp(buffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 70 })
    .toBuffer();
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert base64 to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convert buffer to base64
 */
export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/webp'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

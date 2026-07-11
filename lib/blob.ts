import { put, del, head } from '@vercel/blob';

/**
 * Vercel Blob Storage client — replacement for ImageKit upload/delete.
 * Existing ImageKit CDN URLs continue to work for already-uploaded images.
 */

// Folder mapping — used as path prefixes in blob storage
export const BLOB_FOLDERS = {
  ROOT: 'dtps',
  TESTIMONIALS: 'dtps/testimonials',
  RECOGNITION: 'dtps/recognition',
  PRICING: 'dtps/pricing',
  SUCCESS_STORIES: 'dtps/success-stories',
  TRANSFORMATIONS: 'dtps/transformations',
  BLOGS: 'dtps/blogs',
  ADMIN: 'dtps/admin',
  PLAN_BANNERS: 'dtps/plan-banners',
  BANNERS: 'dtps/banners',
} as const;

export type BlobFolderType = keyof typeof BLOB_FOLDERS;

interface UploadOptions {
  file: string | Buffer | File;
  fileName: string;
  folder: string;
  contentType?: string;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * Upload a file to Vercel Blob Storage.
 */
export async function uploadBlob(options: UploadOptions): Promise<UploadResponse> {
  try {
    const pathname = `${options.folder}/${options.fileName}`;
    
    let body: Buffer | File;
    if (typeof options.file === 'string') {
      // Base64 string
      body = Buffer.from(options.file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    } else if (Buffer.isBuffer(options.file)) {
      body = options.file;
    } else {
      // File object (from formData)
      body = options.file;
    }

    const blob = await put(pathname, body, {
      access: 'public',
      addRandomSuffix: true,
      contentType: options.contentType,
    });

    return {
      success: true,
      url: blob.url,
      fileId: blob.pathname,
    };
  } catch (error: unknown) {
    console.error('Vercel Blob upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to blob storage',
    };
  }
}

/**
 * Delete a file from Vercel Blob Storage by its URL or pathname.
 */
export async function deleteBlob(fileIdOrUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // If it's a full URL, extract the pathname
    let pathname = fileIdOrUrl;
    if (pathname.startsWith('http')) {
      const url = new URL(pathname);
      pathname = url.pathname.substring(1); // remove leading slash
    }
    await del(pathname);
    return { success: true };
  } catch (error: unknown) {
    console.error('Vercel Blob delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete from blob storage',
    };
  }
}

/**
 * Check if a blob exists.
 */
export async function blobExists(pathname: string): Promise<boolean> {
  try {
    const result = await head(pathname);
    return !!result;
  } catch {
    return false;
  }
}

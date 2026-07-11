import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadBlob, deleteBlob, BLOB_FOLDERS } from '@/lib/blob';
import { compressImage, base64ToBuffer, bufferToBase64 } from '@/lib/imageCompression';

// Folder mapping
const folderMap: Record<string, string> = {
  testimonials: BLOB_FOLDERS.TESTIMONIALS,
  recognition: BLOB_FOLDERS.RECOGNITION,
  pricing: BLOB_FOLDERS.PRICING,
  'success-stories': BLOB_FOLDERS.SUCCESS_STORIES,
  transformations: BLOB_FOLDERS.TRANSFORMATIONS,
  blogs: BLOB_FOLDERS.BLOGS,
  admin: BLOB_FOLDERS.ADMIN,
  'plan-banners': BLOB_FOLDERS.PLAN_BANNERS,
};

// POST - Upload image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image, fileName, folder, compress = true } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!folder || !folderMap[folder]) {
      return NextResponse.json(
        { error: 'Invalid folder. Valid options: ' + Object.keys(folderMap).join(', ') },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    let imageBuffer = base64ToBuffer(image);

    // Compress image if enabled
    if (compress) {
      imageBuffer = await compressImage(imageBuffer, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 80,
        format: 'webp',
      });
    }

    // Generate filename with timestamp
    const timestamp = Date.now();
    const safeName = (fileName || 'image')
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase();
    const finalFileName = `${safeName}-${timestamp}.webp`;

    // Upload to Vercel Blob Storage
    const result = await uploadBlob({
      file: imageBuffer,
      fileName: finalFileName,
      folder: folderMap[folder],
      contentType: 'image/webp',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE - Delete image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    const result = await deleteBlob(fileId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}

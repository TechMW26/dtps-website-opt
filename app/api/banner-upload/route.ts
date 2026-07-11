import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const deviceType = formData.get('deviceType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'webp';
    const folder = `dtps/banners/${deviceType || 'general'}`;
    const fileName = `${deviceType || 'banner'}-${timestamp}.${ext}`;

    const blob = await put(`${folder}/${fileName}`, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      optimizedUrl: blob.url,
      fileId: blob.pathname,
      name: fileName,
      filePath: blob.pathname,
    });
  } catch (error: any) {
    console.error('Banner upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

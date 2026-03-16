import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

// Function to initialize ImageKit lazily (only when needed)
function initializeImageKit() {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('Missing ImageKit env vars:', {
        publicKey: !!publicKey,
        privateKey: !!privateKey,
        urlEndpoint: !!urlEndpoint,
      });
      return null;
    }

    const imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey,
      urlEndpoint: urlEndpoint,
    });
    return imagekit;
  } catch (error) {
    console.error('Failed to initialize ImageKit:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Initialize ImageKit only when the endpoint is called
    const imagekit = initializeImageKit();
    
    if (!imagekit) {
      return NextResponse.json(
        { error: 'ImageKit not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const deviceType = formData.get('deviceType') as string; // 'desktop', 'mobile', or 'icon'

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

    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const fileName = `${deviceType}-${timestamp}-${file.name}`;
    
    // Dynamic folder structure: DTPS_Ecommerce/banners/deviceType/
    const folder = `/DTPS_Ecommerce/banners/${deviceType}`;

    // Upload to ImageKit with dynamic folder structure
    // Folder: /DTPS_Ecommerce/banners/{deviceType}/
    // Example: /DTPS_Ecommerce/banners/icon/icon-1234567890-image.jpg
    const response: any = await imagekit.upload({
      file: Buffer.from(buffer),
      fileName: fileName,
      folder: folder,
      isPrivateFile: false,
      // Note: Custom metadata removed as ImageKit requires fields to be pre-configured
      // The folder structure itself provides the device type information
    });

    // Generate optimized URL with compression
    let transformations: any[] = [];
    
    if (deviceType === 'icon') {
      // Icons: smaller size, aggressive compression
      transformations = [
        {
          width: '200',
          height: '200',
          crop: 'auto',
          quality: '75',
          format: 'auto',
        },
      ];
    } else if (deviceType === 'mobile') {
      // Mobile banners: smaller width, high quality
      transformations = [
        {
          width: '600',
          quality: '80',
          format: 'auto',
        },
      ];
    } else {
      // Desktop banners: full width, high quality
      transformations = [
        {
          width: '1200',
          quality: '80',
          format: 'auto',
        },
      ];
    }

    const optimizedUrl = imagekit.url({
      path: response.filePath,
      transformation: transformations,
    });

    return NextResponse.json({
      success: true,
      url: response.url,
      optimizedUrl: optimizedUrl,
      fileId: response.fileId,
      name: response.name,
      size: response.size,
      filePath: response.filePath,
    });
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

import { saveSiteBanner, getContent, deleteContent } from '@/lib/website-content';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const page = searchParams.get('page');

    const banners = (await getWebsiteFirestore().collection('websiteSiteBanners').get()).docs
      .map((doc) => serializeFirestoreDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((item: any) => (!type || item.type === type) && (active !== 'true' || item.isActive === true) && (!page || item.page === page))
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    
    return NextResponse.json({ banners }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const body = await req.json();
    const { type, title, icon, desktopImage, mobileImage, link, page, isActive, order } = body;

    if (!type || !title?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 }
      );
    }

    if (!['marquee', 'hero-banner'].includes(type)) {
      return NextResponse.json({ error: 'Invalid banner type' }, { status: 400 });
    }

    if (type === 'hero-banner' && (!page || !desktopImage)) {
      return NextResponse.json(
        { error: 'Hero banners require a page and desktop image' },
        { status: 400 }
      );
    }

    // Custom hero banners are opt-in. The existing page hero remains visible
    // until an admin explicitly enables the uploaded banner.
    const activeStatus = isActive !== undefined
      ? Boolean(isActive)
      : type === 'hero-banner'
        ? false
        : true;

    const banner = await saveSiteBanner(null, {
      type,
      title: title.trim(),
      icon: icon || null,
      desktopImage,
      mobileImage,
      link,
      page: page || null,
      isActive: activeStatus,
      order: order || 0,
    });

    
    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error('Banner save error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existingBanner = await getContent('websiteSiteBanners', id);
    if (!existingBanner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    const nextType = body.type ?? existingBanner.type;
    const nextPage = body.page !== undefined ? body.page : existingBanner.page;
    const nextDesktopImage = body.desktopImage !== undefined
      ? body.desktopImage
      : existingBanner.desktopImage;

    if (!['marquee', 'hero-banner'].includes(nextType)) {
      return NextResponse.json({ error: 'Invalid banner type' }, { status: 400 });
    }

    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (nextType === 'hero-banner' && (!nextPage || !nextDesktopImage)) {
      return NextResponse.json(
        { error: 'Hero banners require a page and desktop image' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const editableFields = [
      'type',
      'title',
      'icon',
      'desktopImage',
      'mobileImage',
      'link',
      'page',
      'isActive',
      'order',
    ];

    for (const field of editableFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (typeof updateData.title === 'string') {
      updateData.title = updateData.title.trim();
    }

    const banner = await saveSiteBanner(id, updateData);

    return NextResponse.json(banner, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const banner = await deleteContent('websiteSiteBanners', id);

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

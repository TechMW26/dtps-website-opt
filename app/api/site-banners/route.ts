import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import SiteBanner from '@/models/SiteBanner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const page = searchParams.get('page');

    const query: any = {};
    if (type) query.type = type;
    if (active === 'true') query.isActive = true;
    if (page) query.page = page;

    const banners = await SiteBanner.find(query).sort({ order: 1, createdAt: -1 });
    
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

    await dbConnect();
    
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

    // A page can only have one custom hero replacing its normal hero at a time.
    if (type === 'hero-banner' && activeStatus) {
      await SiteBanner.updateMany(
        { type: 'hero-banner', page },
        { $set: { isActive: false } }
      );
    }

    const banner = new SiteBanner({
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

    await banner.save();
    
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

    await dbConnect();
    
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const existingBanner = await SiteBanner.findById(id);
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

    // Activating a custom hero automatically disables any other custom hero
    // for that same page, giving the storefront a deterministic selection.
    if (nextType === 'hero-banner' && body.isActive === true) {
      await SiteBanner.updateMany(
        { _id: { $ne: id }, type: 'hero-banner', page: nextPage },
        { $set: { isActive: false } }
      );
    }

    const banner = await SiteBanner.findByIdAndUpdate(id, updateData, { new: true });

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

    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const banner = await SiteBanner.findByIdAndDelete(id);

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

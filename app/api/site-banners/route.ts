import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteBanner, { ISiteBanner } from '@/models/SiteBanner';

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

    const banners = await SiteBanner.find(query).sort({ order: 1 });
    
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
    await dbConnect();
    
    const body = await req.json();
    const { type, title, icon, desktopImage, mobileImage, link, page, isActive, order } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title' },
        { status: 400 }
      );
    }

    const banner = new SiteBanner({
      type,
      title,
      icon: icon || null,
      desktopImage,
      mobileImage,
      link,
      page: page || null,
      isActive: isActive !== undefined ? isActive : true,
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
    await dbConnect();
    
    const body = await req.json();
    const { id, type, title, icon, desktopImage, mobileImage, link, page, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const banner = await SiteBanner.findByIdAndUpdate(
      id,
      {
        type,
        title,
        icon: icon || null,
        desktopImage,
        mobileImage,
        link,
        page: page || null,
        isActive,
        order,
      },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

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

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageHero, { IPageHero } from '@/models/PageHero';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json(
        { error: 'Page parameter is required' },
        { status: 400 }
      );
    }

    const hero = await PageHero.findOne({ page, isActive: true });
    
    if (!hero) {
      return NextResponse.json(
        { hero: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ hero }, { status: 200 });
  } catch (error: any) {
    console.error('PageHero fetch error:', error);
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
    const { page, title, subtitle, description, buttonText, buttonLink, image, isActive } = body;

    if (!page || !title || !subtitle || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: page, title, subtitle, description' },
        { status: 400 }
      );
    }

    // Check if hero for this page already exists
    const existing = await PageHero.findOne({ page });
    if (existing) {
      return NextResponse.json(
        { error: 'Hero section already exists for this page. Use PUT to update.' },
        { status: 400 }
      );
    }

    const hero = new PageHero({
      page,
      title,
      subtitle,
      description,
      buttonText: buttonText || 'Buy Plan',
      buttonLink: buttonLink || '/appointment',
      image: image || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await hero.save();
    
    return NextResponse.json(hero, { status: 201 });
  } catch (error: any) {
    console.error('PageHero create error:', error);
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
    const { page, title, subtitle, description, buttonText, buttonLink, image, isActive } = body;

    if (!page) {
      return NextResponse.json(
        { error: 'Page is required' },
        { status: 400 }
      );
    }

    const hero = await PageHero.findOneAndUpdate(
      { page },
      {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        image,
        isActive,
      },
      { new: true }
    );

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero section not found for this page' },
        { status: 404 }
      );
    }

    return NextResponse.json(hero, { status: 200 });
  } catch (error: any) {
    console.error('PageHero update error:', error);
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
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json(
        { error: 'Page parameter is required' },
        { status: 400 }
      );
    }

    const hero = await PageHero.findOneAndDelete({ page });

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Hero section deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PageHero delete error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

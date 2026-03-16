import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

// Get all testimonials
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'all';
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');

    const query: any = {};
    if (page !== 'all') query.page = page;
    if (featured === 'true') query.featured = true;
    if (isActive === 'true') query.isActive = true;

    const testimonials = await Testimonial.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      testimonials,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// Create testimonial (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

  const body = await request.json();
  const payload = { ...body };

  if (!payload.name) payload.name = 'Image';
  if (!payload.content) payload.content = 'Image testimonial';
  if (!payload.page) payload.page = 'home';
  if (payload.rating === undefined || payload.rating === null) payload.rating = 5;
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const testimonial = await Testimonial.create(payload);

    return NextResponse.json({
      success: true,
      testimonial,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// Update testimonial (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      testimonial,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// Delete testimonial (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}

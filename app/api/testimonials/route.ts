import { createContent, updateContent, deleteContent, getContent } from '@/lib/website-content';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'all';
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');

    const testimonials = (await getWebsiteFirestore().collection('websiteTestimonials').get()).docs
      .map((doc) => serializeFirestoreDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((item: any) => (page === 'all' || item.page === page) && (featured !== 'true' || item.featured === true) && (isActive !== 'true' || item.isActive === true))
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

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


  const body = await request.json();
  const payload = { ...body };

  if (!payload.name) payload.name = 'Image';
  if (!payload.content) payload.content = 'Image testimonial';
  if (!payload.page) payload.page = 'home';
  if (payload.rating === undefined || payload.rating === null) payload.rating = 5;
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const testimonial = await createContent('websiteTestimonials', payload);

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


    const body = await request.json();
    const { id, ...updateData } = body;

    const testimonial = await updateContent('websiteTestimonials', id, updateData);

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


    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const testimonial = await deleteContent('websiteTestimonials', id);

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

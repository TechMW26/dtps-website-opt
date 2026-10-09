import { createContent, updateContent, deleteContent, getContent } from '@/lib/website-content';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';

// Get all success stories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');

    const successStories = (await getWebsiteDatabase().collection('websiteSuccessStories').get()).docs
      .map((doc) => serializeDatabaseDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((item: any) => (!page || item.page === page) && (!type || item.type === type) && (featured !== 'true' || item.featured === true) && (isActive !== 'true' || item.isActive === true))
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

    return NextResponse.json({
      success: true,
      successStories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch success stories' },
      { status: 500 }
    );
  }
}

// Create success story (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


  const body = await request.json();
  const payload = { ...body };

  if (!payload.name) payload.name = payload.clientName || 'Success Story';
  if (!payload.page) payload.page = 'weight-loss';
  if (!payload.type) payload.type = 'transformation';
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const successStory = await createContent('websiteSuccessStories', payload);

    return NextResponse.json({
      success: true,
      successStory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create success story' },
      { status: 500 }
    );
  }
}

// Update success story (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const body = await request.json();
    const { id, ...updateData } = body;

    const successStory = await updateContent('websiteSuccessStories', id, updateData);

    if (!successStory) {
      return NextResponse.json({ error: 'Success story not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      successStory,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update success story' },
      { status: 500 }
    );
  }
}

// Delete success story (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const successStory = await deleteContent('websiteSuccessStories', id);

    if (!successStory) {
      return NextResponse.json({ error: 'Success story not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Success story deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete success story' },
      { status: 500 }
    );
  }
}

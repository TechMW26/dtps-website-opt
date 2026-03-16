import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SuccessStory from '@/models/SuccessStory';

// Get all success stories
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');

    const query: any = {};
    if (page) query.page = page;
    if (type) query.type = type;
    if (featured === 'true') query.featured = true;
    if (isActive === 'true') query.isActive = true;

    const successStories = await SuccessStory.find(query).sort({ order: 1, createdAt: -1 });

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

    await dbConnect();

  const body = await request.json();
  const payload = { ...body };

  if (!payload.name) payload.name = payload.clientName || 'Success Story';
  if (!payload.page) payload.page = 'weight-loss';
  if (!payload.type) payload.type = 'transformation';
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const successStory = await SuccessStory.create(payload);

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

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const successStory = await SuccessStory.findByIdAndUpdate(id, updateData, { new: true });

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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const successStory = await SuccessStory.findByIdAndDelete(id);

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

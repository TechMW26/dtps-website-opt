import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transformation from '@/models/Transformation';

// Get all transformations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');

    const query: any = {};
    if (page) query.page = page;
    if (featured === 'true') query.featured = true;
    if (isActive === 'true') query.isActive = true;

    const transformations = await Transformation.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      transformations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transformations' },
      { status: 500 }
    );
  }
}

// Create transformation (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

  const body = await request.json();
  const payload = { ...body };

  if (!payload.clientName) payload.clientName = payload.title || 'Transformation';
  if (!payload.weightLost) payload.weightLost = payload.metrics || '0';
  if (!payload.daysToAchieve) payload.daysToAchieve = payload.duration || '0';
  if (!payload.page) payload.page = 'weight-loss';
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const transformation = await Transformation.create(payload);

    return NextResponse.json({
      success: true,
      transformation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create transformation' },
      { status: 500 }
    );
  }
}

// Update transformation (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const transformation = await Transformation.findByIdAndUpdate(id, updateData, { new: true });

    if (!transformation) {
      return NextResponse.json({ error: 'Transformation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      transformation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update transformation' },
      { status: 500 }
    );
  }
}

// Delete transformation (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const transformation = await Transformation.findByIdAndDelete(id);

    if (!transformation) {
      return NextResponse.json({ error: 'Transformation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transformation deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete transformation' },
      { status: 500 }
    );
  }
}

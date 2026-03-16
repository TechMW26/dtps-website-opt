import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Recognition from '@/models/Recognition';

// Get all recognitions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');

    const query: any = {};
    if (isActive === 'true') query.isActive = true;

    const recognitions = await Recognition.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      recognitions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recognitions' },
      { status: 500 }
    );
  }
}

// Create recognition (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

  const body = await request.json();
  const payload = { ...body };

  if (!payload.title) payload.title = 'Recognition Image';
  if (!payload.description) payload.description = 'Recognition image';
  if (!payload.year) payload.year = `${new Date().getFullYear()}`;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const recognition = await Recognition.create(payload);

    return NextResponse.json({
      success: true,
      recognition,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create recognition' },
      { status: 500 }
    );
  }
}

// Update recognition (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const recognition = await Recognition.findByIdAndUpdate(id, updateData, { new: true });

    if (!recognition) {
      return NextResponse.json({ error: 'Recognition not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      recognition,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update recognition' },
      { status: 500 }
    );
  }
}

// Delete recognition (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const recognition = await Recognition.findByIdAndDelete(id);

    if (!recognition) {
      return NextResponse.json({ error: 'Recognition not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recognition deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete recognition' },
      { status: 500 }
    );
  }
}

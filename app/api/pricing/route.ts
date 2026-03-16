import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Pricing from '@/models/Pricing';

// Get all pricing plans
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const category = searchParams.get('category');
    const isActive = searchParams.get('active');

    const query: any = {};
    if (page) query.page = page;
    if (category) query.category = category;
    if (isActive === 'true') query.isActive = true;

    const pricing = await Pricing.find(query).sort({ order: 1, price: 1 });

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

// Create pricing (protected)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const pricing = await Pricing.create(body);

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create pricing' },
      { status: 500 }
    );
  }
}

// Update pricing (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    const pricing = await Pricing.findByIdAndUpdate(id, updateData, { new: true });

    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update pricing' },
      { status: 500 }
    );
  }
}

// Delete pricing (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const pricing = await Pricing.findByIdAndDelete(id);

    if (!pricing) {
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete pricing' },
      { status: 500 }
    );
  }
}

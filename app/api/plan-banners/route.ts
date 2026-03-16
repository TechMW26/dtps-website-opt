import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import PlanBanner from '@/models/PlanBanner';

// Get banners by page or planId
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const planId = searchParams.get('planId');
    const isActive = searchParams.get('active');

    const query: any = {};
    if (page) query.page = page;
    if (planId) query.planId = planId;
    if (isActive === 'true') query.isActive = true;

    const banners = await PlanBanner.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan banners' },
      { status: 500 }
    );
  }
}

// Create plan banner (protected) - deletes old banner for same plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { planId, page } = body;

    if (!planId || !page) {
      return NextResponse.json(
        { error: 'planId and page are required' },
        { status: 400 }
      );
    }

    // Delete existing banner for this plan
    const existingBanner = await PlanBanner.findOne({ planId, page });
    if (existingBanner) {
      await PlanBanner.deleteOne({ _id: existingBanner._id });
    }

    // Create new banner
    const banner = await PlanBanner.create(body);

    return NextResponse.json({
      success: true,
      banner,
      message: existingBanner ? 'Previous banner deleted and new one created' : 'Banner created',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create plan banner' },
      { status: 500 }
    );
  }
}

// Update plan banner (protected)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await PlanBanner.findByIdAndUpdate(id, updateData, { new: true });

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update plan banner' },
      { status: 500 }
    );
  }
}

// Delete plan banner (protected)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await PlanBanner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete plan banner' },
      { status: 500 }
    );
  }
}

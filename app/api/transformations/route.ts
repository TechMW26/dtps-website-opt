import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Transformation from '@/models/Transformation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PAGE_VALUES = ['weight-loss', 'pcod', 'therapeutic', 'wedding'] as const;
type PageValue = (typeof PAGE_VALUES)[number];

function normalizeTargetPages(input: unknown): Array<'all' | PageValue> {
  if (!Array.isArray(input) || input.length === 0) {
    return [];
  }

  const sanitized = input
    .map((v) => String(v).trim())
    .filter((v): v is 'all' | PageValue => v === 'all' || PAGE_VALUES.includes(v as PageValue));

  if (sanitized.includes('all')) {
    return ['all'];
  }

  return Array.from(new Set(sanitized));
}

function normalizeTransformationPayload(raw: Record<string, any>) {
  const payload = { ...raw };

  if (!payload.clientName) payload.clientName = payload.title || 'Transformation';
  if (!payload.weightLost) payload.weightLost = payload.metrics || '0';
  if (!payload.daysToAchieve) payload.daysToAchieve = payload.duration || '0';
  if (payload.featured === undefined) payload.featured = false;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;
  if (!payload.beforeImage) payload.beforeImage = '';
  if (!payload.afterImage) payload.afterImage = '';
  if (!payload.testimonial) payload.testimonial = '';
  if (!payload.setName) payload.setName = '';

  const normalizedTargets = normalizeTargetPages(payload.targetPages);
  if (normalizedTargets.length > 0) {
    payload.targetPages = normalizedTargets;
    payload.page = normalizedTargets.includes('all') ? 'weight-loss' : normalizedTargets[0];
  } else {
    const fallbackPage = PAGE_VALUES.includes(payload.page) ? payload.page : 'weight-loss';
    payload.page = fallbackPage;
    payload.targetPages = [fallbackPage];
  }

  return payload;
}

// Get all transformations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const featured = searchParams.get('featured');
    const isActive = searchParams.get('active');
    const includeGlobal = searchParams.get('includeGlobal') !== 'false';

    const query: any = {};

    if (page && PAGE_VALUES.includes(page as PageValue)) {
      const pageQuery = [
        { targetPages: page },
        { page },
      ];

      if (includeGlobal) {
        pageQuery.push({ targetPages: 'all' });
      }

      query.$or = pageQuery;
    }

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
    const incomingItems: unknown[] = Array.isArray(body?.items) ? body.items : [body];
    const items = incomingItems
      .filter((item: unknown): item is Record<string, any> => Boolean(item) && typeof item === 'object')
      .map((item) => normalizeTransformationPayload(item));

    if (items.length === 0) {
      return NextResponse.json({ error: 'No valid transformation payload provided' }, { status: 400 });
    }

    const created = await Transformation.insertMany(items);
    const transformation = created[0];

    return NextResponse.json({
      success: true,
      count: created.length,
      transformations: created,
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
  const normalizedUpdate = normalizeTransformationPayload(updateData);

  const transformation = await Transformation.findByIdAndUpdate(id, normalizedUpdate, { new: true });

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

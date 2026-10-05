import { createContent, updateContent, deleteContent, getContent } from '@/lib/website-content';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all recognitions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const recognitions = (await getWebsiteFirestore().collection('websiteRecognitions').get()).docs
      .map((doc) => serializeFirestoreDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((item: any) => isActive !== 'true' || item.isActive === true)
      .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0) || String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

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


  const body = await request.json();
  const payload = { ...body };

  if (!payload.title) payload.title = 'Recognition Image';
  if (!payload.description) payload.description = 'Recognition image';
  if (!payload.year) payload.year = `${new Date().getFullYear()}`;
  if (payload.isActive === undefined) payload.isActive = true;
  if (payload.order === undefined || payload.order === null) payload.order = 0;

  const recognition = await createContent('websiteRecognitions', payload);

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


    const body = await request.json();
    const { id, ...updateData } = body;

    const recognition = await updateContent('websiteRecognitions', id, updateData);

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


    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const recognition = await deleteContent('websiteRecognitions', id);

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

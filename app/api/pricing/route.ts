import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const collection = 'websitePricing';

async function listPricing() {
  const snapshot = await getWebsiteFirestore().collection(collection).get();
  return snapshot.docs
    .map((doc) => serializeFirestoreDocument(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0) || Number(a.price ?? 0) - Number(b.price ?? 0));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const category = searchParams.get('category');
    const isActive = searchParams.get('active');
    const pricing = (await listPricing()).filter((plan) =>
      (!page || plan.page === page) &&
      (!category || plan.category === category) &&
      (isActive !== 'true' || plan.isActive === true),
    );
    return NextResponse.json({ success: true, pricing }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch pricing' }, { status: 503 });
  }
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Response('Unauthorized', { status: 401 });
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();
    if (!body?.planName || !body?.duration || !body?.page || !body?.category) {
      return NextResponse.json({ error: 'planName, duration, page and category are required' }, { status: 400 });
    }
    const ref = getWebsiteFirestore().collection(collection).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({ ...body, createdAt: now, updatedAt: now });
    return NextResponse.json({ success: true, pricing: serializeFirestoreDocument(ref.id, { ...body }) }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create pricing' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireSession();
    const body = await request.json();
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Pricing id is required' }, { status: 400 });
    const ref = getWebsiteFirestore().collection(collection).doc(id);
    const current = await ref.get();
    if (!current.exists) return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    const { id: _id, ...updateData } = body;
    await ref.update({ ...updateData, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, pricing: serializeFirestoreDocument(id, { ...current.data(), ...updateData } as Record<string, unknown>) });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update pricing' }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireSession();
    const id = new URL(request.url).searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'Pricing id is required' }, { status: 400 });
    const ref = getWebsiteFirestore().collection(collection).doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ success: true, message: 'Pricing deleted successfully' });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete pricing' }, { status: 503 });
  }
}

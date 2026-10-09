import { FieldValue } from '@/lib/mongo-website-types.mjs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
const collection = 'websiteBlogs';

function normalizeBlogPayload(body: Record<string, any>) {
  const payload = { ...body };
  payload.title ||= `Image ${Date.now()}`;
  payload.content ||= 'Image content';
  payload.excerpt ||= payload.description || '';
  payload.featuredImage ||= payload.image || '';
  if (payload.published === undefined && payload.isPublished !== undefined) payload.published = payload.isPublished;
  payload.author ||= 'Priya Sharma';
  payload.category ||= 'Health & Nutrition';
  payload.readTime ||= '1 min read';
  payload.slug ||= String(payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  payload.tags = Array.isArray(payload.tags) ? payload.tags : [];
  payload.published = Boolean(payload.published);
  payload.featured = Boolean(payload.featured);
  payload.views = Number(payload.views || 0);
  return payload;
}

function serializeBlog(id: string, data: Record<string, unknown>) {
  return serializeDatabaseDocument(id, data);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const limit = Number(searchParams.get('limit') || 0);
    const db = getWebsiteDatabase();
    if (slug) {
      const snapshot = await db.collection(collection).where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      const doc = snapshot.docs[0];
      if (!doc.data().published && !(await getServerSession(authOptions))) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      await doc.ref.update({ views: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ success: true, blog: serializeBlog(doc.id, { ...doc.data(), views: Number(doc.data().views || 0) + 1 }) });
    }
    const admin = published === 'true' ? false : Boolean(await getServerSession(authOptions));
    const snapshot = await db.collection(collection).get();
    const blogs = snapshot.docs
      .map((doc) => serializeBlog(doc.id, doc.data() as Record<string, unknown>))
      .filter((blog: any) => ((admin && published !== 'true') || blog.published === true) && (featured !== 'true' || blog.featured === true) && (!category || blog.category === category))
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, limit > 0 ? limit : undefined);
    return NextResponse.json({ success: true, blogs }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch blogs' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await getServerSession(authOptions))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = normalizeBlogPayload(await request.json());
    const ref = getWebsiteDatabase().collection(collection).doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({ ...payload, createdAt: now, updatedAt: now });
    return NextResponse.json({ success: true, blog: serializeBlog(ref.id, payload) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create blog' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await getServerSession(authOptions))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ error: 'Blog id is required' }, { status: 400 });
    const ref = getWebsiteDatabase().collection(collection).doc(id);
    const existing = await ref.get();
    if (!existing.exists) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    const updateData = normalizeBlogPayload({ ...existing.data(), ...body });
    await ref.update({ ...updateData, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return NextResponse.json({ success: true, blog: serializeBlog(ref.id, updated.data() as Record<string, unknown>) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update blog' }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await getServerSession(authOptions))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Blog id is required' }, { status: 400 });
    const ref = getWebsiteDatabase().collection(collection).doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete blog' }, { status: 503 });
  }
}

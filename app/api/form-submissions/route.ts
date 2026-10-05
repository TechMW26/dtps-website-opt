import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWebsiteFirestore, serializeFirestoreDocument } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
const REQUIRED_FIELDS = ['name', 'city', 'contactNumber', 'email', 'age', 'gender', 'height', 'weight', 'primaryGoal', 'medicalConditions', 'triedMethods', 'dailyRoutine', 'preferredDate', 'preferredCallTime'] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const CALL_TIME_OPTIONS = new Set(['09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM', '03:00 PM - 06:00 PM', '06:00 PM - 09:00 PM']);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); const errors: Record<string, string> = {};
    for (const field of REQUIRED_FIELDS) if (!body?.[field] || String(body[field]).trim() === '') errors[field] = 'This field is required';
    if (body?.email && !EMAIL_RE.test(String(body.email).trim())) errors.email = 'Please enter a valid email';
    const digits = String(body?.contactNumber || '').replace(/\D/g, ''); if (body?.contactNumber && (digits.length < 7 || digits.length > 15)) errors.contactNumber = 'Please enter a valid contact number';
    if (body?.preferredDate && (!DATE_KEY_RE.test(String(body.preferredDate).trim()) || Number.isNaN(new Date(body.preferredDate).getTime()))) errors.preferredDate = 'Please select a valid date';
    if (body?.preferredCallTime && !CALL_TIME_OPTIONS.has(String(body.preferredCallTime).trim())) errors.preferredCallTime = 'Please select a valid time slot';
    if (Object.keys(errors).length) return NextResponse.json({ success: false, errors }, { status: 400 });
    const formId = String(body.formId || '1').trim(); const ref = getWebsiteFirestore().collection('websiteFormSubmissions').doc();
    await ref.set({ formId, name: String(body.name).trim(), city: String(body.city).trim(), contactNumber: String(body.contactNumber).trim(), email: String(body.email).trim().toLowerCase(), age: String(body.age).trim(), gender: String(body.gender).trim(), height: String(body.height).trim(), weight: String(body.weight).trim(), primaryGoal: String(body.primaryGoal).trim(), medicalConditions: String(body.medicalConditions).trim(), triedMethods: String(body.triedMethods).trim(), dailyRoutine: String(body.dailyRoutine).trim(), preferredDate: String(body.preferredDate).trim(), preferredCallTime: String(body.preferredCallTime).trim(), page: `weight-loss/Leadform/${formId}`, source: 'lead-form', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) { console.error('[form-submissions] POST error:', err); return NextResponse.json({ success: false, message: 'Failed to submit form' }, { status: 503 }); }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url); const formId = searchParams.get('formId'); const distinct = searchParams.get('distinct') === 'forms'; const session = await getServerSession(authOptions);
    if (!session && (!formId || distinct)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const docs = (await getWebsiteFirestore().collection('websiteFormSubmissions').get()).docs.map((doc) => serializeFirestoreDocument(doc.id, doc.data() as Record<string, unknown>));
    if (distinct) { const grouped = new Map<string, { count: number; lastSubmittedAt?: string }>(); for (const item of docs as any[]) { const current = grouped.get(item.formId) || { count: 0 }; current.count++; if (!current.lastSubmittedAt || String(item.createdAt || '') > current.lastSubmittedAt) current.lastSubmittedAt = item.createdAt; grouped.set(item.formId, current); } return NextResponse.json({ success: true, forms: [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, value]) => ({ formId: id, ...value })) }); }
    return NextResponse.json({ success: true, submissions: (formId ? docs.filter((item: any) => item.formId === formId) : docs).sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))) });
  } catch (err) { console.error('[form-submissions] GET error:', err); return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 503 }); }
}

export async function DELETE(request: NextRequest) {
  try { if (!(await getServerSession(authOptions))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const id = new URL(request.url).searchParams.get('id'); if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 }); const ref = getWebsiteFirestore().collection('websiteFormSubmissions').doc(id); if (!(await ref.get()).exists) return NextResponse.json({ error: 'Submission not found' }, { status: 404 }); await ref.delete(); return NextResponse.json({ success: true }); }
  catch (err) { console.error('[form-submissions] DELETE error:', err); return NextResponse.json({ error: 'Failed to delete submission' }, { status: 503 }); }
}

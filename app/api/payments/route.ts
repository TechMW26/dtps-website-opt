import {requireWebsiteAdmin,WebsiteAdminError} from '@/lib/website-admin-repository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';
import { buildIndiaCreatedAtRange } from '@/lib/admin-date-range';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireWebsiteAdmin(await getServerSession(authOptions) as any);
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const id = searchParams.get('id');
    const range = buildIndiaCreatedAtRange(searchParams.get('from'), searchParams.get('to')) as { $gte?: Date; $lte?: Date } | null;
    const collection = getWebsiteDatabase().collection('websitePayments');
    let documents;
    if (id) {
      const direct = await collection.doc(id).get();
      documents = direct.exists ? [direct] : (await collection.where('razorpayPaymentId', '==', id).get()).docs;
    } else {
      documents = (await (orderId ? collection.where('orderId', '==', orderId) : collection).get()).docs;
    }
    const payments = documents
      .map((doc) => serializeDatabaseDocument(doc.id, doc.data() as Record<string, unknown>))
      .filter((payment: any) => {
        if (id && payment._id !== id && payment.razorpayPaymentId !== id) return false;
        if (orderId && payment.orderId !== orderId) return false;
        if (!range || !payment.createdAt) return true;
        const created = new Date(String(payment.createdAt));
        return (!range.$gte || created >= range.$gte) && (!range.$lte || created <= range.$lte);
      })
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    if (orderId || id) return NextResponse.json({ success: true, payment: payments[0] || null });
    return NextResponse.json({ success: true, payments, total: payments.length, totalAmount: payments.reduce((sum: number, payment: any) => sum + Number(payment.amount || 0), 0) });
  } catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status});
    console.error('Error fetching payments:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 503 });
  }
}

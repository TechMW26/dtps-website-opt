import {requireWebsiteAdmin,WebsiteAdminError} from '@/lib/website-admin-repository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { resolveCheckoutProducts } from '@/lib/checkout-catalog';
import { FieldValue } from '@/lib/mongo-website-types.mjs';
import { NextRequest, NextResponse } from 'next/server';
import { paymentMatchesOrder } from '@/lib/payment-verification';
import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import { buildIndiaCreatedAtRange } from '@/lib/admin-date-range';
import { calculateSubtotal, validateCouponForProducts } from '@/lib/coupons';
import { getWebsiteDatabase, serializeDatabaseDocument } from '@/lib/website-database';
import { sendPostPaymentNotifications } from '@/lib/notifications';
import { sendCapiEvent, deriveFbcFromUrl, getClientIp } from '@/lib/meta-capi';

export const dynamic = 'force-dynamic';
let razorpay: Razorpay | null = null;
type OrderResolutionStatus = 'cancelled' | 'failed';
function getRazorpayInstance() {
  if (!razorpay) razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID || '', key_secret: process.env.RAZORPAY_KEY_SECRET || '' });
  return razorpay;
}
async function parseRequestBody(req: NextRequest) { const rawBody = await req.text(); return rawBody ? JSON.parse(rawBody) : {}; }
function serializeOrder(id: string, data: Record<string, unknown> | undefined) { return data ? serializeDatabaseDocument(id, data) : null; }
async function findOrder(orderId: string) {
  const ref = getWebsiteDatabase().collection('websiteOrders').doc(orderId);
  const direct = await ref.get();
  if (direct.exists) return { ref, data: direct.data() as Record<string, any> };
  const snapshot = await getWebsiteDatabase().collection('websiteOrders').where('orderId', '==', orderId).limit(1).get();
  if (snapshot.empty) return null;
  return { ref: snapshot.docs[0].ref, data: snapshot.docs[0].data() as Record<string, any> };
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await parseRequestBody(req);
    const db = getWebsiteDatabase();
    if (action === 'create') {
      let products;
      try { products = await resolveCheckoutProducts(data.products); }
      catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status}); return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 }); }
      if (!products.length) return NextResponse.json({ success: false, message: 'At least one product is required.' }, { status: 400 });
      const subtotal = calculateSubtotal(products); let discount = 0; let total = subtotal; let appliedCoupon: any = null;
      if (data.couponCode) {
        const couponResult = await validateCouponForProducts(data.couponCode, products);
        if (!couponResult.valid) return NextResponse.json({ success: false, message: couponResult.message, coupon: couponResult }, { status: 400 });
        discount = couponResult.discount; total = couponResult.total;
        appliedCoupon = couponResult.coupon ? { ...couponResult.coupon, discountAmount: couponResult.discount } : null;
      }
      if (typeof data.customerName !== 'string' || !data.customerName.trim() || typeof data.customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail) || typeof data.customerPhone !== 'string' || !data.customerPhone.trim() || !Number.isFinite(total) || total <= 0) return NextResponse.json({ success: false, message: 'Valid customer details and a payable plan are required.' }, { status: 400 });
      const orderId = uuidv4();
      const razorpayOrder = await getRazorpayInstance().orders.create({ amount: Math.round(total * 100), currency: 'INR', receipt: orderId, notes: { customerName: data.customerName, customerEmail: data.customerEmail, couponCode: appliedCoupon?.code || '' } });
      const order = { orderId, customerName: data.customerName, customerEmail: data.customerEmail, customerPhone: data.customerPhone, address: data.address || '', city: data.city || '', products, subtotal, discount, total, coupon: appliedCoupon, paymentStatus: 'pending', paymentMethod: 'razorpay', razorpayOrderId: razorpayOrder.id, source: 'website-checkout', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() };
      await db.collection('websiteOrders').doc(orderId).set(order);
      return NextResponse.json({ success: true, order: serializeOrder(orderId, { ...order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }), razorpayOrderId: razorpayOrder.id, razorpayAmount: razorpayOrder.amount, razorpayKey: process.env.RAZORPAY_KEY_ID });
    }
    if (action === 'verify') {
      const { razorpayPaymentId, razorpayOrderId, orderId } = data;
      const found = await findOrder(orderId);
      if (!found) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      const payment = await getRazorpayInstance().payments.fetch(razorpayPaymentId);
      if (!paymentMatchesOrder(payment, found.data as { razorpayOrderId?: string; total: number }, razorpayOrderId)) return NextResponse.json({ success: false, message: 'Payment does not match this order' }, { status: 400 });
      const captured = payment.status === 'captured';
      const paymentRef = db.collection('websitePayments').doc(razorpayPaymentId);
      const transitioned = await db.runTransaction(async (transaction) => {
        const current = await transaction.get(found.ref);
        const oldPayment = await transaction.get(paymentRef);
        if (!current.exists) throw new Error('Order no longer exists');
        const order = current.data()!;
        if (!paymentMatchesOrder(payment, order as { razorpayOrderId?: string; total: number }, razorpayOrderId)) throw new Error('Order changed during payment verification');
        if (oldPayment.exists && (oldPayment.data()?.orderId !== orderId || oldPayment.data()?.razorpayOrderId !== razorpayOrderId)) throw new Error('Payment is already linked to a different order');
        const couponSnapshot = captured && order.paymentStatus !== 'completed' && order.coupon?.code
          ? await transaction.get(db.collection('websiteCoupons').where('code', '==', order.coupon.code).limit(1)) : null;
        if (oldPayment.data()?.status === 'completed' && !captured) return false;
        transaction.set(paymentRef, {
          orderId, razorpayPaymentId, razorpayOrderId,
          amount: Number(payment.amount) / 100, currency: payment.currency || 'INR',
          status: captured ? 'completed' : payment.status === 'failed' ? 'failed' : 'pending',
          paymentMethod: payment.method || 'razorpay',
          customerName: order.customerName || '', customerEmail: order.customerEmail || '', customerPhone: order.customerPhone || '',
          responseData: payment, source: oldPayment.data()?.source || 'website-checkout',
          createdAt: oldPayment.data()?.createdAt || new Date(Number(payment.created_at) * 1000), updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        if (order.paymentStatus === 'completed') return false;
        if (captured) {
          transaction.update(found.ref, { paymentStatus: 'completed', razorpayPaymentId, razorpayOrderId, updatedAt: FieldValue.serverTimestamp() });
          if (couponSnapshot && !couponSnapshot.empty) transaction.update(couponSnapshot.docs[0].ref, { usedCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
          return true;
        }
        if (payment.status === 'failed') transaction.update(found.ref, { paymentStatus: 'failed', updatedAt: FieldValue.serverTimestamp() });
        return false;
      });
      if (!captured) return NextResponse.json({ success: false, message: payment.status === 'authorized' ? 'Payment is awaiting capture. Please check again shortly.' : 'Payment has not completed.' }, { status: 409 });
      const refreshed = await found.ref.get(); const refreshedOrder: any = refreshed.data();
      if (transitioned && refreshedOrder) {
        const createdAt = refreshedOrder.createdAt instanceof Date
          ? refreshedOrder.createdAt : refreshedOrder.createdAt?.toDate?.() || new Date();
        void sendPostPaymentNotifications({ orderId: refreshedOrder.orderId, customerName: refreshedOrder.customerName, customerEmail: refreshedOrder.customerEmail, customerPhone: refreshedOrder.customerPhone, total: refreshedOrder.total, createdAt, products: (refreshedOrder.products || []).map((product: any) => ({ name: product.name, duration: product.duration, quantity: Number(product.quantity || 1), price: Number(product.price || 0) })) }).catch((error) => console.error('Post-payment notification error:', error));
        const products = (refreshedOrder.products || []) as Array<{ id?: string; name?: string; price?: number; quantity?: number }>;
        void sendCapiEvent({ eventName: 'Purchase', eventId: refreshedOrder.orderId, eventSourceUrl: req.headers.get('referer') || undefined, actionSource: 'website', userData: { email: refreshedOrder.customerEmail || null, phone: refreshedOrder.customerPhone || null, firstName: (refreshedOrder.customerName || '').split(' ')[0] || null, lastName: (refreshedOrder.customerName || '').split(' ').slice(1).join(' ') || null, externalId: refreshedOrder.orderId, clientIpAddress: getClientIp(req.headers), clientUserAgent: req.headers.get('user-agent'), fbp: req.cookies.get('_fbp')?.value || null, fbc: deriveFbcFromUrl(req.headers.get('referer'), req.cookies.get('_fbc')?.value || null) }, customData: { value: Number(refreshedOrder.total || 0), currency: 'INR', num_items: products.reduce((sum, product) => sum + Number(product.quantity || 1), 0) } }).catch((error) => console.error('CAPI Purchase send error:', error));
      }
      return NextResponse.json({ success: true, message: 'Payment verified successfully', order: orderId });
    }
    if (action === 'resolve') {
      const { orderId, status, razorpayPaymentId, razorpayOrderId, paymentMethod, responseData } = data;
      if (!orderId || !['cancelled', 'failed'].includes(status)) return NextResponse.json({ success: false, message: 'orderId and a valid status are required' }, { status: 400 });
      const found = await findOrder(orderId); if (!found) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      // Browser cancellation/failure reports must never overwrite a captured payment
      // or provider identifiers. Only verified provider data creates payment records.
      await db.runTransaction(async (transaction) => {
        const current = await transaction.get(found.ref);
        const existingStatus = current.data()?.paymentStatus;
        if (!current.exists || existingStatus === 'completed' || (existingStatus === 'failed' && status === 'cancelled')) return;
        transaction.update(found.ref, { paymentStatus: status as OrderResolutionStatus, updatedAt: FieldValue.serverTimestamp() });
      });
      const updated = await found.ref.get(); return NextResponse.json({ success: true, message: `Order marked as ${status}`, order: serializeOrder(found.ref.id, updated.data() as Record<string, unknown>) });
    }
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status}); console.error('Error in orders API:', error); return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 }); }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); const orderId = searchParams.get('orderId');
    if (orderId) { const found = await findOrder(orderId); return NextResponse.json({ success: true, order: found ? serializeOrder(found.ref.id, found.data) : null }); }
    await requireWebsiteAdmin(await getServerSession(authOptions) as any);
    const range = buildIndiaCreatedAtRange(searchParams.get('from'), searchParams.get('to')) as { $gte?: Date; $lte?: Date } | null;
    const orders = (await getWebsiteDatabase().collection('websiteOrders').get()).docs.map((doc) => serializeOrder(doc.id, doc.data() as Record<string, unknown>)!).filter((order: any) => { if (!range || !order.createdAt) return true; const created = new Date(String(order.createdAt)); return (!range.$gte || created >= range.$gte) && (!range.$lte || created <= range.$lte); }).sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return NextResponse.json({ success: true, orders });
  } catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status}); console.error('Error fetching orders:', error); return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 503 }); }
}

export async function PATCH(req: NextRequest) {
  try {
    const actor=await requireWebsiteAdmin(await getServerSession(authOptions) as any); if(!['admin','superadmin'].includes(actor.role))throw new WebsiteAdminError('Forbidden',403);
    const { action, orderIds } = await req.json();
    if (action !== 'bulkDelete' || !Array.isArray(orderIds) || !orderIds.length) return NextResponse.json({ success: false, message: 'orderIds array is required' }, { status: 400 });
    const db = getWebsiteDatabase(); const snapshot = await db.collection('websiteOrders').get(); const batch = db.bulkWriter(); let deleted = 0;
    for (const doc of snapshot.docs) if (orderIds.includes(doc.data().orderId)) { batch.delete(doc.ref); deleted++; }
    const payments = await db.collection('websitePayments').get(); for (const doc of payments.docs) if (orderIds.includes(doc.data().orderId)) batch.delete(doc.ref);
    await batch.close(); return NextResponse.json({ success: true, message: `Deleted ${deleted} order(s)` });
  } catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status}); console.error('Error in bulk operation:', error); return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 503 }); }
}

export async function DELETE(req: NextRequest) {
  try { const actor=await requireWebsiteAdmin(await getServerSession(authOptions) as any); if(!['admin','superadmin'].includes(actor.role))throw new WebsiteAdminError('Forbidden',403); const { orderId } = await req.json(); if (!orderId) return NextResponse.json({ success: false, message: 'Order ID is required' }, { status: 400 }); const found = await findOrder(orderId); if (found) await found.ref.delete(); const payments = await getWebsiteDatabase().collection('websitePayments').where('orderId', '==', orderId).get(); await Promise.all(payments.docs.map((doc) => doc.ref.delete())); return NextResponse.json({ success: true, message: 'Order deleted successfully' }); }
  catch (error) { if(error instanceof WebsiteAdminError)return NextResponse.json({error:error.message},{status:error.status}); console.error('Error deleting order:', error); return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 503 }); }
}

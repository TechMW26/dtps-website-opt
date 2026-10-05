import { readFile, readdir } from 'node:fs/promises';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

const recoveryDir = '.recovery/transactions';
const state = JSON.parse(await readFile(`${recoveryDir}/state.json`, 'utf8'));
if (!state.complete || state.paymentsComplete !== true) {
  throw new Error(`Razorpay recovery is not complete (orders=${state.complete === true}, payments=${state.paymentsComplete === true}). Wait for the read-only scan before importing.`);
}
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_NATIVE_DATABASE_ID || '(default)';
if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase Admin configuration is required. Load .env.local or provide FIREBASE_* variables.');
const app = getApps()[0] || initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);

function dateValue(seconds) {
  return Number.isFinite(Number(seconds)) ? Timestamp.fromMillis(Number(seconds) * 1000) : FieldValue.serverTimestamp();
}
function paymentStatus(status) {
  return status === 'captured' ? 'completed' : status === 'failed' ? 'failed' : 'pending';
}
const files = (await readdir(recoveryDir)).filter((name) => /^order_.*\.json$/.test(name));
let orders = 0;
let payments = 0;
for (let offset = 0; offset < files.length; offset += 400) {
  const writer = db.bulkWriter();
  const writes = [];
  const createMissing = (ref, data) => { writes.push(writer.create(ref, data).catch((error) => { if (error.code !== 6) throw error; })); };
  for (const filename of files.slice(offset, offset + 400)) {
    const record = JSON.parse(await readFile(`${recoveryDir}/${filename}`, 'utf8'));
    const providerOrder = record.order;
    const orderId = String(providerOrder.receipt || providerOrder.id);
    const orderRef = db.collection('websiteOrders').doc(`recovered-${providerOrder.id}`);
    createMissing(orderRef, {
      orderId,
      providerOrderId: providerOrder.id,
      razorpayOrderId: providerOrder.id,
      source: 'razorpay-recovery',
      customerName: providerOrder.notes?.customerName || '',
      customerEmail: providerOrder.notes?.customerEmail || '',
      customerPhone: providerOrder.notes?.customerPhone || '',
      products: [],
      subtotal: null,
      discount: null,
      total: Number(providerOrder.amount || 0) / 100,
      amountPaise: Number(providerOrder.amount || 0),
      currency: providerOrder.currency || 'INR',
      paymentStatus: providerOrder.status === 'paid' ? 'completed' : 'pending',
      paymentMethod: 'razorpay',
      missingWebsiteFields: record.missingWebsiteFields || [],
      providerOrder,
      createdAt: dateValue(providerOrder.created_at),
      updatedAt: FieldValue.serverTimestamp(),
    });
    orders++;
    for (const payment of record.payments || []) {
      const paymentRef = db.collection('websitePayments').doc(payment.id);
      createMissing(paymentRef, {
        orderId,
        razorpayPaymentId: payment.id,
        razorpayOrderId: providerOrder.id,
        amount: Number(payment.amount || 0) / 100,
        amountPaise: Number(payment.amount || 0),
        currency: payment.currency || 'INR',
        status: paymentStatus(payment.status),
        paymentMethod: payment.method || 'razorpay',
        customerName: providerOrder.notes?.customerName || '',
        customerEmail: providerOrder.notes?.customerEmail || '',
        customerPhone: providerOrder.notes?.customerPhone || '',
        source: 'razorpay-recovery',
        responseData: payment,
        createdAt: dateValue(payment.created_at || providerOrder.created_at),
        updatedAt: FieldValue.serverTimestamp(),
      });
      payments++;
    }
  }
  await writer.close();
  await Promise.all(writes);
}
console.log(`Imported ${orders} recovered website orders and ${payments} recovered payments into Firebase.`);

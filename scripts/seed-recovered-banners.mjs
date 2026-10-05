import { readFile } from 'node:fs/promises';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_NATIVE_DATABASE_ID || '(default)';
if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase Admin configuration is required. Load .env.local or provide FIREBASE_* variables.');
const app = getApps()[0] || initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) });
const db = databaseId === '(default)' ? getFirestore(app) : getFirestore(app, databaseId);
const plans = JSON.parse(await readFile(new URL('../data/recovery/banner-seed.json', import.meta.url), 'utf8'));
const seedVersion = 'recovered-page-banners-2026-10-05';
let created = 0;
for (const plan of plans) {
  const ref = db.collection('websiteSiteBanners').doc(plan.id);
  try {
    await ref.create({ ...plan, seedVersion, updatedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp() });
    created++;
  } catch (error) { if (error.code !== 6) throw error; }
}
console.log(`Created ${created}; preserved existing of ${plans.length} website banner documents (version ${seedVersion}).`);

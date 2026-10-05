import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const APP_NAME = 'dtps-website-firestore';

function settings() {
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator) {
    if (!/^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(emulator)) {
      throw new Error('FIRESTORE_EMULATOR_HOST must point to localhost');
    }
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID || 'demo-dtps-website',
      databaseId: process.env.FIREBASE_DATABASE_ID || '(default)',
      emulator,
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY)?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin configuration is required (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
  }
  return {
    projectId,
    clientEmail,
    privateKey,
    databaseId: process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_NATIVE_DATABASE_ID || '(default)',
  };
}

export function getWebsiteFirestore(): Firestore {
  const config = settings();
  const existing = getApps().find((app) => app.name === APP_NAME);
  const app = existing || initializeApp({
    projectId: config.projectId,
    ...(config.emulator ? {} : { credential: cert({ projectId: config.projectId, clientEmail: config.clientEmail!, privateKey: config.privateKey! }) }),
  }, APP_NAME);
  const db = getFirestore(app, config.databaseId);
  const cache = globalThis as typeof globalThis & { websiteConfiguredDatabases?: WeakSet<Firestore> };
  cache.websiteConfiguredDatabases ||= new WeakSet();
  if (!cache.websiteConfiguredDatabases.has(db)) {
    db.settings({ ignoreUndefinedProperties: true });
    cache.websiteConfiguredDatabases.add(db);
  }
  return db;
}

export function serializeFirestoreValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serializeFirestoreValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, serializeFirestoreValue(child)]));
  }
  return value;
}

export function serializeFirestoreDocument<T extends Record<string, unknown>>(id: string, value: T) {
  return { ...serializeFirestoreValue(value) as T, _id: id };
}

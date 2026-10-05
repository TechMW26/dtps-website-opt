import 'server-only';
import { getWebsiteFirestore, serializeFirestoreDocument } from './firebase-admin';

// Native Firestore operations shared by the small, independently editable CMS collections.
export function contentId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.includes('/') || value.length > 1500 || value === '.' || value === '..') {
    throw new Error('A valid content ID is required');
  }
  return value;
}

export function cleanContent(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).filter(([key, value]) =>
    value !== undefined && !['_id', 'id', 'createdAt', 'updatedAt'].includes(key)));
}

export async function getContent(collection: string, id: unknown) {
  const doc = await getWebsiteFirestore().collection(collection).doc(contentId(id)).get();
  return doc.exists ? serializeFirestoreDocument(doc.id, doc.data()!) : null;
}

export async function createContent(collection: string, data: Record<string, unknown>) {
  const ref = getWebsiteFirestore().collection(collection).doc();
  const value = { ...cleanContent(data), createdAt: new Date(), updatedAt: new Date() };
  await ref.create(value);
  return serializeFirestoreDocument(ref.id, value);
}

export async function updateContent(collection: string, id: unknown, data: Record<string, unknown>) {
  const db = getWebsiteFirestore();
  const ref = db.collection(collection).doc(contentId(id));
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    if (!old.exists) return null;
    const changes = { ...cleanContent(data), updatedAt: new Date() };
    tx.update(ref, changes);
    return serializeFirestoreDocument(ref.id, { ...old.data(), ...changes });
  });
}

export async function deleteContent(collection: string, id: unknown) {
  const db = getWebsiteFirestore();
  const ref = db.collection(collection).doc(contentId(id));
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    if (!old.exists) return null;
    tx.delete(ref);
    return serializeFirestoreDocument(ref.id, old.data()!);
  });
}

export async function saveSettings(collection: string, data: object) {
  const db = getWebsiteFirestore();
  const ref = db.collection(collection).doc('global');
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    const value = { ...cleanContent(data as Record<string, unknown>), key: 'global', createdAt: old.data()?.createdAt || new Date(), updatedAt: new Date() };
    tx.set(ref, value, { merge: true });
    return serializeFirestoreDocument(ref.id, { ...old.data(), ...value });
  });
}

// A transaction protects the one-active-hero-per-page invariant during concurrent edits.
export async function saveSiteBanner(id: string | null, data: Record<string, unknown>) {
  const db = getWebsiteFirestore();
  const collection = db.collection('websiteSiteBanners');
  const ref = id ? collection.doc(contentId(id)) : collection.doc();
  return db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (id && !existing.exists) return null;
    const value: Record<string, any> = { ...existing.data(), ...cleanContent(data), updatedAt: new Date(), createdAt: existing.data()?.createdAt || new Date() };
    if (value.type === 'hero-banner' && value.isActive === true) {
      const others = await tx.get(collection.where('page', '==', value.page));
      for (const doc of others.docs) {
        if (doc.id !== ref.id && doc.data().type === 'hero-banner' && doc.data().isActive) tx.update(doc.ref, { isActive: false, updatedAt: new Date() });
      }
    }
    tx.set(ref, value);
    return serializeFirestoreDocument(ref.id, value);
  });
}

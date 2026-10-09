import 'server-only';
import { getWebsiteDatabase, serializeDatabaseDocument } from './website-database';

// Database operations shared by the independently editable CMS namespaces.
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
  const doc = await getWebsiteDatabase().collection(collection).doc(contentId(id)).get();
  return doc.exists ? serializeDatabaseDocument(doc.id, doc.data()!) : null;
}

export async function createContent(collection: string, data: Record<string, unknown>) {
  const ref = getWebsiteDatabase().collection(collection).doc();
  const value = { ...cleanContent(data), createdAt: new Date(), updatedAt: new Date() };
  await ref.create(value);
  return serializeDatabaseDocument(ref.id, value);
}

export async function updateContent(collection: string, id: unknown, data: Record<string, unknown>) {
  const db = getWebsiteDatabase();
  const ref = db.collection(collection).doc(contentId(id));
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    if (!old.exists) return null;
    const changes = { ...cleanContent(data), updatedAt: new Date() };
    tx.update(ref, changes);
    return serializeDatabaseDocument(ref.id, { ...old.data(), ...changes });
  });
}

export async function deleteContent(collection: string, id: unknown) {
  const db = getWebsiteDatabase();
  const ref = db.collection(collection).doc(contentId(id));
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    if (!old.exists) return null;
    tx.delete(ref);
    return serializeDatabaseDocument(ref.id, old.data()!);
  });
}

export async function saveSettings(collection: string, data: object) {
  const db = getWebsiteDatabase();
  const ref = db.collection(collection).doc('global');
  return db.runTransaction(async (tx) => {
    const old = await tx.get(ref);
    const value = { ...cleanContent(data as Record<string, unknown>), key: 'global', createdAt: old.data()?.createdAt || new Date(), updatedAt: new Date() };
    tx.set(ref, value, { merge: true });
    return serializeDatabaseDocument(ref.id, { ...old.data(), ...value });
  });
}

// A transaction protects the one-active-hero-per-page invariant during concurrent edits.
export async function saveSiteBanner(id: string | null, data: Record<string, unknown>) {
  const db = getWebsiteDatabase();
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
    return serializeDatabaseDocument(ref.id, value);
  });
}

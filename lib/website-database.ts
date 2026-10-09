import 'server-only';

import { getWebsiteMongoStore } from './mongo-website-store';

// MongoDB is the sole website database. Media remains in Vercel Blob.
export const getWebsiteDatabase = getWebsiteMongoStore;

export function serializeDatabaseValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serializeDatabaseValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, serializeDatabaseValue(child)]));
  }
  return value;
}

export function serializeDatabaseDocument<T extends Record<string, unknown>>(id: string, value: T) {
  return { ...serializeDatabaseValue(value) as T, _id: id };
}

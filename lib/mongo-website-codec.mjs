import { createHash } from 'node:crypto';
import { Timestamp, GeoPoint, FieldValue, VectorValue } from './mongo-website-types.mjs';
import { Long } from 'mongodb';

const cms = new Set(['websiteBlogs', 'websitePageHeroes', 'websitePlanBanners', 'websiteSiteBanners', 'websitePopups', 'websiteMarquee', 'websitePlan299Settings', 'websiteRecognitions', 'websiteTestimonials', 'websiteSuccessStories', 'websiteTransformations']);
export function isWebsiteNamespace(name) { return /^website[A-Z]/.test(name) || name === '_websiteAdminState'; }
export function mongoCollectionName(namespace) {
  const root = namespace.split('/')[0];
  if (!isWebsiteNamespace(root)) throw new Error('Non-website namespace rejected');
  return cms.has(root) ? 'website_content' : root;
}
export function mapCollection(namespace) { return { collection: mongoCollectionName(namespace), filter: { namespace } }; }
const timestamp = v => v && typeof v.seconds === 'number' && typeof v.nanoseconds === 'number' && typeof v.toDate === 'function';
const geopoint = v => v instanceof GeoPoint || (v && typeof v.latitude === 'number' && typeof v.longitude === 'number' && typeof v.isEqual === 'function' && v.constructor?.name === 'GeoPoint');
const reference = v => v && typeof v.path === 'string' && (v.firestore || v.__firestoreReference === true);
const referenceIdentity = v => ({ path: v.path, projectId: v.projectId || v.firestore?.projectId || null, databaseId: v.databaseId || v.firestore?.databaseId || null });
const vector = v => v instanceof VectorValue || (v && typeof v.toArray === 'function' && v.constructor?.name === 'VectorValue');
export function canonicalValue(v) {
  if (typeof v === 'bigint') return v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(Number.MIN_SAFE_INTEGER) ? canonicalValue(Number(v)) : ['bigint', v.toString()];
  if (v === undefined) return ['undefined'];
  if (v === null) return ['null'];
  if (timestamp(v)) return ['timestamp', v.seconds, v.nanoseconds];
  if (v instanceof Date) return ['date', v.toISOString()];
  if (Buffer.isBuffer(v) || v instanceof Uint8Array) return ['bytes', Buffer.from(v).toString('base64')];
  if (geopoint(v)) return ['geopoint', v.latitude, v.longitude];
  if (reference(v)) return ['reference', referenceIdentity(v)];
  if (vector(v)) return ['vector', v.toArray().map(canonicalValue)];
  if (Array.isArray(v)) return ['array', v.map(canonicalValue)];
  if (typeof v === 'number') return ['number', Number.isNaN(v) ? 'NaN' : v === Infinity ? '+Infinity' : v === -Infinity ? '-Infinity' : Object.is(v, -0) ? '-0' : v];
  if (typeof v === 'object') return ['map', Object.keys(v).sort().map(k => [k, canonicalValue(v[k])])];
  return [typeof v, v];
}
export function recordHash(path, data) { return createHash('sha256').update(JSON.stringify([path, canonicalValue(data)])).digest('hex'); }
export function fromCanonicalValue(value) {
  if (!Array.isArray(value) || typeof value[0] !== 'string') throw new Error('Invalid canonical value');
  const [type, data, extra] = value;
  switch (type) {
    case 'undefined': return undefined;
    case 'null': return null;
    case 'timestamp': return new Timestamp(data, extra);
    case 'date': return new Date(data);
    case 'bytes': return Buffer.from(data, 'base64');
    case 'geopoint': return new GeoPoint(data, extra);
    case 'reference': return { ...data, __firestoreReference: true };
    case 'vector': return FieldValue.vector(data.map(fromCanonicalValue));
    case 'array': return data.map(fromCanonicalValue);
    case 'map': return Object.fromEntries(data.map(([key, child]) => [key, fromCanonicalValue(child)]));
    case 'bigint': return BigInt(data);
    case 'number': return data === 'NaN' ? NaN : data === '+Infinity' ? Infinity : data === '-Infinity' ? -Infinity : data === '-0' ? -0 : data;
    case 'string': case 'boolean': return data;
    default: throw new Error('Unknown canonical value type');
  }
}
export function encodeDocument(path, idOrData, maybeData) {
  const fullPath = typeof idOrData === 'string' ? `${path}/${idOrData}` : path;
  const source = typeof idOrData === 'string' ? maybeData : idOrData;
  const parts = fullPath.split('/'); const id = parts.pop(); const namespace = parts.join('/');
  mongoCollectionName(namespace);
  const firestoreTypes = {};
  function convert(v, at) {
    const key = JSON.stringify(at);
    if (typeof v === 'bigint') {
      if (v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(Number.MIN_SAFE_INTEGER)) return Number(v);
      firestoreTypes[key] = { type: 'bigint' }; return Long.fromBigInt(v);
    }
    if (timestamp(v)) { firestoreTypes[key] = { type: 'timestamp', seconds: v.seconds, nanoseconds: v.nanoseconds }; return v.toDate(); }
    if (v instanceof Date) return v;
    if (Buffer.isBuffer(v) || v instanceof Uint8Array) { firestoreTypes[key] = { type: 'bytes' }; return Buffer.from(v); }
    if (geopoint(v)) { firestoreTypes[key] = { type: 'geopoint' }; return { latitude: v.latitude, longitude: v.longitude }; }
    if (reference(v)) { firestoreTypes[key] = { type: 'reference' }; return referenceIdentity(v); }
    if (vector(v)) { firestoreTypes[key] = { type: 'vector' }; return v.toArray(); }
    if (v === undefined) { firestoreTypes[key] = { type: 'undefined' }; return null; }
    if (Object.is(v, -0)) { firestoreTypes[key] = { type: 'negative-zero' }; return 0; }
    if (Array.isArray(v)) return v.map((child, i) => convert(child, [...at, i]));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, child]) => [k, convert(child, [...at, k])]));
    return v;
  }
  return { _id: fullPath, namespace, id, data: convert(source, []), firestoreTypes };
}
export function decodeDocument(row) {
  function restore(v, at) {
    const info = row.firestoreTypes?.[JSON.stringify(at)];
    if (info?.type === 'bigint') return typeof v === 'bigint' ? v : BigInt(v.toString());
    if (info?.type === 'timestamp') return new Timestamp(info.seconds, info.nanoseconds);
    if (info?.type === 'geopoint') return new GeoPoint(v.latitude, v.longitude);
    if (info?.type === 'reference') return { ...v, __firestoreReference: true };
    if (info?.type === 'vector') return FieldValue.vector(v);
    if (info?.type === 'bytes') return Buffer.isBuffer(v) ? v : Buffer.from(v?.value ? v.value(true) : v);
    if (info?.type === 'undefined') return undefined;
    if (info?.type === 'negative-zero') return -0;
    if (v instanceof Date || Buffer.isBuffer(v)) return v;
    if (Array.isArray(v)) return v.map((child, i) => restore(child, [...at, i]));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, child]) => [k, restore(child, [...at, k])]));
    return v;
  }
  return restore(row.data, []);
}
export const decodeFields = decodeDocument;

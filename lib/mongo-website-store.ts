import 'server-only';

import { randomBytes } from 'node:crypto';
import { MongoClient, type ClientSession, type Db } from 'mongodb';
import { Timestamp, fieldTransformKind } from './mongo-website-types.mjs';
import { mongoCollectionName, encodeDocument, decodeDocument } from './mongo-website-codec.mjs';
import type { WebsiteDatabase } from './website-database-types';

type Fields = Record<string, any>;
type Connection = { client: MongoClient; db: Db };
type ConnectionProvider = () => Promise<Connection>;
type Direction = 'asc' | 'desc';
type Write = { kind: 'create' | 'set' | 'update' | 'delete'; ref: MongoDocument; value?: Fields; merge?: boolean };

// One small pool per server process, shared across hot reloads and requests.
const cache = globalThis as typeof globalThis & { websiteMongoConnection?: { key: string; promise: Promise<Connection> } };
async function connection(): Promise<Connection> {
  const uri = process.env.MONGODB_URI;
  const database = process.env.MONGODB_DATABASE || 'dtps_website';
  if (!uri) throw new Error('MONGODB_URI is required for the MongoDB website provider');
  if (!/^[a-zA-Z0-9_-]+$/.test(database) || ['admin', 'config', 'local'].includes(database.toLowerCase())) throw new Error('Invalid MONGODB_DATABASE');
  const key = `${uri}\n${database}`;
  if (cache.websiteMongoConnection?.key !== key) {
    const client = new MongoClient(uri, { maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 60000, serverSelectionTimeoutMS: 10000 });
    const promise = client.connect().then(() => ({ client, db: client.db(database) })).catch(async (error) => {
      if (cache.websiteMongoConnection?.key === key) delete cache.websiteMongoConnection;
      await client.close().catch(() => undefined);
      throw error;
    });
    cache.websiteMongoConnection = { key, promise };
  }
  return cache.websiteMongoConnection!.promise;
}

function field(value: unknown): string {
  if (typeof value !== 'string' || !value || value.split('.').some(part => !part || part.startsWith('$') || ['__proto__', 'constructor', 'prototype'].includes(part))) throw new Error('Invalid field path');
  return value;
}
function at(value: any, path: string): any {
  return path.split('.').reduce((result, key) => result != null && Object.prototype.hasOwnProperty.call(result, key) ? result[key] : undefined, value);
}
function plain(value: any): value is Fields { return !!value && Object.getPrototypeOf(value) === Object.prototype; }
function clone(value: any): any {
  if (Array.isArray(value)) return value.map(clone);
  if (plain(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  if (value instanceof Date) return new Date(value);
  if (Buffer.isBuffer(value)) return Buffer.from(value);
  return value;
}
const removed = Symbol('deleted');
function materialize(value: any, old: any, now: Timestamp, allowDelete: boolean): any {
  const transform = fieldTransformKind(value);
  if (transform === 'timestamp') return now;
  if (transform === 'delete') {
    if (!allowDelete) throw new Error('FieldValue.delete() requires update or merge');
    return removed;
  }
  if (transform === 'increment') return (typeof old === 'number' ? old : 0) + value.operand;
  if (Array.isArray(value)) return value.map(item => {
    if (fieldTransformKind(item)) throw new Error('Field transforms are not allowed in arrays');
    return materialize(item, undefined, now, false);
  });
  if (plain(value)) {
    const result: Fields = {};
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) continue;
      const resolved = materialize(item, old?.[key], now, allowDelete);
      if (resolved !== removed) Object.defineProperty(result, key, { value: resolved, enumerable: true, writable: true, configurable: true });
    }
    return result;
  }
  return clone(value);
}
function assignPath(target: Fields, path: string, value: any) {
  const parts = field(path).split('.');
  const last = parts.pop()!;
  let parent = target;
  for (const part of parts) {
    if (!plain(parent[part])) parent[part] = {};
    parent = parent[part];
  }
  if (value === removed) delete parent[last]; else parent[last] = value;
}
function mergeFields(old: Fields, changes: Fields, now: Timestamp): Fields {
  const result = clone(old);
  for (const [key, value] of Object.entries(changes)) {
    field(key);
    if (value === undefined) continue;
    // Firestore merge recursively merges nonempty maps; an empty map replaces it.
    const resolved = plain(value) && Object.keys(value).length
      ? mergeFields(plain(old[key]) ? old[key] : {}, value, now)
      : materialize(value, old[key], now, true);
    if (resolved === removed) delete result[key]; else result[key] = resolved;
  }
  return result;
}

class MongoSnapshot {
  readonly exists: boolean;
  readonly id: string;
  constructor(readonly ref: MongoDocument, private readonly row: any) { this.exists = !!row; this.id = ref.id; }
  data(): Fields | undefined { return this.row ? (decodeDocument(this.row) ?? {}) : undefined; }
  get(path: string): any { return at(this.data(), field(path)); }
}
class MongoQuerySnapshot {
  readonly size: number;
  readonly empty: boolean;
  constructor(readonly docs: MongoSnapshot[]) { this.size = docs.length; this.empty = !docs.length; }
  forEach(callback: (doc: MongoSnapshot) => void) { this.docs.forEach(callback); }
}

class MongoQuery {
  constructor(readonly store: MongoStore, readonly path: string,
    private readonly filters: any[] = [], private readonly orders: Array<[string, Direction]> = [],
    private readonly maximum?: number, private readonly projection?: string[], private readonly after?: MongoSnapshot) {}
  private copy(changes: { filters?: any[]; orders?: Array<[string, Direction]>; maximum?: number; projection?: string[]; after?: MongoSnapshot }) {
    return new MongoQuery(this.store, this.path, changes.filters ?? this.filters, changes.orders ?? this.orders, changes.maximum ?? this.maximum, changes.projection ?? this.projection, changes.after ?? this.after);
  }
  where(name: string, op: string, value: any): MongoQuery {
    if (value === undefined) throw new Error('Query values cannot be undefined');
    if (['in', 'not-in', 'array-contains-any'].includes(op) && (!Array.isArray(value) || !value.length || value.includes(undefined))) throw new Error('Membership queries require a nonempty array of defined values');
    const key = name === '__name__' ? 'id' : `data.${field(name)}`;
    const converted = (item: any) => typeof item?.toDate === 'function' ? item.toDate() : item;
    const operations: Record<string, string> = { '==': '$eq', '!=': '$ne', '<': '$lt', '<=': '$lte', '>': '$gt', '>=': '$gte', in: '$in', 'not-in': '$nin', 'array-contains': '$eq', 'array-contains-any': '$in' };
    if (!operations[op]) throw new Error(`Unsupported query operator: ${op}`);
    const condition = { [key]: { [operations[op]]: Array.isArray(value) ? value.map(converted) : converted(value), $exists: true } };
    return this.copy({ filters: [...this.filters, condition] });
  }
  orderBy(name: string, direction: Direction = 'asc'): MongoQuery {
    if (!['asc', 'desc'].includes(direction)) throw new Error('Invalid query order');
    return this.copy({ orders: [...this.orders, [name === '__name__' ? 'id' : `data.${field(name)}`, direction]] });
  }
  limit(value: number): MongoQuery {
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error('Query limit must be a positive integer');
    return this.copy({ maximum: value });
  }
  select(...names: string[]): MongoQuery { return this.copy({ projection: names.map(name => `data.${field(name)}`) }); }
  startAfter(snapshot: MongoSnapshot): MongoQuery {
    if (!(snapshot instanceof MongoSnapshot) || snapshot.ref.parent.path !== this.path || !snapshot.exists) throw new Error('Invalid query cursor');
    return this.copy({ after: snapshot });
  }
  private ordering(): Array<[string, Direction]> {
    return this.orders.some(([key]) => key === 'id') ? this.orders : [...this.orders, ['id', this.orders.at(-1)?.[1] || 'asc']];
  }
  private filter(): Fields {
    const all = [{ namespace: this.path }, ...this.filters, ...this.orders.filter(([key]) => key !== 'id').map(([key]) => ({ [key]: { $exists: true } }))];
    if (this.after) {
      const cursor = { id: this.after.id, data: this.after.data() };
      const order = this.ordering();
      const valueAt = (key: string) => {
        const value = at(cursor, key);
        if (value === undefined) throw new Error('Query cursor is missing an ordering field');
        return typeof value?.toDate === 'function' ? value.toDate() : value;
      };
      all.push({ $or: order.map(([key, direction], index) => Object.fromEntries([
        ...order.slice(0, index).map(([prior]) => [prior, valueAt(prior)]),
        [key, { [direction === 'asc' ? '$gt' : '$lt']: valueAt(key) }],
      ])) } as any);
    }
    return { $and: all };
  }
  async get(session?: ClientSession): Promise<MongoQuerySnapshot> {
    const { db } = await this.store.connect();
    const projection = this.projection ? Object.fromEntries(['_id', 'namespace', 'id', 'firestoreTypes', ...this.projection].map(key => [key, 1])) : undefined;
    let cursor = db.collection(mongoCollectionName(this.path)).find(this.filter(), { session, ...(projection ? { projection } : {}) }).sort(Object.fromEntries(this.ordering().map(([key, direction]) => [key, direction === 'asc' ? 1 : -1])) as any);
    if (this.maximum) cursor = cursor.limit(this.maximum);
    return new MongoQuerySnapshot((await cursor.toArray()).map(row => new MongoSnapshot(this.store.doc(row._id as unknown as string), row)));
  }
  count() {
    return { get: async () => {
      const { db } = await this.store.connect();
      const count = await db.collection(mongoCollectionName(this.path)).countDocuments(this.filter(), { ...(this.maximum ? { limit: this.maximum } : {}) });
      return { data: () => ({ count }) };
    } };
  }
}

class MongoCollection extends MongoQuery {
  doc(id: string = randomBytes(15).toString('base64url')): MongoDocument {
    if (typeof id !== 'string' || !id || id.includes('/') || ['.', '..'].includes(id) || Buffer.byteLength(id) > 1500) throw new Error('Invalid document ID');
    return new MongoDocument(this.store, `${this.path}/${id}`);
  }
  async add(value: Fields) { const ref = this.doc(); await ref.create(value); return ref; }
}
class MongoDocument {
  readonly id: string;
  readonly parent: MongoCollection;
  constructor(readonly store: MongoStore, readonly path: string) {
    const pieces = path.split('/'); this.id = pieces.pop()!; this.parent = new MongoCollection(store, pieces.join('/'));
  }
  collection(name: string) { return this.store.collection(`${this.path}/${name}`); }
  async get(session?: ClientSession): Promise<MongoSnapshot> {
    const { db } = await this.store.connect();
    const row = await db.collection(mongoCollectionName(this.parent.path)).findOne({ _id: this.path as any }, { session });
    return new MongoSnapshot(this, row);
  }
  async create(value: Fields) { return this.store.write({ kind: 'create', ref: this, value }); }
  async set(value: Fields, options?: { merge?: boolean }) { return this.store.write({ kind: 'set', ref: this, value, merge: options?.merge }); }
  async update(value: Fields) { return this.store.write({ kind: 'update', ref: this, value }); }
  async delete() { return this.store.write({ kind: 'delete', ref: this }); }
}
class MongoTransaction {
  readonly writes: Write[] = [];
  private reads: Promise<unknown> = Promise.resolve();
  constructor(readonly session: ClientSession) {}
  async get(target: MongoDocument | MongoQuery): Promise<any> {
    if (this.writes.length) throw new Error('Transaction reads must precede writes');
    // Existing Firestore callers use Promise.all for reads. The Mongo driver
    // forbids parallel commands on a transaction session, so serialize them.
    const next = this.reads.then<MongoSnapshot | MongoQuerySnapshot>(() => target.get(this.session));
    this.reads = next;
    return next;
  }
  set(ref: MongoDocument, value: Fields, options?: { merge?: boolean }) { this.writes.push({ kind: 'set', ref, value, merge: options?.merge }); return this; }
  create(ref: MongoDocument, value: Fields) { this.writes.push({ kind: 'create', ref, value }); return this; }
  update(ref: MongoDocument, value: Fields) { this.writes.push({ kind: 'update', ref, value }); return this; }
  delete(ref: MongoDocument) { this.writes.push({ kind: 'delete', ref }); return this; }
}

export class MongoStore {
  constructor(readonly connect: ConnectionProvider = connection) {}
  collection(path: string): MongoCollection {
    if (typeof path !== 'string' || path.split('/').some(part => !part || ['.', '..'].includes(part)) || path.split('/').length % 2 !== 1) throw new Error('Invalid collection path');
    mongoCollectionName(path); // Refuse other applications' namespaces before any connection.
    return new MongoCollection(this, path);
  }
  doc(path: string): MongoDocument {
    const segments = path.split('/'); const id = segments.pop();
    if (!id) throw new Error('Invalid document path');
    return this.collection(segments.join('/')).doc(id);
  }
  async getAll(...refs: MongoDocument[]): Promise<MongoSnapshot[]> {
    if (!refs.length) return [];
    const grouped = new Map<string, Set<string>>();
    for (const ref of refs) {
      if (!(ref instanceof MongoDocument) || ref.store !== this) throw new Error('Invalid document reference');
      const name = mongoCollectionName(ref.parent.path);
      if (!grouped.has(name)) grouped.set(name, new Set());
      grouped.get(name)!.add(ref.path);
    }
    const { db } = await this.connect();
    const found = new Map<string, any>();
    for (const [name, paths] of grouped) {
      const ids = [...paths];
      for (let start = 0; start < ids.length; start += 100) {
        const rows = await db.collection<any>(name).find({ _id: { $in: ids.slice(start, start + 100) } }).toArray();
        for (const row of rows) found.set(row._id, row);
      }
    }
    // The native $in result order is unspecified; preserve caller order, repeated
    // references and nonexistent-document snapshots just like the repository API.
    return refs.map(ref => new MongoSnapshot(ref, found.get(ref.path)));
  }
  settings() { /* Existing caller requests ignoreUndefinedProperties; writes already omit them. */ }
  private async apply(write: Write, session: ClientSession, now: Timestamp) {
    const { db } = await this.connect();
    const target = db.collection<any>(mongoCollectionName(write.ref.parent.path));
    if (write.kind === 'delete') { await target.deleteOne({ _id: write.ref.path }, { session }); return; }
    const previous = await target.findOne({ _id: write.ref.path }, { session });
    if (write.kind === 'create' && previous) throw new Error('Document already exists');
    if (write.kind === 'update' && !previous) throw new Error('Document does not exist');
    const old = previous ? decodeDocument(previous) : {};
    let value: Fields;
    if (write.kind === 'update') {
      value = clone(old);
      for (const [key, item] of Object.entries(write.value!)) {
        if (item === undefined) continue;
        assignPath(value, key, materialize(item, at(old, key), now, true));
      }
    } else if (write.merge) value = mergeFields(old, write.value!, now);
    else value = materialize(write.value, old, now, false);
    const record = encodeDocument(write.ref.path, value);
    if (write.kind === 'create') await target.insertOne(record, { session });
    else await target.replaceOne({ _id: write.ref.path }, record, { session, upsert: true });
  }
  async runTransaction<T>(callback: (transaction: MongoTransaction) => Promise<T>): Promise<T> {
    const { client, db } = await this.connect();
    const session = client.startSession();
    try {
      // Retry first-write races on previously absent canonical/guard documents too.
      for (let attempt = 0; ; attempt++) {
        try {
          return await session.withTransaction(async () => {
            const transaction = new MongoTransaction(session);
            const result = await callback(transaction);
            const namespaces = transaction.writes.map(write => write.ref.parent.path);
            const guards = new Set<string>();
            if (namespaces.some(name => ['websiteAdmins', '_websiteAdminState'].includes(name))) guards.add('admins');
            if (namespaces.includes('websiteSiteBanners')) guards.add('site-banners');
            if (namespaces.includes('websitePlanBanners')) guards.add('plan-banners');
            // Shared writes prevent snapshot-isolation write skew for cross-document invariants.
            // Normal reads and unrelated commerce/visitor transactions never take these guards.
            for (const guard of [...guards].sort()) await db.collection<any>('_websiteMongoGuards').updateOne({ _id: guard }, { $inc: { revision: 1 } }, { upsert: true, session });
            const now = Timestamp.now();
            for (const write of transaction.writes) await this.apply(write, session, now);
            return result;
          }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }, readPreference: 'primary', maxCommitTimeMS: 10000 }) as T;
        } catch (error: any) { if (error?.code !== 11000 || attempt >= 2) throw error; }
      }
    } finally { await session.endSession(); }
  }
  async write(write: Write) { await this.runTransaction(async tx => { tx.writes.push(write); }); return { writeTime: Timestamp.now() }; }
  bulkWriter() {
    const queued: Write[] = [];
    return {
      delete: (ref: MongoDocument) => { queued.push({ kind: 'delete', ref }); },
      close: async () => {
        // Bounded transactions avoid a large in-flight request fan-out.
        for (let start = 0; start < queued.length; start += 100) await this.runTransaction(async tx => { tx.writes.push(...queued.slice(start, start + 100)); });
      },
    };
  }
}

const store = new MongoStore();
export function getWebsiteMongoStore(): WebsiteDatabase { return store as unknown as WebsiteDatabase; }
export const getMongoWebsiteStore = getWebsiteMongoStore;
export const getWebsiteDatabase = getWebsiteMongoStore;

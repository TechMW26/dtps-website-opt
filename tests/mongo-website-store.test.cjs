const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
let FieldValue, Timestamp;

const codecPromise = import('../lib/mongo-website-codec.mjs');
const read = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
const equal = (a, b) => a instanceof Date && b instanceof Date ? +a === +b : a === b;
function matches(row, filter) {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$and') return condition.every(item => matches(row, item));
    if (key === '$or') return condition.some(item => matches(row, item));
    const actual = read(row, key);
    if (!condition || typeof condition !== 'object' || condition instanceof Date) return equal(actual, condition);
    return Object.entries(condition).every(([op, value]) => {
      if (op === '$exists') return (actual !== undefined) === value;
      if (op === '$eq') return equal(actual, value);
      if (op === '$ne') return !equal(actual, value);
      if (op === '$in') return value.some(item => equal(item, actual));
      if (op === '$nin') return !value.some(item => equal(item, actual));
      if (op === '$gt') return actual > value;
      if (op === '$gte') return actual >= value;
      if (op === '$lt') return actual < value;
      if (op === '$lte') return actual <= value;
      throw Error(`Unhandled test operator ${op}`);
    });
  });
}
async function harness() {
  const codec = await codecPromise;
  const valueTypes = await import('../lib/mongo-website-types.mjs');
  ({ FieldValue, Timestamp } = valueTypes);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('lib/mongo-website-store.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => name === 'server-only' ? {} : name === './mongo-website-codec.mjs' ? codec : name === './mongo-website-types.mjs' ? valueTypes : require(name), module, module.exports);
  let rows = new Map();
  let retry = false;
  let activeSessionReads = 0;
  const calls = { writes: [], filters: [], sessions: 0, attempts: 0 };
  const db = { collection(name) {
    const rowsFor = () => [...rows].filter(([key]) => key.startsWith(name + ':')).map(([, value]) => value);
    const keyFor = id => name + ':' + id;
    return {
      async findOne(filter, options) {
        if (options?.session) {
          assert.equal(activeSessionReads++, 0, 'Mongo transaction commands cannot run in parallel');
          await new Promise(resolve => setImmediate(resolve));
          activeSessionReads--;
        }
        return rowsFor().find(row => matches(row, filter)) || null;
      },
      find(filter, options) {
        calls.filters.push({ name, filter, options });
        let result = rowsFor().filter(row => matches(row, filter));
        const cursor = {
          sort(order) { result.sort((a, b) => { for (const [key, direction] of Object.entries(order)) { const first = read(a, key), second = read(b, key); if (first < second) return -direction; if (first > second) return direction; } return 0; }); return cursor; },
          limit(limit) { result = result.slice(0, limit); return cursor; },
          async toArray() {
            if (!options?.projection) return result;
            return result.map(row => {
              const projected = {};
              for (const path of Object.keys(options.projection)) {
                const value = read(row, path);
                if (value === undefined) continue;
                const parts = path.split('.'); const last = parts.pop(); let parent = projected;
                for (const part of parts) { parent[part] ||= {}; parent = parent[part]; }
                parent[last] = value;
              }
              return projected;
            });
          },
        };
        return cursor;
      },
      async countDocuments(filter, options) { return Math.min(rowsFor().filter(row => matches(row, filter)).length, options?.limit ?? Infinity); },
      async insertOne(row) { if (rows.has(keyFor(row._id))) throw Object.assign(Error('Duplicate'), { code: 11000 }); rows.set(keyFor(row._id), row); calls.writes.push(name); },
      async replaceOne(filter, row) { rows.set(keyFor(filter._id), row); calls.writes.push(name); },
      async deleteOne(filter) { rows.delete(keyFor(filter._id)); calls.writes.push(name); },
      async updateOne(filter, changes) { const key = keyFor(filter._id); const old = rows.get(key) || { _id: filter._id, revision: 0 }; rows.set(key, { ...old, revision: old.revision + changes.$inc.revision }); calls.writes.push(name); },
    };
  } };
  const client = { startSession() {
    calls.sessions++;
    return {
      async withTransaction(callback) {
        for (;;) {
          const backup = new Map(rows);
          calls.attempts++;
          try { const result = await callback(); if (retry) { rows = backup; retry = false; continue; } return result; }
          catch (error) { rows = backup; throw error; }
        }
      },
      async endSession() {},
    };
  } };
  const store = new module.exports.MongoStore(async () => ({ client, db }));
  return { store, calls, codec, rows: () => rows, retryNext: () => { retry = true; } };
}

test('Mongo facade preserves exact IDs, namespace isolation, nested values and precise timestamps', async () => {
  const { store, rows } = await harness();
  const stamp = new Timestamp(1700000000, 123456789);
  const ref = store.collection('websiteBlogs').doc('legacy-id');
  await ref.create({ _id: 'source-id', namespace: 'original', createdAt: stamp, nested: { title: 'A', values: [null, 0, false] }, bytes: Buffer.from('blob') });
  await store.collection('websiteTestimonials').doc('legacy-id').create({ title: 'different CMS document' });
  const snapshot = await ref.get();
  assert.equal(snapshot.id, 'legacy-id');
  assert.equal(snapshot.data()._id, 'source-id');
  assert.equal(snapshot.data().createdAt.nanoseconds, 123456789);
  assert.equal(snapshot.get('nested.title'), 'A');
  assert.equal(snapshot.data().bytes.toString(), 'blob');
  assert.equal((await store.collection('websiteBlogs').get()).size, 1);
  assert.equal(rows().size, 2);
  assert.ok([...rows().keys()].every(key => key.startsWith('website_content:')));
});

test('Mongo writes preserve merge maps, update dotted fields, increments, delete and server timestamps', async () => {
  const { store } = await harness();
  const ref = store.collection('websiteOrders').doc('order_uuid');
  await ref.set({ customer: { name: 'Visible name', city: 'Delhi' }, count: 2, password: 'old', ignored: undefined });
  await ref.set({ customer: { city: 'Pune' } }, { merge: true });
  await ref.update({ 'customer.name': 'Still visible', count: FieldValue.increment(3), password: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
  const data = (await ref.get()).data();
  assert.deepEqual(data.customer, { name: 'Still visible', city: 'Pune' });
  assert.equal(data.count, 5);
  assert.equal('password' in data, false);
  assert.equal('ignored' in data, false);
  assert.ok(data.updatedAt instanceof Timestamp);
  await ref.set({ customer: {} }, { merge: true });
  assert.deepEqual((await ref.get()).data().customer, {});
  await assert.rejects(ref.create({ count: 0 }), /already exists/);
  await assert.rejects(store.collection('websiteOrders').doc('missing').update({ a: 1 }), /does not exist/);
});

test('Mongo native query filters, counts and pagination use deterministic ID tie-breaking', async () => {
  const { store, calls } = await harness();
  const collection = store.collection('websiteVisitors');
  for (const [id, score, country] of [['a', 2, 'IN'], ['b', 2, 'IN'], ['c', 3, 'US'], ['d', 4, 'IN']]) await collection.doc(id).set({ score, country, seen: new Date('2026-01-01') });
  const query = collection.where('country', 'in', ['IN']).where('score', '>=', 2).orderBy('score', 'asc');
  const first = await query.limit(2).get();
  assert.deepEqual(first.docs.map(doc => doc.id), ['a', 'b']);
  const second = await query.startAfter(first.docs[1]).limit(2).get();
  assert.deepEqual(second.docs.map(doc => doc.id), ['d']);
  assert.equal((await query.count().get()).data().count, 3);
  const reverse = await collection.orderBy('score', 'desc').limit(2).get();
  assert.deepEqual(reverse.docs.map(doc => doc.id), ['d', 'c']);
  assert.deepEqual((await collection.orderBy('score', 'desc').startAfter(reverse.docs[1]).get()).docs.map(doc => doc.id), ['b', 'a']);
  await collection.select('country').get();
  assert.equal(calls.filters.at(-1).options.projection['data.country'], 1);
  const sessions = calls.sessions;
  await query.get();
  assert.equal(calls.sessions, sessions, 'read-only queries do not acquire transaction guards');
});

test('Mongo transactions rollback together and retry without duplicate increments', async () => {
  const { store, retryNext, calls } = await harness();
  const order = store.collection('websiteOrders').doc('order_1');
  const coupon = store.collection('websiteCoupons').doc('coupon_1');
  await order.set({ status: 'pending' });
  await coupon.set({ usedCount: 0 });
  await assert.rejects(store.runTransaction(async tx => {
    tx.update(order, { status: 'completed' });
    tx.update(store.collection('websitePayments').doc('missing'), { status: 'completed' });
  }), /does not exist/);
  assert.equal((await order.get()).get('status'), 'pending');
  retryNext();
  let attempts = 0;
  await store.runTransaction(async tx => {
    attempts++;
    await Promise.all([tx.get(order), tx.get(coupon)]);
    tx.update(order, { status: 'completed' });
    tx.update(coupon, { usedCount: FieldValue.increment(1) });
  });
  assert.equal(attempts, 2);
  assert.equal((await coupon.get()).get('usedCount'), 1);
  assert.equal(calls.writes.includes('_websiteMongoGuards'), false, 'commerce has no global guard');
});

test('Mongo invariant mutations share guards, batched deletions and getAll preserve contracts', async () => {
  const { store, calls } = await harness();
  const admin = store.collection('websiteAdmins').doc('permanent-abc');
  await admin.set({ role: 'superadmin' });
  assert.ok(calls.writes.includes('_websiteMongoGuards'));
  const missing = store.collection('websiteAdmins').doc('missing');
  assert.deepEqual((await store.getAll(admin, missing)).map(doc => doc.exists), [true, false]);
  await assert.rejects(store.runTransaction(async tx => { tx.update(admin, { role: 'admin' }); await tx.get(admin); }), /reads must precede writes/);
  const batch = store.bulkWriter();
  batch.delete(admin);
  await batch.close();
  assert.equal((await admin.get()).exists, false);
  assert.throws(() => store.collection('websiteAdmins').doc('../bad'), /Invalid document/);
});

test('Mongo index plan is explicitly targeted, non-destructive and dry-run by default', async () => {
  const { websiteMongoIndexes, indexArguments } = await import('../scripts/index-website-mongodb.mjs');
  assert.deepEqual(indexArguments(['--database', 'dtps_website'], {}), { database: 'dtps_website', execute: false });
  assert.throws(() => indexArguments([], {}), /Explicit/);
  assert.throws(() => indexArguments(['--database', 'dtps_website'], { MONGODB_DATABASE: 'other' }), /match/);
  assert.throws(() => indexArguments(['--database', 'dtps_website', '--execute'], {}), /MONGODB_URI/);
  for (const specs of Object.values(websiteMongoIndexes)) for (const spec of specs) {
    assert.equal(spec.key.namespace, 1);
    assert.equal('expireAfterSeconds' in spec, false);
    assert.equal('unique' in spec, false);
  }
});

test('Provider-neutral timestamps handle negative epochs and field transforms without Firebase', async () => {
  const types = await import('../lib/mongo-website-types.mjs');
  const beforeEpoch = types.Timestamp.fromMillis(-1);
  assert.equal(beforeEpoch.seconds, -1);
  assert.equal(beforeEpoch.nanoseconds, 999000000);
  assert.equal(beforeEpoch.toDate().toISOString(), '1969-12-31T23:59:59.999Z');
  assert.equal(types.Timestamp.fromDate(new Date(0)).toMillis(), 0);
  assert.equal(new types.Timestamp(0, 999999).toDate().getTime(), 1);
  assert.equal(new types.Timestamp(0, 999999).toMillis(), 0);
  assert.ok(new types.Timestamp(0, 1).isEqual(new types.Timestamp(0, 1)));
  assert.throws(() => new types.Timestamp(0, 1000000000), /nanoseconds/);
  assert.throws(() => new types.GeoPoint(91, 0), /coordinates/);
  assert.equal(types.fieldTransformKind(types.FieldValue.serverTimestamp()), 'timestamp');
  assert.equal(types.fieldTransformKind(types.FieldValue.increment(1)), 'increment');
  assert.equal(types.fieldTransformKind(types.FieldValue.delete()), 'delete');
  assert.equal(types.fieldTransformKind({ operand: 1 }), null);
  const vector = types.FieldValue.vector([1, 2]);
  const values = vector.toArray(); values.push(3);
  assert.deepEqual(vector.toArray(), [1, 2]);
  assert.equal(fs.readFileSync('lib/mongo-website-store.ts', 'utf8').includes('firebase-admin'), false);
});

test('Mongo batch reads group physical banks and preserve missing, duplicate and caller order', async () => {
  const { store, calls } = await harness();
  const first = store.collection('websiteBlogs').doc('same');
  const second = store.collection('websitePopups').doc('same');
  const missing = store.collection('websiteBlogs').doc('missing');
  const order = store.collection('websiteOrders').doc('order');
  await first.set({ title: 'Blog' }); await second.set({ title: 'Popup' }); await order.set({ total: 299 });
  const before = calls.filters.length;
  const snapshots = await store.getAll(second, missing, first, second, order);
  assert.deepEqual(snapshots.map(doc => doc.id), ['same', 'missing', 'same', 'same', 'order']);
  assert.deepEqual(snapshots.map(doc => doc.exists), [true, false, true, true, true]);
  assert.equal(snapshots[0].get('title'), 'Popup');
  assert.equal(snapshots[2].get('title'), 'Blog');
  assert.equal(calls.filters.length - before, 2, 'two physical banks require two reads, not five');
  assert.deepEqual(await store.getAll(), []);
});

test('Mongo query pagination retains every row beyond the telemetry 500-row boundary', async () => {
  const { store, rows, codec } = await harness();
  for (let i = 0; i < 1201; i++) {
    const path = `websiteVisitors/${String(i).padStart(5, '0')}`;
    rows().set(`websiteVisitors:${path}`, codec.encodeDocument(path, { sessionStart: new Date('2026-01-01'), country: 'IN' }));
  }
  const query = store.collection('websiteVisitors').where('sessionStart', '>=', new Date('2025-01-01')).orderBy('sessionStart');
  const ids = []; let after;
  for (;;) {
    const page = await (after ? query.startAfter(after) : query).limit(500).get();
    ids.push(...page.docs.map(doc => doc.id));
    if (page.size < 500) break;
    after = page.docs.at(-1);
  }
  assert.equal(ids.length, 1201);
  assert.equal(new Set(ids).size, 1201);
  assert.equal(ids.at(-1), '01200');
});

test('Mongo queries distinguish null from missing and reject invalid membership/cursors', async () => {
  const { store } = await harness();
  const collection = store.collection('websiteLeads');
  await collection.doc('null').set({ optional: null });
  await collection.doc('missing').set({ name: 'Keep missing' });
  assert.deepEqual((await collection.where('optional', '==', null).get()).docs.map(doc => doc.id), ['null']);
  assert.throws(() => collection.where('optional', '==', undefined), /undefined/);
  assert.throws(() => collection.where('optional', 'in', []), /nonempty/);
  assert.throws(() => collection.where('optional', 'in', [undefined]), /defined/);
  const snapshot = await collection.doc('missing').get();
  await assert.rejects(collection.orderBy('optional').startAfter(snapshot).get(), /missing an ordering field/);
  assert.throws(() => store.collection('appUsers'), /Non-website/);
});

test('Mongo zero-field selection retains existing document identity with empty data', async () => {
  const { store } = await harness();
  const collection = store.collection('websiteLeads');
  await collection.doc('one').set({ secret: 'not selected', updatedAt: FieldValue.serverTimestamp() });
  const result = await collection.select().get();
  assert.equal(result.size, 1);
  assert.equal(result.docs[0].exists, true);
  assert.equal(result.docs[0].id, 'one');
  assert.deepEqual(result.docs[0].data(), {});
  assert.equal(result.docs[0].get('secret'), undefined);
  assert.equal(result.docs[0].get('toString'), undefined, 'inherited properties are not stored fields');
  const missing = await collection.doc('missing').get();
  assert.equal(missing.data(), undefined);
});

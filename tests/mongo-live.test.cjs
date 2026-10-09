const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const { MongoClient } = require('mongodb');

// Explicit opt-in only. Uses synthetic records in one website-only namespace.
// Example: DTPS_MONGO_LIVE_TEST=1 node --env-file=.env.mongo-migration --test tests/mongo-live.test.cjs
test('live Mongo replica-set adapter regression with exact synthetic-record cleanup', {
  skip: process.env.DTPS_MONGO_LIVE_TEST !== '1',
  timeout: 120000,
}, async t => {
  assert.equal(process.env.MONGODB_DATABASE, 'dtps_website', 'Live tests require the explicitly configured website database');
  assert.ok(process.env.MONGODB_URI, 'Live tests require a configured connection');
  const codec = await import('../lib/mongo-website-codec.mjs');
  const types = await import('../lib/mongo-website-types.mjs');
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('lib/mongo-website-store.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => name === 'server-only' ? {} : name === './mongo-website-codec.mjs' ? codec : name === './mongo-website-types.mjs' ? types : require(name), module, module.exports);
  const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 5, minPoolSize: 0, serverSelectionTimeoutMS: 10000 });
  const prefix = `check-${Date.now()}-${crypto.randomBytes(12).toString('hex')}`;
  const namespace = 'websiteMigrationChecks';
  const ids = ['counter', 'a', 'b', 'c', 'rollback', 'missing', 'canonical'].map(suffix => `${prefix}-${suffix}`);
  const paths = ids.map(id => `${namespace}/${id}`);
  let stage = 'connection', failure, cleanupFailed = false, attempts = 0, firstWriteAttempts = 0;
  let connected = false;
  try {
    await client.connect(); connected = true;
    const db = client.db('dtps_website');
    const store = new module.exports.MongoStore(async () => ({ client, db }));
    const collection = store.collection(namespace);
    const [counter, a, b, c, rollback, missing, canonical] = ids.map(id => collection.doc(id));

    stage = 'timestamp and field-transform roundtrip';
    const stamp = new types.Timestamp(1700000000, 123456789);
    await counter.create({ scope: prefix, count: 0, stamp, nested: { keep: 'unchanged', change: 1 }, bytes: Buffer.from('synthetic'), optional: null });
    await counter.set({ nested: { change: 2 }, updatedAt: types.FieldValue.serverTimestamp() }, { merge: true });
    const initial = (await counter.get()).data();
    assert.equal(initial.stamp.nanoseconds, stamp.nanoseconds);
    assert.equal(initial.stamp.seconds, stamp.seconds);
    assert.equal(initial.bytes.toString(), 'synthetic');
    assert.deepEqual(initial.nested, { keep: 'unchanged', change: 2 });
    assert.equal(typeof initial.updatedAt.toMillis(), 'number');

    stage = 'atomic multi-document rollback';
    await assert.rejects(store.runTransaction(async tx => {
      await tx.get(counter);
      tx.update(counter, { count: 99 });
      tx.create(rollback, { scope: prefix, marker: 'must rollback' });
      tx.update(missing, { marker: 'missing document rejects transaction' });
    }), /does not exist/);
    assert.equal((await counter.get()).get('count'), 0);
    assert.equal((await rollback.get()).exists, false);

    stage = 'concurrent increment transactions and driver retries';
    await Promise.all(Array.from({ length: 8 }, () => store.runTransaction(async tx => {
      attempts++;
      await Promise.all([tx.get(counter), tx.get(missing)]);
      tx.update(counter, { count: types.FieldValue.increment(1) });
    })));
    assert.equal((await counter.get()).get('count'), 8);
    assert.ok(attempts >= 8);

    stage = 'concurrent first-write race on one absent canonical document';
    assert.equal((await canonical.get()).exists, false);
    await Promise.all(Array.from({ length: 8 }, () => store.runTransaction(async tx => {
      firstWriteAttempts++;
      const current = await tx.get(canonical);
      if (!current.exists) tx.create(canonical, { scope: prefix, kind: 'canonical', count: 1 });
      else tx.update(canonical, { count: types.FieldValue.increment(1) });
    })));
    assert.equal((await canonical.get()).get('count'), 8);
    assert.equal((await collection.where('scope', '==', prefix).where('kind', '==', 'canonical').get()).size, 1);

    stage = 'indexed-field queries, projections and cursor ties';
    for (const [ref, ordinal] of [[a, 1], [b, 1], [c, 2]]) await ref.create({ scope: prefix, ordinal, stamp, hidden: 'not projected' });
    const query = collection.where('scope', '==', prefix).where('ordinal', '>=', 1).orderBy('ordinal');
    const first = await query.limit(2).get();
    assert.deepEqual(first.docs.map(doc => doc.id), [a.id, b.id]);
    assert.deepEqual((await query.startAfter(first.docs[1]).get()).docs.map(doc => doc.id), [c.id]);
    assert.equal((await query.count().get()).data().count, 3);
    const projected = await query.select('ordinal', 'stamp').get();
    assert.equal(projected.docs[0].get('hidden'), undefined);
    assert.equal(projected.docs[0].get('stamp').nanoseconds, stamp.nanoseconds);
    const emptyProjection = await query.select().get();
    assert.equal(emptyProjection.size, 3);
    assert.deepEqual(emptyProjection.docs[0].data(), {});

    stage = 'batched reads retain missing and duplicate references';
    const batch = await store.getAll(c, missing, a, c);
    assert.deepEqual(batch.map(doc => doc.id), [c.id, missing.id, a.id, c.id]);
    assert.deepEqual(batch.map(doc => doc.exists), [true, false, true, true]);
    t.diagnostic(`Verified rollback, 8 concurrent increments (${attempts} attempts), 8 concurrent first writes (${firstWriteAttempts} attempts), timestamps, zero/partial projections, pagination, count and batched reads.`);
  } catch (error) {
    // Never forward driver error messages, topology objects or connection values.
    failure = new Error(`Live Mongo adapter regression failed during ${stage}; code=${Number.isInteger(error?.code) ? error.code : 'application-check'}`);
  } finally {
    if (connected) {
      try {
        const target = client.db('dtps_website').collection(namespace);
        // Never use an unscoped delete, collection drop, database drop or prefix regex.
        const filter = { namespace, _id: { $in: paths } };
        await target.deleteMany(filter);
        assert.equal(await target.countDocuments(filter), 0);
        t.diagnostic('Exact synthetic-record cleanup verified. No production namespaces changed.');
      } catch { cleanupFailed = true; }
    }
    await client.close().catch(() => { cleanupFailed = true; });
  }
  if (cleanupFailed) throw new Error('Live Mongo test cleanup could not be verified; inspect only this test run before retrying');
  if (failure) throw failure;
});

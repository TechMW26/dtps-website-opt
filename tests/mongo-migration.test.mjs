import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BSON } from 'mongodb';
import { Timestamp, GeoPoint, FieldValue } from '../lib/mongo-website-types.mjs';
import { encodeDocument, decodeDocument, recordHash, canonicalValue, fromCanonicalValue, mapCollection, isWebsiteNamespace } from '../lib/mongo-website-codec.mjs';
import { createSourceEnumerator, boundedSourceMap } from '../scripts/firebase-source-reader.mjs';

function roundTrip(path, data) { return decodeDocument(BSON.deserialize(BSON.serialize(encodeDocument(path, data)))); }
test('migration accepts native Firebase source types but reconstructs Mongo-only runtime types', async () => {
  const native = await import('firebase-admin/firestore');
  const data = { timestamp: new native.Timestamp(1700000000, 123456789), point: new native.GeoPoint(19, 72), vector: native.FieldValue.vector([1, 2]) };
  const restored = roundTrip('websiteBlogs/source', data);
  assert.equal(recordHash('websiteBlogs/source', restored), recordHash('websiteBlogs/source', data));
  assert.ok(restored.timestamp instanceof Timestamp);
  assert.ok(restored.point instanceof GeoPoint);
});
test('codec preserves nanoseconds, signed int64, bytes and special numeric values through BSON', () => {
  const data = { t: new Timestamp(-10, 987654321), high: 9223372036854775807n, low: -9223372036854775808n, small: 2n, bytes: Buffer.from([0, 255, 1]), values: [NaN, Infinity, -Infinity, -0, null] };
  const restored = roundTrip('websiteOrders/order', data);
  assert.equal(recordHash('websiteOrders/order', restored), recordHash('websiteOrders/order', data));
  assert.equal(restored.small, 2);
  assert.equal(restored.high, data.high);
  assert.equal(restored.t.nanoseconds, 987654321);
});
test('codec preserves vectors, geopoints, references and arbitrary reserved field names', () => {
  const data = { _id: 'customer-owned', namespace: 'not-envelope', data: { a: new GeoPoint(19, 72) }, vector: FieldValue.vector([1, 2]), ref: { path: 'items/x', projectId: 'other-project', databaseId: 'other-db', __firestoreReference: true }, 'a.b': { '[0]': new Timestamp(5, 6) } };
  assert.equal(recordHash('websiteBlogs/a', roundTrip('websiteBlogs/a', data)), recordHash('websiteBlogs/a', data));
});
test('canonical hash ignores object key order but distinguishes null, absent fields and identity', () => {
  assert.equal(recordHash('websiteOrders/a', { b: 2, a: 1 }), recordHash('websiteOrders/a', { a: 1, b: 2 }));
  assert.notEqual(recordHash('websiteOrders/a', {}), recordHash('websiteOrders/a', { field: null }));
  assert.notEqual(recordHash('websiteOrders/a', {}), recordHash('websiteOrders/b', {}));
});
test('CMS consolidation preserves namespace collisions and nested collection IDs', () => {
  const a = encodeDocument('websiteBlogs', 'same', { title: 'a' });
  const b = encodeDocument('websiteTestimonials', 'same', { title: 'b' });
  assert.notEqual(a._id, b._id);
  assert.equal(mapCollection(a.namespace).collection, mapCollection(b.namespace).collection);
  const nested = encodeDocument('websiteBlogs/a/revisions/v1', { changed: true });
  assert.equal(nested.namespace, 'websiteBlogs/a/revisions');
  assert.equal(nested.id, 'v1');
  assert.equal(mapCollection(nested.namespace).collection, 'website_content');
});
test('application and system namespaces are rejected; admin migration guard is retained', () => {
  for (const name of ['users', 'patients', 'admins', 'admin', 'website', 'system.profile']) {
    assert.equal(isWebsiteNamespace(name), false);
    assert.throws(() => mapCollection(name));
  }
  assert.equal(mapCollection('_websiteAdminState').collection, '_websiteAdminState');
});
test('migration refuses missing explicit arguments before opening any service', () => {
  const result = spawnSync(process.execPath, ['scripts/migrate-website-to-mongodb.mjs'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.deepEqual(JSON.parse(result.stderr), { success: false, failureStage: 'configuration', errorCode: 'MIGRATION_ERROR' });
});
test('migration refuses protected database and source mismatch before export', () => {
  const base = ['scripts/migrate-website-to-mongodb.mjs', '--project', 'wrong-project', '--source-database', '(default)', '--target-database'];
  const protectedDb = spawnSync(process.execPath, [...base, 'admin'], { encoding: 'utf8' });
  assert.equal(JSON.parse(protectedDb.stderr).failureStage, 'configuration');
  const mismatch = spawnSync(process.execPath, [...base, 'dtps_website'], { encoding: 'utf8', env: { ...process.env, FIREBASE_PROJECT_ID: 'actual-project' } });
  assert.equal(JSON.parse(mismatch.stderr).failureStage, 'configuration');
});
test('migration rejects unbounded source enumeration concurrency before service access', () => {
  for (const concurrency of ['0', '65', 'Infinity', '1.5']) {
    const result = spawnSync(process.execPath, ['scripts/migrate-website-to-mongodb.mjs'], { encoding: 'utf8', env: { ...process.env, MIGRATION_ENUM_CONCURRENCY: concurrency } });
    assert.notEqual(result.status, 0);
    assert.equal(JSON.parse(result.stderr).failureStage, 'configuration');
  }
});
test('reconciliation requires explicit source quiescence and sanitizes all top-level failures', () => {
  const result = spawnSync(process.execPath, ['scripts/migrate-website-to-mongodb.mjs', '--reconcile-backup', '/sensitive-location/manifest.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.deepEqual(JSON.parse(result.stderr), { success: false, failureStage: 'configuration', errorCode: 'MIGRATION_ERROR' });
  assert.equal(result.stderr.includes('sensitive-location'), false);
  assert.equal(result.stderr.includes(' at '), false);
});
test('accelerated public v1 source reader exhausts pages and preserves missing-parent references', async () => {
  const requests = [];
  const source = { doc: path => ({ path }), collection: path => ({ path }) };
  const base = 'projects/p/databases/d/documents';
  const client = {
    async listDocuments(request, options) {
      requests.push(request); assert.equal(options.autoPaginate, false);
      return request.pageToken ? [[{ name: `${base}/websiteOrders/b` }], null, {}] : [[{ name: `${base}/websiteOrders/a` }], null, { nextPageToken: 'next' }];
    },
    async listCollectionIds(request) { return request.pageToken ? [['nested2'], null, {}] : [['nested1'], null, { nextPageToken: 'next' }]; },
  };
  const reader = createSourceEnumerator(source, client, 'p', 'd');
  assert.deepEqual(await reader.listDocuments({ path: 'websiteOrders' }), [{ path: 'websiteOrders/a' }, { path: 'websiteOrders/b' }]);
  assert.equal(requests[0].pageSize, 1000); assert.equal(requests[0].showMissing, true); assert.deepEqual(requests[0].mask, { fieldPaths: [] });
  assert.deepEqual(await reader.listCollections({ path: 'websiteOrders/a' }), [{ path: 'websiteOrders/a/nested1' }, { path: 'websiteOrders/a/nested2' }]);
});
test('accelerated reader fails closed on namespace escape and repeated page token', async () => {
  const source = { doc: path => ({ path }), collection: path => ({ path }) };
  const escaped = createSourceEnumerator(source, { async listDocuments() { return [[{ name: 'projects/p/databases/d/documents/patients/a' }], null, {}]; } }, 'p', 'd');
  await assert.rejects(escaped.listDocuments({ path: 'websiteOrders' }), /escaped/);
  await assert.rejects(escaped.listDocuments({ path: 'patients' }), /Non-website/);
  const loop = createSourceEnumerator(source, { async listCollectionIds() { return [[], null, { nextPageToken: 'same' }]; } }, 'p', 'd');
  await assert.rejects(loop.listCollections({ path: 'websiteOrders/a' }), /Repeated/);
});
test('whole-frontier worker pool covers every parent exactly once without exceeding concurrency', async () => {
  const input = Array.from({ length: 137 }, (_, i) => i);
  let active = 0, maxActive = 0; const visited = new Set(); let passedSlowFirst = false;
  const output = await boundedSourceMap(input, async id => {
    assert.equal(visited.has(id), false); visited.add(id); active++; maxActive = Math.max(maxActive, active);
    if (id === 0) await new Promise(resolve => setTimeout(resolve, 10));
    else { await Promise.resolve(); if (id > 4 && active > 1) passedSlowFirst = true; }
    active--; return `child-${id}`;
  }, 4);
  assert.equal(maxActive, 4); assert.equal(visited.size, input.length); assert.equal(passedSlowFirst, true);
  assert.deepEqual(output, input.map(id => `child-${id}`));
});
test('protected canonical backup reconstructs all supported source types losslessly', () => {
  const data = { t: new Timestamp(-5, 987654321), date: new Date('2020-01-01T00:00:00Z'), point: new GeoPoint(2, 3), vector: FieldValue.vector([1, 2]), buffer: Buffer.from([0, 255]), ref: { path: 'a/b', projectId: 'p', databaseId: 'd', __firestoreReference: true }, large: 9223372036854775807n, values: [NaN, -Infinity, Infinity, -0, null, undefined, true, 'text'] };
  assert.equal(recordHash('websiteBlogs/a', fromCanonicalValue(canonicalValue(data))), recordHash('websiteBlogs/a', data));
});
test('backup import dry-run requires no Firebase connection and rejects non-quiesced snapshot', async () => {
  const fixture = await mkdtemp(resolve('.recovery', 'test-migration-'));
  let generatedBackup;
  try {
    const path = 'websiteBlogs/test-record', data = { title: 'test' };
    const manifest = { exportComplete: true, sourceQuiescedAssertion: true, sourceProject: 'test-source', sourceDatabase: '(default)', targetDatabase: 'test_target', sourceRecords: 1, namespaces: { websiteBlogs: 1 }, ignoredApplicationCollections: 85 };
    await writeFile(`${fixture}/manifest.json`, JSON.stringify(manifest), { mode: 0o600 });
    await writeFile(`${fixture}/source.ndjson`, `${JSON.stringify({ path, value: canonicalValue(data), hash: recordHash(path, data) })}\n`, { mode: 0o600 });
    const args = ['scripts/migrate-website-to-mongodb.mjs', '--project', 'test-source', '--source-database', '(default)', '--target-database', 'test_target', '--source-quiesced', '--import-backup', `${fixture}/manifest.json`];
    const env = { ...process.env, FIREBASE_PROJECT_ID: 'test-source', FIREBASE_DATABASE_ID: '(default)', MONGODB_DATABASE: 'test_target', MONGODB_URI: '', FIREBASE_PRIVATE_KEY: '', FIRESTORE_NATIVE_PRIVATE_KEY: '' };
    const result = spawnSync(process.execPath, args, { encoding: 'utf8', env });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout); generatedBackup = report.backupDir;
    assert.equal(report.sourceRecords, 1); assert.equal(report.importedFromBackup, true); assert.equal(report.cutoverComplete, false);
    await writeFile(`${fixture}/manifest.json`, JSON.stringify({ ...manifest, sourceQuiescedAssertion: false }), { mode: 0o600 });
    const denied = spawnSync(process.execPath, args, { encoding: 'utf8', env });
    assert.notEqual(denied.status, 0); assert.equal(JSON.parse(denied.stderr).failureStage, 'configuration');
    await writeFile(`${fixture}/manifest.json`, JSON.stringify({ ...manifest, sourceWritesResumedAt: '2026-10-10T00:00:00Z' }), { mode: 0o600 });
    const stale = spawnSync(process.execPath, args, { encoding: 'utf8', env });
    assert.notEqual(stale.status, 0); assert.equal(JSON.parse(stale.stderr).failureStage, 'configuration');
    assert.equal(stale.stdout, '');
  } finally {
    await rm(fixture, { recursive: true });
    if (generatedBackup?.startsWith(`${resolve('.recovery')}/mongo-`)) await rm(generatedBackup, { recursive: true });
  }
});

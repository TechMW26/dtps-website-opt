import { mkdir, open, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { MongoClient } from 'mongodb';
import { createSourceEnumerator, boundedSourceMap } from './firebase-source-reader.mjs';
import { canonicalValue, fromCanonicalValue, recordHash, encodeDocument, decodeDocument, mongoCollectionName, isWebsiteNamespace } from '../lib/mongo-website-codec.mjs';

// No deletes, source writes, inferred target database, or unscoped application collection reads.
let failureStage = 'configuration';
function safeFailure(error) {
  const errorCode = Number.isSafeInteger(error?.code) ? error.code : 'MIGRATION_ERROR';
  return { failureStage, errorCode };
}
function fatal(error) { console.error(JSON.stringify({ success: false, ...safeFailure(error) })); process.exit(1); }
process.on('uncaughtException', fatal);
process.on('unhandledRejection', fatal);
const args = process.argv.slice(2);
function option(flag) { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; }
const execute = args.includes('--execute');
const mongoWriteRate = Number(option('--mongo-write-rate') || 90);
if (!Number.isSafeInteger(mongoWriteRate) || mongoWriteRate < 1 || mongoWriteRate > 500) throw new Error('Mongo write rate must be between 1 and 500 documents per second');
const reconcileBackup = option('--reconcile-backup');
const importBackup = option('--import-backup');
const sourceQuiesced = args.includes('--source-quiesced');
const acceleratedSource = args.includes('--accelerated-source');
if ((reconcileBackup || importBackup) && !sourceQuiesced) throw new Error('Backup operations require an explicitly quiesced source');
if (reconcileBackup && importBackup) throw new Error('Choose reconciliation or backup import, not both');
const enumerationConcurrency = Number(process.env.MIGRATION_ENUM_CONCURRENCY || 64);
if (!Number.isSafeInteger(enumerationConcurrency) || enumerationConcurrency < 1 || enumerationConcurrency > 64) throw new Error('MIGRATION_ENUM_CONCURRENCY must be an integer between 1 and 64');
const project = option('--project'), sourceDatabase = option('--source-database'), targetDatabase = option('--target-database');
if (!project || !sourceDatabase || !targetDatabase || targetDatabase.startsWith('--')) throw new Error('Required: --project ID --source-database ID --target-database WEBSITE_DB [--execute] [--refresh-source]');
if (!/^[a-zA-Z0-9_-]+$/.test(targetDatabase) || ['admin', 'local', 'config'].includes(targetDatabase)) throw new Error('Invalid target database');
const configuredProject = process.env.FIREBASE_PROJECT_ID || process.env.FIRESTORE_NATIVE_PROJECT_ID;
const configuredDatabase = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_NATIVE_DATABASE_ID || '(default)';
if (project !== configuredProject || sourceDatabase !== configuredDatabase) throw new Error('Explicit source project/database must match configured credentials');
if (process.env.MONGODB_DATABASE && process.env.MONGODB_DATABASE !== targetDatabase) throw new Error('Target database differs from MONGODB_DATABASE');
const recoveryRoot = resolve('.recovery');
let previousPaths; let prior; let priorRecords;
if (reconcileBackup || importBackup) {
  const manifestPath = resolve(reconcileBackup || importBackup);
  if (!manifestPath.startsWith(`${recoveryRoot}/`)) throw new Error('Reconciliation manifest must be inside ignored recovery directory');
  prior = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!prior.exportComplete || prior.sourceProject !== project || prior.sourceDatabase !== sourceDatabase || prior.targetDatabase !== targetDatabase) throw new Error('Reconciliation source identity or completed export mismatch');
  if (importBackup && prior.sourceQuiescedAssertion !== true) throw new Error('Import requires a backup exported under explicit source write pause');
  if (importBackup && prior.sourceWritesResumedAt) throw new Error('Backup is stale after source writes resumed; create a fresh quiesced export');
  const lines = (await readFile(resolve(dirname(manifestPath), 'source.ndjson'), 'utf8')).split('\n').filter(Boolean);
  previousPaths = new Set(); priorRecords = []; const priorCounts = {};
  for (const line of lines) {
    const item = JSON.parse(line);
    if (typeof item.path !== 'string' || !isWebsiteNamespace(item.path.split('/')[0]) || createHash('sha256').update(JSON.stringify([item.path, item.value])).digest('hex') !== item.hash || previousPaths.has(item.path)) throw new Error('Reconciliation backup integrity failed');
    if (item.path.split('/').length % 2 !== 0 || item.path.split('/').some(part => !part)) throw new Error('Invalid backup document path');
    const data = fromCanonicalValue(item.value);
    if (recordHash(item.path, data) !== item.hash) throw new Error('Canonical backup reconstruction failed');
    priorRecords.push({ ...item, data });
    const namespace = item.path.split('/').slice(0, -1).join('/'); priorCounts[namespace] = (priorCounts[namespace] || 0) + 1;
    previousPaths.add(item.path);
  }
  if (previousPaths.size !== prior.sourceRecords) throw new Error('Reconciliation backup count mismatch');
  for (const [namespace, count] of Object.entries(prior.namespaces || {})) if ((priorCounts[namespace] || 0) !== count) throw new Error('Backup namespace count mismatch');
  for (const namespace of Object.keys(priorCounts)) if (prior.namespaces?.[namespace] !== priorCounts[namespace]) throw new Error('Unmanifested backup namespace');
}
try { execFileSync('git', ['check-ignore', '-q', `${recoveryRoot}/migration-probe.json`], { stdio: 'ignore' }); }
catch { throw new Error('.recovery must be Git-ignored before creating a sensitive backup'); }
await mkdir(recoveryRoot, { recursive: true, mode: 0o700 });
const backupDir = resolve(recoveryRoot, `mongo-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const startedAt = new Date().toISOString();
await mkdir(backupDir, { mode: 0o700 });
const backup = await open(`${backupDir}/source.ndjson`, 'wx', 0o600);
failureStage = 'source-export';
const source = importBackup ? null : getFirestore(initializeApp({ projectId: project, credential: cert({ projectId: project, clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL, privateKey: (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n') }) }, `mongo-export-${Date.now()}`), sourceDatabase);
// Preserve int64 values outside JavaScript's safe integer range during the export.
source?.settings({ useBigInt: true });
let sourceApi;
let enumerator = { listDocuments: collection => collection.listDocuments(), listCollections: ref => ref.listCollections() };
if (acceleratedSource && source) {
  const firestoreSdk = await import('@google-cloud/firestore');
  const v1 = firestoreSdk.v1 || firestoreSdk.default?.v1;
  sourceApi = new v1.FirestoreClient({ projectId: project, credentials: { client_email: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIRESTORE_NATIVE_CLIENT_EMAIL, private_key: (process.env.FIREBASE_PRIVATE_KEY || process.env.FIRESTORE_NATIVE_PRIVATE_KEY || '').replace(/\\n/g, '\n') } });
  enumerator = createSourceEnumerator(source, sourceApi, project, sourceDatabase);
}
const records = []; const namespaces = new Map();
const exportReferences = []; let enumerated = 0; let phase = 'root-backup';
const progress = setInterval(() => console.log(JSON.stringify({ phase, exportedRecords: records.length, scannedNamespaces: namespaces.size, enumeratedParents: enumerated, pendingParents: exportReferences.length - enumerated })), 15000);
progress.unref();
async function mapLimit(values, task) {
  return boundedSourceMap(values, task, enumerationConcurrency);
}
async function exportCollection(collection) {
  namespaces.set(collection.path, 0);
  // listDocuments includes missing parent documents with populated subcollections.
  const refs = await enumerator.listDocuments(collection);
  for (let offset = 0; offset < refs.length; offset += 100) {
    const chunk = refs.slice(offset, offset + 100);
    const docs = chunk.length ? await source.getAll(...chunk) : [];
    for (const doc of docs) {
      if (doc.exists) {
        const data = doc.data(); const hash = recordHash(doc.ref.path, data);
        await backup.write(`${JSON.stringify({ path: doc.ref.path, hash, value: canonicalValue(data) })}\n`);
        records.push({ path: doc.ref.path, hash, row: encodeDocument(doc.ref.path, data) });
        namespaces.set(collection.path, namespaces.get(collection.path) + 1);
      }
      exportReferences.push(doc.ref);
    }
  }
}
let roots;
try {
  if (importBackup) {
    roots = [];
    for (const [namespace, count] of Object.entries(prior.namespaces)) namespaces.set(namespace, count);
    for (const item of priorRecords) {
      await backup.write(`${JSON.stringify({ path: item.path, hash: item.hash, value: item.value })}\n`);
      records.push({ path: item.path, hash: item.hash, row: encodeDocument(item.path, item.data) });
    }
  } else {
  roots = await source.listCollections();
  for (const collection of roots.filter(c => isWebsiteNamespace(c.id))) await exportCollection(collection);
  // Back up every root collection first, then breadth-first enumerate all descendants.
  // Missing parent documents are retained in the enumeration queue by listDocuments.
  phase = 'nested-backup';
  while (enumerated < exportReferences.length) {
    // One worker pool per complete breadth-first frontier avoids a slow RPC
    // idling the other workers at artificial 64-parent batch boundaries.
    const parents = exportReferences.slice(enumerated);
    const descendants = await mapLimit(parents, async ref => {
      const children = await enumerator.listCollections(ref); enumerated++; return children;
    });
    for (const children of descendants) for (const child of children) await exportCollection(child);
  }
  }
} catch (error) {
  const failed = await open(`${backupDir}/manifest.json`, 'wx', 0o600);
  await failed.writeFile(JSON.stringify({ sourceProject: project, sourceDatabase, targetDatabase, execute, exportComplete: false, verified: false, cutoverComplete: false, sourceRecords: records.length, namespaces: Object.fromEntries(namespaces), ...safeFailure(error) }, null, 2));
  await failed.close(); await sourceApi?.close(); await source?.terminate();
  throw new Error(`Source export failed; partial backup retained at ${backupDir}; no Mongo writes attempted`, { cause: error });
}
finally { clearInterval(progress); await backup.close(); }
if (!records.length) throw new Error('No website records found; refusing an empty migration');
const report = { sourceProject: project, sourceDatabase, targetDatabase, execute, startedAt, exportComplete: true, cutoverComplete: false, sourceRecords: records.length, namespaces: Object.fromEntries(namespaces), ignoredApplicationCollections: roots.filter(c => !isWebsiteNamespace(c.id)).length, verified: false, backupDir };
report.sourceQuiescedAssertion = sourceQuiesced;
report.reconciliation = Boolean(reconcileBackup);
report.acceleratedSource = acceleratedSource;
report.importedFromBackup = Boolean(importBackup);
report.mongoWriteRate = mongoWriteRate;
if (importBackup) report.ignoredApplicationCollections = prior.ignoredApplicationCollections;
let client;
try {
  if (previousPaths) {
    const currentPaths = new Set(records.map(record => record.path));
    report.newSourceRecords = records.filter(record => !previousPaths.has(record.path)).length;
    report.removedSourceRecords = [...previousPaths].filter(path => !currentPaths.has(path)).length;
    if (report.removedSourceRecords) throw new Error('Source deletions require explicit manual reconciliation; no target records deleted');
  }
  failureStage = 'target-connect';
  const uri = process.env.MONGODB_URI;
  if (execute && !uri) throw new Error('MONGODB_URI is required for execution');
  if (uri) {
    client = new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 15000 }); await client.connect();
    const target = client.db(targetDatabase);
    const groups = new Map();
    for (const record of records) {
      const physical = mongoCollectionName(record.row.namespace);
      if (!groups.has(physical)) groups.set(physical, []);
      groups.get(physical).push(record);
    }
    const chunks = [];
    for (const [physical, rows] of groups) for (let i = 0; i < rows.length; i += 100) chunks.push({ physical, rows: rows.slice(i, i + 100) });
    // Preflight the entire dataset before any write; never overwrite independently modified data.
    failureStage = 'target-preflight';
    for (const { physical, rows } of chunks) {
      const found = new Map((await target.collection(physical).find({ _id: { $in: rows.map(r => r.path) } }).toArray()).map(row => [row._id, row]));
      for (const record of rows) {
        const existing = found.get(record.path); record.targetExisting = existing;
        if (!existing) continue;
        const currentHash = recordHash(record.path, decodeDocument(existing));
        record.unchanged = currentHash === record.hash;
        if (!record.unchanged && !((args.includes('--refresh-source') || reconcileBackup || importBackup) && existing.migrationSourceHash === currentHash)) throw new Error(`Target conflict at ${record.path}; no source data overwritten`);
      }
    }
    if (execute) {
      failureStage = 'target-import';
      report.writtenRecords = 0;
      for (const { physical, rows } of chunks) {
        const changed = rows.filter(record => !record.unchanged);
        if (!changed.length) continue;
        const started = Date.now();
        await target.collection(physical).bulkWrite(changed.map(record => ({ replaceOne: {
          filter: record.targetExisting ? { _id: record.path, data: record.targetExisting.data, firestoreTypes: record.targetExisting.firestoreTypes } : { _id: record.path, namespace: { $exists: false } },
          replacement: { ...record.row, migrationSourceHash: record.hash }, upsert: true,
        } })), { ordered: true });
        report.writtenRecords += changed.length;
        // Conservative default; a dedicated cluster may explicitly opt into a higher bounded rate.
        await new Promise(done => setTimeout(done, Math.max(0, Math.ceil(changed.length * 1000 / mongoWriteRate) - (Date.now() - started))));
      }
      let verified = 0;
      failureStage = 'target-verification';
      for (const { physical, rows } of chunks) {
        const found = new Map((await target.collection(physical).find({ _id: { $in: rows.map(r => r.path) } }).toArray()).map(row => [row._id, row]));
        for (const record of rows) {
          const row = found.get(record.path);
          if (!row || recordHash(record.path, decodeDocument(row)) !== record.hash) throw new Error(`Verification failed at ${record.path}`);
          verified++;
        }
      }
      for (const [namespace, expected] of namespaces) {
        const actual = await target.collection(mongoCollectionName(namespace)).countDocuments({ namespace });
        if (actual !== expected) throw new Error(`Namespace count mismatch for ${namespace}: expected ${expected}, found ${actual}`);
      }
      // Check source again: copying a live store is not an atomic cutover snapshot.
      failureStage = 'source-recheck';
      if (!sourceQuiesced) {
      const initial = new Map(records.map(record => [record.path, record.hash]));
      let sourceVerified = 0;
      const checkReferences = [];
      async function checkSource(collection) {
        const refs = await enumerator.listDocuments(collection);
        for (let i = 0; i < refs.length; i += 100) {
          const docs = await source.getAll(...refs.slice(i, i + 100));
          for (const doc of docs) {
            if (doc.exists) {
              if (initial.get(doc.ref.path) !== recordHash(doc.ref.path, doc.data())) throw new Error(`Source changed during migration at ${doc.ref.path}; rerun with writes paused`);
              sourceVerified++;
            }
            checkReferences.push(doc.ref);
          }
        }
      }
      for (const collection of (await source.listCollections()).filter(c => isWebsiteNamespace(c.id))) await checkSource(collection);
      let checkedParents = 0;
      while (checkedParents < checkReferences.length) {
        const parents = checkReferences.slice(checkedParents);
        const descendants = await mapLimit(parents, async ref => {
          const children = await enumerator.listCollections(ref); checkedParents++;
          if (checkedParents % (enumerationConcurrency * 10) === 0) console.log(JSON.stringify({ phase: 'source-recheck', verifiedSourceRecords: sourceVerified, enumeratedParents: checkedParents, pendingParents: checkReferences.length - checkedParents }));
          return children;
        });
        for (const children of descendants) for (const child of children) await checkSource(child);
      }
      if (sourceVerified !== records.length) throw new Error('Source records deleted during migration; manual reconciliation required');
      report.sourceStableAtVerification = true;
      }
      report.verified = true; report.verifiedRecords = verified;
      report.sourceVerificationMode = sourceQuiesced ? 'complete-recursive-export-under-operator-asserted-write-pause' : 'complete-recursive-export-and-recheck';
      report.cutoverRequirement = 'Pause source website writes and run final reconciliation before switching runtime. Verification does not cover later source writes.';
    }
  }
  report.finishedAt = new Date().toISOString();
} catch (error) { Object.assign(report, safeFailure(error)); throw error; }
finally {
  const manifest = await open(`${backupDir}/manifest.json`, 'wx', 0o600);
  await manifest.writeFile(JSON.stringify(report, null, 2)); await manifest.close();
  await client?.close(); await sourceApi?.close(); await source?.terminate();
  // Summary never prints source document contents or credentials.
  console.log(JSON.stringify(report, null, 2));
}

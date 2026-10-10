import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { mongoCollectionName, isWebsiteNamespace, decodeDocument, recordHash } from '../lib/mongo-website-codec.mjs';

let stage = 'configuration';
const fatal = error => { console.error(JSON.stringify({ success: false, stage, code: Number.isSafeInteger(error?.code) ? error.code : 'VERIFICATION_ERROR' })); process.exit(1); };
process.on('uncaughtException', fatal); process.on('unhandledRejection', fatal);
const args = process.argv.slice(2);
const option = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const input = option('--manifest'), database = option('--target-database');
if (!input || !database || !process.env.MONGODB_URI) throw new Error('Required verification configuration is missing');
if (process.env.MONGODB_DATABASE && process.env.MONGODB_DATABASE !== database) throw new Error('Database mismatch');
const path = resolve(input);
if (!path.startsWith(`${resolve('.recovery')}/`)) throw new Error('Protected backup required');
const manifest = JSON.parse(await readFile(path, 'utf8'));
if (!manifest.exportComplete || manifest.targetDatabase !== database || manifest.sourceWritesResumedAt || !manifest.sourceQuiescedAssertion) throw new Error('Fresh quiesced complete backup required');
stage = 'backup-validation';
const groups = new Map(), counts = new Map(), seen = new Set();
for (const line of (await readFile(resolve(dirname(path), 'source.ndjson'), 'utf8')).split('\n').filter(Boolean)) {
  const row = JSON.parse(line); const parts = typeof row.path === 'string' ? row.path.split('/') : [];
  if (!parts.length || parts.length % 2 || parts.some(part => !part) || !isWebsiteNamespace(parts[0]) || seen.has(row.path) || createHash('sha256').update(JSON.stringify([row.path, row.value])).digest('hex') !== row.hash) throw new Error('Invalid backup record');
  seen.add(row.path); parts.pop(); const namespace = parts.join('/');
  counts.set(namespace, (counts.get(namespace) || 0) + 1);
  const physical = mongoCollectionName(namespace);
  if (!groups.has(physical)) groups.set(physical, []);
  groups.get(physical).push(row);
}
if (seen.size !== manifest.sourceRecords) throw new Error('Backup count mismatch');
for (const [namespace, count] of counts) if (manifest.namespaces?.[namespace] !== count) throw new Error('Unmanifested namespace');
for (const [namespace, count] of Object.entries(manifest.namespaces)) if ((counts.get(namespace) || 0) !== count) throw new Error('Namespace count mismatch');
const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 2, serverSelectionTimeoutMS: 15000 });
try {
  stage = 'target-read'; await client.connect(); const target = client.db(database); let verified = 0;
  for (const [physical, rows] of groups) for (let start = 0; start < rows.length; start += 100) {
    const expected = rows.slice(start, start + 100);
    const actual = new Map((await target.collection(physical).find({ _id: { $in: expected.map(row => row.path) } }).toArray()).map(row => [row._id, row]));
    for (const record of expected) {
      const row = actual.get(record.path);
      if (!row || row.namespace !== record.path.split('/').slice(0, -1).join('/') || row.id !== record.path.split('/').at(-1) || recordHash(record.path, decodeDocument(row)) !== record.hash) throw new Error('Target record mismatch');
      verified++;
    }
  }
  for (const [namespace, count] of Object.entries(manifest.namespaces)) if (await target.collection(mongoCollectionName(namespace)).countDocuments({ namespace }) !== count) throw new Error('Target namespace mismatch');
  console.log(JSON.stringify({ success: true, verifiedRecords: verified, verifiedNamespaces: Object.keys(manifest.namespaces).length, targetDatabase: database, sourceProject: manifest.sourceProject, sourceDatabase: manifest.sourceDatabase, readOnly: true }));
} finally { await client.close(); }

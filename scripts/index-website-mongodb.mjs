import { pathToFileURL } from 'node:url';
import { MongoClient } from 'mongodb';

// Only query-driven indexes. No TTL, uniqueness enforcement or index deletion:
// imported duplicates and historical evidence must remain intact.
const index = (name, fields) => ({ name, key: { namespace: 1, ...fields } });
const chronological = index('namespace_createdAt', { 'data.createdAt': -1, id: -1 });
export const websiteMongoIndexes = {
  websiteOrders: [index('namespace_orderId', { 'data.orderId': 1, id: 1 }), chronological],
  websitePayments: [index('namespace_orderId', { 'data.orderId': 1, id: 1 }), index('namespace_razorpayPaymentId', { 'data.razorpayPaymentId': 1, id: 1 }), chronological],
  websiteAdmins: [index('namespace_email', { 'data.email': 1, id: 1 }), index('namespace_role', { 'data.role': 1, id: 1 }), chronological],
  websitePricing: [index('namespace_active', { 'data.isActive': 1, id: 1 })],
  websiteCoupons: [index('namespace_code', { 'data.code': 1, id: 1 })],
  websiteVisitors: [
    index('namespace_sessionId', { 'data.sessionId': 1, id: 1 }),
    index('namespace_sessionStart', { 'data.sessionStart': 1, id: 1 }),
    index('namespace_lastSeen', { 'data.lastSeen': 1, id: 1 }),
  ],
  websiteLeads: [index('namespace_source', { 'data.source': 1, id: 1 }), chronological],
  website_content: [
    index('namespace_id', { id: 1 }),
    index('namespace_page_active_order', { 'data.page': 1, 'data.isActive': 1, 'data.order': 1, id: 1 }),
    index('namespace_slug', { 'data.slug': 1, id: 1 }),
    index('namespace_planId', { 'data.planId': 1, id: 1 }),
  ],
  websiteSecurityLogs: [
    chronological,
    index('namespace_type_createdAt', { 'data.type': 1, 'data.createdAt': -1, id: -1 }),
    index('namespace_severity_createdAt', { 'data.severity': 1, 'data.createdAt': -1, id: -1 }),
    index('namespace_email_type_createdAt', { 'data.email': 1, 'data.type': 1, 'data.createdAt': -1, id: -1 }),
    index('namespace_target_type_createdAt', { 'data.meta.targetUserEmail': 1, 'data.type': 1, 'data.createdAt': -1, id: -1 }),
  ],
};

export function indexArguments(argv, env = process.env) {
  let database; let execute = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--execute') execute = true;
    else if (argv[i] === '--database' && argv[i + 1]) database = argv[++i];
    else throw new Error('Usage: node scripts/index-website-mongodb.mjs --database dtps_website [--execute]');
  }
  if (database !== 'dtps_website' || database !== (env.MONGODB_DATABASE || 'dtps_website')) throw new Error('Explicit --database dtps_website must match MONGODB_DATABASE');
  if (execute && !env.MONGODB_URI) throw new Error('MONGODB_URI is required for execution');
  return { database, execute };
}

async function main() {
  const { database, execute } = indexArguments(process.argv.slice(2));
  const summary = { database, mode: execute ? 'execute' : 'dry-run', indexes: websiteMongoIndexes };
  if (!execute) { console.log(JSON.stringify(summary, null, 2)); return; }
  const client = new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 2, minPoolSize: 0, serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const db = client.db(database);
    const results = [];
    for (const [collection, indexes] of Object.entries(websiteMongoIndexes)) {
      const names = await db.collection(collection).createIndexes(indexes);
      results.push({ collection, indexes: names });
    }
    console.log(JSON.stringify({ database, results }, null, 2));
  } finally { await client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    // Driver messages can contain endpoint/credential details; keep CLI output safe.
    console.error(error.message?.startsWith('Usage:') || error.message?.startsWith('Explicit ') || error.message?.startsWith('MONGODB_URI ') ? error.message : 'MongoDB index setup failed; inspect connection permissions and existing index specifications.');
    process.exitCode = 1;
  });
}

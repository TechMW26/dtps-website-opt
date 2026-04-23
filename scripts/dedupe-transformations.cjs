/**
 * Remove duplicate transformation slider images from MongoDB.
 *
 * Two documents are considered duplicates when:
 *   - They share the SAME page (or same targetPages set)
 *   - AND they share the SAME image URL
 *     (using afterImage when present, otherwise beforeImage)
 *
 * The earliest-created copy is kept; the later duplicates are deleted.
 *
 * Run with:
 *   node scripts/dedupe-transformations.cjs            # dry run (default)
 *   node scripts/dedupe-transformations.cjs --apply    # actually delete
 */

// Load env from .env or .env.local without external deps.
const fs = require('fs');
const path = require('path');
for (const envFile of ['.env.local', '.env']) {
  const p = path.join(__dirname, '..', envFile);
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  const col = mongoose.connection.collection('transformations');

  const total = await col.countDocuments({});
  console.log(`Total transformations in DB: ${total}`);

  const docs = await col.find({}).sort({ createdAt: 1, _id: 1 }).toArray();

  // Build duplicate buckets keyed by (sorted-targetPages | page) + image URL.
  const buckets = new Map();
  for (const d of docs) {
    const url = (d.afterImage && d.afterImage.trim()) || (d.beforeImage && d.beforeImage.trim()) || '';
    if (!url) continue;

    const targets = Array.isArray(d.targetPages) && d.targetPages.length > 0
      ? [...d.targetPages].sort().join(',')
      : (d.page || '');

    const key = `${targets}::${url}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(d);
  }

  const toDelete = [];
  let dupGroups = 0;
  for (const [key, group] of buckets.entries()) {
    if (group.length > 1) {
      dupGroups += 1;
      // Keep the first (earliest createdAt), delete the rest.
      const [keep, ...dups] = group;
      console.log(
        `\nDuplicate group (${group.length}) [${key.slice(0, 80)}...]
` +
          `   keep:   _id=${keep._id}  createdAt=${keep.createdAt}
` +
          dups.map((d) => `   delete: _id=${d._id}  createdAt=${d.createdAt}`).join('\n'),
      );
      toDelete.push(...dups.map((d) => d._id));
    }
  }

  console.log(`\nDuplicate groups found: ${dupGroups}`);
  console.log(`Documents to remove:    ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  if (!APPLY) {
    console.log('\nDRY RUN. Re-run with `--apply` to actually delete.');
    await mongoose.disconnect();
    return;
  }

  const result = await col.deleteMany({ _id: { $in: toDelete } });
  console.log(`\nDeleted ${result.deletedCount} duplicate transformation(s).`);

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

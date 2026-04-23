/**
 * Delete a specific transformation image from MongoDB and ImageKit.
 *
 * Usage:
 *   node scripts/delete-transformation-image.cjs <imageUrlOrFileName> [--apply]
 *
 * Without --apply this is a dry run.
 */

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
const ImageKit = require('imagekit');

const TARGET = process.argv[2];
const APPLY = process.argv.includes('--apply');
if (!TARGET) {
  console.error('Usage: node scripts/delete-transformation-image.cjs <imageUrlOrFileName> [--apply]');
  process.exit(1);
}

// Extract a "needle" — the unique filename portion — to match against DB urls
// (DB may store the URL with or without ImageKit transform path).
const needle = (() => {
  // strip query string
  const noQuery = TARGET.split('?')[0];
  // last segment of the path
  return noQuery.substring(noQuery.lastIndexOf('/') + 1);
})();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

(async () => {
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  const col = mongoose.connection.collection('transformations');

  console.log(`Searching DB for documents whose image URL contains: ${needle}`);
  const matches = await col.find({
    $or: [
      { afterImage: { $regex: needle, $options: 'i' } },
      { beforeImage: { $regex: needle, $options: 'i' } },
    ],
  }).toArray();

  console.log(`Found ${matches.length} matching transformation document(s).`);
  for (const d of matches) {
    console.log(`  _id=${d._id}  page=${d.page || (d.targetPages || []).join(',')}  afterImage=${d.afterImage}  beforeImage=${d.beforeImage}`);
  }

  // Find ImageKit file(s) by name
  console.log(`\nSearching ImageKit for file named: ${needle}`);
  let ikFiles = [];
  try {
    ikFiles = await ik.listFiles({ name: needle, limit: 50 });
  } catch (e) {
    console.error('ImageKit listFiles error:', e.message);
  }
  console.log(`Found ${ikFiles.length} ImageKit file(s).`);
  for (const f of ikFiles) {
    console.log(`  fileId=${f.fileId}  filePath=${f.filePath}`);
  }

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to actually delete.');
    await mongoose.disconnect();
    return;
  }

  // Delete DB docs
  if (matches.length > 0) {
    const ids = matches.map((d) => d._id);
    const res = await col.deleteMany({ _id: { $in: ids } });
    console.log(`\nDeleted ${res.deletedCount} document(s) from MongoDB.`);
  }

  // Delete ImageKit files
  for (const f of ikFiles) {
    try {
      await ik.deleteFile(f.fileId);
      console.log(`Deleted ImageKit file ${f.fileId} (${f.filePath})`);
    } catch (e) {
      console.error(`Failed to delete ${f.fileId}:`, e.message);
    }
  }

  await mongoose.disconnect();
  console.log('\nDone.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

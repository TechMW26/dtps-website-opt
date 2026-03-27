/**
 * Migrate MongoDB document image fields from /api/images/ URLs to ImageKit CDN URLs.
 * 
 * This updates ALL collections that store image URLs.
 * 
 * Usage: node scripts/migrate-db-image-urls.cjs
 */

const { MongoClient } = require('mongodb');
const { readFileSync } = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Load env
const envLines = readFileSync(path.join(ROOT, '.env'), 'utf-8').split('\n');
for (const line of envLines) {
  const t = line.trim();
  if (t.length === 0 || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (process.env[k] === undefined) process.env[k] = v;
}

// Load mapping
const mapping = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'gridfs-imagekit-mapping.json'), 'utf-8'));

// Collections and their image fields to check
const COLLECTIONS_FIELDS = [
  { collection: 'testimonials', fields: ['image'] },
  { collection: 'blogs', fields: ['featuredImage'] },
  { collection: 'recognitions', fields: ['image'] },
  { collection: 'transformations', fields: ['beforeImage', 'afterImage'] },
  { collection: 'successstories', fields: ['beforeImage', 'afterImage'] },
  { collection: 'sitebanners', fields: ['desktopImage', 'mobileImage'] },
  { collection: 'pageheroes', fields: ['image'] },
  { collection: 'planbanners', fields: ['image'] },
  { collection: 'popupbanners', fields: ['image'] },
  { collection: 'orders', fields: ['items.image'] },
  { collection: 'pricings', fields: ['image'] },
];

function replaceUrl(value) {
  if (typeof value !== 'string') return value;
  // Exact match in mapping
  if (mapping[value]) return mapping[value];
  // Pattern match: /api/images/<id> → ImageKit URL
  const match = value.match(/^\/api\/images\/([a-f\d]{24})$/i);
  if (match) {
    const id = match[1];
    return `https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-${id}.jpg`;
  }
  return value;
}

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  const db = client.db('DTPS-Ecommerce');
  let totalUpdated = 0;

  for (const { collection, fields } of COLLECTIONS_FIELDS) {
    const col = db.collection(collection);

    // Build a query to find documents that have /api/images/ in any of the image fields
    const orConditions = fields.map(f => ({ [f]: { $regex: '^\\/api\\/images\\/' } }));
    const docs = await col.find({ $or: orConditions }).toArray();

    if (docs.length === 0) {
      console.log(`  ${collection}: no documents with /api/images/ URLs`);
      continue;
    }

    console.log(`  ${collection}: found ${docs.length} documents to update`);

    for (const doc of docs) {
      const update = {};
      for (const field of fields) {
        // Handle nested fields like 'items.image'
        if (field.includes('.')) {
          const [arrayField, subField] = field.split('.');
          if (Array.isArray(doc[arrayField])) {
            const newArray = doc[arrayField].map(item => {
              if (item[subField] && typeof item[subField] === 'string' && item[subField].startsWith('/api/images/')) {
                return { ...item, [subField]: replaceUrl(item[subField]) };
              }
              return item;
            });
            update[arrayField] = newArray;
          }
        } else {
          const val = doc[field];
          if (val && typeof val === 'string' && val.startsWith('/api/images/')) {
            update[field] = replaceUrl(val);
          }
        }
      }

      if (Object.keys(update).length > 0) {
        await col.updateOne({ _id: doc._id }, { $set: update });
        totalUpdated++;
      }
    }
  }

  // Also scan blog content for embedded /api/images/ URLs in HTML
  console.log('\n  Scanning blog content for embedded image URLs...');
  const blogsCol = db.collection('blogs');
  const blogsWithContent = await blogsCol.find({ content: { $regex: '\\/api\\/images\\/' } }).toArray();

  for (const blog of blogsWithContent) {
    let content = blog.content;
    const regex = /\/api\/images\/([a-f\d]{24})/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const oldUrl = match[0];
      const newUrl = replaceUrl(oldUrl);
      content = content.split(oldUrl).join(newUrl);
    }
    if (content !== blog.content) {
      await blogsCol.updateOne({ _id: blog._id }, { $set: { content } });
      totalUpdated++;
      console.log(`    Updated blog: ${blog.title}`);
    }
  }

  await client.close();
  console.log(`\nDone. Updated ${totalUpdated} documents total.`);
})();

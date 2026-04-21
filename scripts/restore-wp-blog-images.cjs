/**
 * Restore blog featured images from the original WordPress export.
 * Replaces AI-generated covers with the original real images from the web.
 *
 * Usage: node scripts/restore-wp-blog-images.cjs
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const ImageKit = require('imagekit');

const envPath = path.join(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');

function env(key) {
  const match = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

const MONGODB_URI = env('MONGODB_URI');
const imagekit = new ImageKit({
  publicKey: env('IMAGEKIT_PUBLIC_KEY'),
  privateKey: env('IMAGEKIT_PRIVATE_KEY'),
  urlEndpoint: env('IMAGEKIT_URL_ENDPOINT'),
});

const XML_FILE = path.join(
  os.homedir(),
  'Downloads',
  'dtpoonamsagarhealthampnutritionprivatelimited.WordPress.2026-04-20.xml'
);

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, lowercase: true },
  featuredImage: String,
  published: Boolean,
}, { timestamps: true });

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema, 'blogs');

function cdata(str) {
  const match = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return match ? match[1] : str;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? cdata(match[1]) : '';
}

function parseWPXml(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const thumbMatch = block.match(/<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/);

    items.push({
      postId: extractTag(block, 'wp:post_id'),
      postType: extractTag(block, 'wp:post_type'),
      link: extractTag(block, 'link'),
      attachmentUrl: extractTag(block, 'wp:attachment_url'),
      thumbnailId: thumbMatch ? thumbMatch[1] : null,
    });
  }

  return items;
}

function slugFromLink(link) {
  try {
    const url = new URL(link);
    return url.pathname.replace(/^\/|\/$/g, '');
  } catch {
    return '';
  }
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = (currentUrl, redirects = 0) => {
      if (redirects > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      client.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location, redirects + 1);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };

    request(url);
  });
}

async function uploadToImageKit(buffer, fileName) {
  const result = await imagekit.upload({
    file: buffer.toString('base64'),
    fileName,
    folder: '/DTPS-Ecommerce/blogs/wp-restored/',
    useUniqueFileName: true,
  });

  return result.url;
}

async function main() {
  console.log('📖 Reading WordPress export...');
  const xml = fs.readFileSync(XML_FILE, 'utf8');
  const items = parseWPXml(xml);

  const posts = items.filter((item) => item.postType === 'post');
  const attachments = items.filter((item) => item.postType === 'attachment');
  const attachmentMap = Object.fromEntries(
    attachments
      .filter((item) => item.postId && item.attachmentUrl)
      .map((item) => [item.postId, item.attachmentUrl])
  );

  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  console.log('🔗 Connected to MongoDB.');

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const post of posts) {
    const slug = slugFromLink(post.link);
    const imageUrl = post.thumbnailId ? attachmentMap[post.thumbnailId] : '';

    if (!slug || !imageUrl) {
      skipped++;
      continue;
    }

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      skipped++;
      continue;
    }

    const fileName = path.basename(new URL(imageUrl).pathname);
    console.log(`📷 Restoring ${slug}`);

    try {
      const buffer = await downloadBuffer(imageUrl);
      const uploadedUrl = await uploadToImageKit(buffer, fileName);
      await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: uploadedUrl } });
      console.log(`   ✅ ${uploadedUrl}`);
      updated++;
    } catch (error) {
      console.log(`   ❌ ${error.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭ Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log('════════════════════════════════');

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});
/**
 * WordPress XML → MongoDB Blog Import Script
 * Downloads images to ImageKit, inserts blog posts into the DTPS MongoDB.
 *
 * Usage:  node scripts/import-wp-blogs.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const ImageKit = require('imagekit');

/* ─── Config (from .env) ─── */
const envPath = path.join(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');
function env(key) {
  const m = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : '';
}

const MONGODB_URI = env('MONGODB_URI');
const IK_PUBLIC  = env('IMAGEKIT_PUBLIC_KEY');
const IK_PRIVATE = env('IMAGEKIT_PRIVATE_KEY');
const IK_URL     = env('IMAGEKIT_URL_ENDPOINT');

if (!MONGODB_URI) { console.error('Missing MONGODB_URI'); process.exit(1); }

const imagekit = new ImageKit({
  publicKey: IK_PUBLIC,
  privateKey: IK_PRIVATE,
  urlEndpoint: IK_URL,
});

/* ─── Blog Schema (mirrors models/Blog.ts) ─── */
const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, lowercase: true },
  excerpt: { type: String, default: '' },
  content: String,
  featuredImage: { type: String, default: '' },
  category: { type: String, default: 'Health & Nutrition' },
  tags: [String],
  author: { type: String, default: 'Dietitian Poonam Sagar' },
  readTime: { type: String, default: '5 min read' },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const Blog = mongoose.model('Blog', BlogSchema);

/* ─── XML helpers ─── */
const XML_FILE = path.join(
  require('os').homedir(),
  'Downloads',
  'dtpoonamsagarhealthampnutritionprivatelimited.WordPress.2026-04-20.xml'
);

function cdata(str) {
  // Extract CDATA content or raw text
  const m = str.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return m ? m[1] : str;
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const m = xml.match(re);
  return m ? cdata(m[1]) : '';
}

function extractAllTags(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) results.push(cdata(m[1]));
  return results;
}

/* ─── Parse WP XML ─── */
function parseWPXml(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const postType = extractTag(block, 'wp:post_type');
    const postId = extractTag(block, 'wp:post_id');
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const creator = extractTag(block, 'dc:creator');
    const content = extractTag(block, 'content:encoded');
    const excerpt = extractTag(block, 'excerpt:encoded');
    const status = extractTag(block, 'wp:status');
    const attachmentUrl = extractTag(block, 'wp:attachment_url');
    const postParent = extractTag(block, 'wp:post_parent');

    // Extract categories
    const catRe = /<category[^>]*domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
    const categories = [];
    let cm;
    while ((cm = catRe.exec(block)) !== null) categories.push(cm[1]);

    // Extract tags
    const tagRe = /<category[^>]*domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g;
    const tags = [];
    let tm;
    while ((tm = tagRe.exec(block)) !== null) tags.push(tm[1]);

    // Extract _thumbnail_id
    const thumbRe = /<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[(\d+)\]\]><\/wp:meta_value>/;
    const thumbMatch = block.match(thumbRe);
    const thumbnailId = thumbMatch ? thumbMatch[1] : null;

    items.push({
      postId, postType, title, link, pubDate, creator, content, excerpt,
      status, attachmentUrl, postParent, categories, tags, thumbnailId,
    });
  }
  return items;
}

/* ─── Strip WP block comments, clean content ─── */
function cleanContent(html) {
  if (!html) return '';
  let cleaned = html
    // Remove WP block comments
    .replace(/<!-- \/?wp:[^>]*-->/g, '')
    // Remove empty class attributes from WP
    .replace(/ class="wp-block-[^"]*"/g, '')
    // Fix double line breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned;
}

/* ─── Slug from WP link ─── */
function slugFromLink(link) {
  try {
    const url = new URL(link);
    return url.pathname.replace(/^\/|\/$/g, '') || '';
  } catch {
    return '';
  }
}

/* ─── Calculate read time ─── */
function calcReadTime(html) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
  const words = text.split(' ').length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

/* ─── Generate excerpt from content ─── */
function generateExcerpt(html, maxLen = 160) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

/* ─── Download file as buffer ─── */
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const doRequest = (reqUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      client.get(reqUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doRequest(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    doRequest(url);
  });
}

/* ─── Upload to ImageKit ─── */
async function uploadToImageKit(buffer, fileName) {
  const result = await imagekit.upload({
    file: buffer.toString('base64'),
    fileName: fileName,
    folder: '/DTPS-Ecommerce/blogs/wp-import/',
    useUniqueFileName: true,
  });
  return result.url;
}

/* ─── MAIN ─── */
async function main() {
  console.log('📖 Reading WordPress XML…');
  const xml = fs.readFileSync(XML_FILE, 'utf8');
  const items = parseWPXml(xml);

  const posts = items.filter((i) => i.postType === 'post');
  const attachments = items.filter((i) => i.postType === 'attachment');
  console.log(`   Found ${posts.length} posts, ${attachments.length} attachments`);

  // Build attachment map: postId → attachmentUrl
  const attachMap = {};
  for (const att of attachments) {
    attachMap[att.postId] = att.attachmentUrl;
  }

  // Connect to MongoDB
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  console.log('   Connected.');

  // Check which slugs already exist to skip duplicates
  const existingSlugs = new Set(
    (await Blog.find({}, { slug: 1 }).lean()).map((b) => b.slug)
  );

  let imported = 0;
  let skipped = 0;
  let imgUploaded = 0;
  let imgFailed = 0;

  for (const post of posts) {
    const slug = slugFromLink(post.link);
    if (!slug) { console.log(`   ⚠ Skipping "${post.title}" — no slug`); skipped++; continue; }
    if (existingSlugs.has(slug)) { console.log(`   ⏭ Skipping "${post.title}" — slug exists`); skipped++; continue; }

    const cleanedContent = cleanContent(post.content);
    const excerpt = post.excerpt ? cleanContent(post.excerpt) : generateExcerpt(cleanedContent);
    const readTime = calcReadTime(cleanedContent);
    const isPublished = post.status === 'publish';
    const category = post.categories.length > 0 && post.categories[0] !== 'Uncategorized'
      ? post.categories[0]
      : 'Health & Nutrition';

    // ── Featured image ──
    let featuredImage = '';
    if (post.thumbnailId && attachMap[post.thumbnailId]) {
      const imgUrl = attachMap[post.thumbnailId];
      const fileName = path.basename(new URL(imgUrl).pathname);
      console.log(`   📷 Downloading "${fileName}"…`);
      try {
        const buf = await downloadBuffer(imgUrl);
        featuredImage = await uploadToImageKit(buf, fileName);
        imgUploaded++;
        console.log(`      ✅ Uploaded → ${featuredImage}`);
      } catch (err) {
        console.log(`      ❌ Failed: ${err.message}`);
        imgFailed++;
      }
    }

    // ── Upload inline images from content to ImageKit & rewrite URLs ──
    let finalContent = cleanedContent;
    const inlineImgRe = /https?:\/\/dtpoonamsagar\.com\/wp-content\/uploads\/[^\s"'<>]+/g;
    const inlineImgs = [...new Set(finalContent.match(inlineImgRe) || [])];

    for (const wpImgUrl of inlineImgs) {
      const fn = path.basename(new URL(wpImgUrl).pathname);
      try {
        const buf = await downloadBuffer(wpImgUrl);
        const ikUrl = await uploadToImageKit(buf, fn);
        finalContent = finalContent.split(wpImgUrl).join(ikUrl);
        imgUploaded++;
        console.log(`      📎 Inline image → ${ikUrl}`);
      } catch (err) {
        console.log(`      ⚠ Inline image failed (${fn}): ${err.message}`);
        imgFailed++;
      }
    }

    // ── Create blog document ──
    const doc = new Blog({
      title: post.title,
      slug,
      excerpt,
      content: finalContent,
      featuredImage: featuredImage || undefined,
      category,
      tags: post.tags.length > 0 ? post.tags : [category],
      author: 'Dietitian Poonam Sagar',
      readTime,
      published: isPublished,
      featured: false,
      views: 0,
    });

    await doc.save();
    imported++;
    console.log(`   ✅ [${imported}] "${post.title}" (${isPublished ? 'published' : 'draft'})`);
  }

  console.log('\n════════════════════════════════');
  console.log(`✅ Imported:      ${imported}`);
  console.log(`⏭ Skipped:       ${skipped}`);
  console.log(`📷 Images up:     ${imgUploaded}`);
  console.log(`❌ Images failed: ${imgFailed}`);
  console.log('════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

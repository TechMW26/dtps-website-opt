/**
 * Fix blog authors (random Indian names) + generate AI images via pollinations.ai
 * and upload to ImageKit for blogs missing featured images.
 *
 * Usage: node scripts/fix-blogs-authors-images.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const ImageKit = require('imagekit');

/* ─── Config ─── */
const envPath = path.join(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');
function env(key) {
  const m = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : '';
}

const MONGODB_URI = env('MONGODB_URI');
const imagekit = new ImageKit({
  publicKey: env('IMAGEKIT_PUBLIC_KEY'),
  privateKey: env('IMAGEKIT_PRIVATE_KEY'),
  urlEndpoint: env('IMAGEKIT_URL_ENDPOINT'),
});

/* ─── Blog Schema ─── */
const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, lowercase: true },
  excerpt: String,
  content: String,
  featuredImage: String,
  category: String,
  tags: [String],
  author: String,
  readTime: String,
  published: Boolean,
  featured: Boolean,
  views: Number,
}, { timestamps: true });

const Blog = mongoose.model('Blog', BlogSchema);

/* ─── Indian author names ─── */
const AUTHORS = [
  'Priya Sharma', 'Meera Patel', 'Ananya Gupta', 'Kavita Singh', 'Nisha Verma',
  'Ritu Agarwal', 'Sunita Reddy', 'Deepa Joshi', 'Pooja Mehta', 'Shalini Nair',
  'Aditi Kapoor', 'Neha Malhotra', 'Swati Tiwari', 'Anjali Deshmukh', 'Divya Iyer',
];

function randomAuthor(exclude) {
  const pool = exclude ? AUTHORS.filter(a => a !== exclude) : AUTHORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─── Download buffer with redirect support ─── */
function downloadBuffer(url, timeout = 90000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Download timeout')), timeout);
    const doReq = (reqUrl, redirects = 0) => {
      if (redirects > 8) { clearTimeout(timer); return reject(new Error('Too many redirects')); }
      const client = reqUrl.startsWith('https') ? https : http;
      const req = client.get(reqUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'image/*,*/*',
        },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doReq(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) { clearTimeout(timer); return reject(new Error(`HTTP ${res.statusCode}`)); }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => { clearTimeout(timer); resolve(Buffer.concat(chunks)); });
        res.on('error', e => { clearTimeout(timer); reject(e); });
      });
      req.on('error', e => { clearTimeout(timer); reject(e); });
      req.on('timeout', () => { req.destroy(); clearTimeout(timer); reject(new Error('Socket timeout')); });
    };
    doReq(url);
  });
}

/* ─── Retry wrapper ─── */
async function downloadWithRetry(url, retries = 2, delay = 20000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await downloadBuffer(url);
    } catch (err) {
      if (i < retries && (err.message.includes('429') || err.message.includes('timeout'))) {
        console.log(`      ⏳ Retry ${i + 1}/${retries} after ${delay / 1000}s…`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

/* ─── Upload to ImageKit ─── */
async function uploadToImageKit(buffer, fileName) {
  const result = await imagekit.upload({
    file: buffer.toString('base64'),
    fileName,
    folder: '/DTPS-Ecommerce/blogs/ai-generated/',
    useUniqueFileName: true,
  });
  return result.url;
}

/* ─── Generate AI image prompt from blog title ─── */
function makeImagePrompt(title) {
  const cleaned = title
    .replace(/[?!:.|–—"]/g, '')
    .replace(/DTPS\s*(Explains|Insights)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 80);
  return `healthy Indian food nutrition ${cleaned}, professional blog cover, vibrant, 16:9`;
}

/* ─── MAIN ─── */
async function main() {
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  console.log('   Connected.\n');

  const blogs = await Blog.find({}).lean();
  console.log(`Found ${blogs.length} total blogs.\n`);

  /* ── STEP 1: Skip — authors already fixed ── */
  console.log('═══ STEP 1: Authors already fixed (skipping) ═══\n');

  /* ── STEP 2: Generate AI images for blogs without featured images ── */
  console.log('═══ STEP 2: Generating AI Images ═══');
  const DEFAULT_IMG = 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/blogs/default-blog-image.jpg';
  const blogsNeedImage = await Blog.find({
    $or: [
      { featuredImage: { $exists: false } },
      { featuredImage: '' },
      { featuredImage: null },
      { featuredImage: DEFAULT_IMG },
    ]
  }).lean();

  console.log(`   ${blogsNeedImage.length} blogs need images.\n`);

  let imagesUploaded = 0;
  let imagesFailed = 0;

  for (const blog of blogsNeedImage) {
    const prompt = makeImagePrompt(blog.title);
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&seed=${Math.floor(Math.random() * 99999)}&nologo=true`;

    console.log(`   🎨 [${blogsNeedImage.indexOf(blog) + 1}/${blogsNeedImage.length}] "${blog.title.substring(0, 55)}…"`);

    try {
      const buf = await downloadWithRetry(pollinationsUrl, 2, 20000);
      if (buf.length < 10000) {
        throw new Error(`Image too small (${buf.length} bytes) — likely an error page`);
      }
      const slug = blog.slug || 'blog';
      const fileName = `${slug}-cover.jpg`;
      const ikUrl = await uploadToImageKit(buf, fileName);
      await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: ikUrl } });
      console.log(`      ✅ ${ikUrl}`);
      imagesUploaded++;
    } catch (err) {
      console.log(`      ❌ Failed: ${err.message}`);
      imagesFailed++;
    }

    // 15 second delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 15000));
  }

  console.log('\n════════════════════════════════');
  console.log(`🎨 Images uploaded:  ${imagesUploaded}`);
  console.log(`❌ Images failed:    ${imagesFailed}`);
  console.log('════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

/**
 * Generate AI images via pollinations.ai for blogs missing featured images.
 * Uses curl for reliable downloads and 30s delays to avoid rate limits.
 *
 * Usage: node scripts/generate-blog-images.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
  title: String, slug: String, excerpt: String, content: String,
  featuredImage: String, category: String, tags: [String], author: String,
  readTime: String, published: Boolean, featured: Boolean, views: Number,
}, { timestamps: true });

const Blog = mongoose.model('Blog', BlogSchema);

/* ─── Download image via curl (reliable HTTP/2 + redirect handling) ─── */
function downloadWithCurl(url, outputPath, timeoutSec = 120) {
  try {
    execSync(
      `curl -sL --max-time ${timeoutSec} -o "${outputPath}" "${url}"`,
      { stdio: 'pipe', timeout: (timeoutSec + 10) * 1000 }
    );
    const stat = fs.statSync(outputPath);
    if (stat.size < 5000) {
      throw new Error(`File too small (${stat.size} bytes)`);
    }
    return fs.readFileSync(outputPath);
  } catch (err) {
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw new Error(`curl failed: ${err.message}`);
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

/* ─── Build short prompt from title (max 4-5 words) ─── */
const PROMPT_MAP = {
  'thyroid': 'thyroid weight loss healthy diet',
  'fertility': 'fertility healthy food natural',
  'diet': 'healthy balanced Indian diet food',
  'bmi': 'body fitness healthy lifestyle',
  'ozempic': 'weight loss medicine nutrition',
  'energy drink': 'healthy beverages natural drinks',
  'bloat': 'gut health digestion food',
  'metabolism': 'metabolism boost healthy lifestyle',
  'pcos': 'PCOS healthy diet Indian food',
  'diwali': 'healthy Diwali Indian beverages',
  'wedding': 'wedding nutrition bridal glow food',
  'sweet': 'healthy Indian sweets dessert',
  'namkeen': 'healthy Indian snacks namkeen',
  'superfood': 'Indian superfoods ghee turmeric',
  'skin': 'clear skin nutrition healthy food',
  'bride': 'bridal nutrition healthy glow',
};

function makePrompt(title) {
  const lower = title.toLowerCase();
  for (const [key, prompt] of Object.entries(PROMPT_MAP)) {
    if (lower.includes(key)) return prompt;
  }
  return 'healthy Indian food nutrition';
}

/* ─── MAIN ─── */
async function main() {
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  console.log('   Connected.\n');

  const DEFAULT_IMG = 'https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/blogs/default-blog-image.jpg';
  const blogs = await Blog.find({
    $or: [
      { featuredImage: { $exists: false } },
      { featuredImage: '' },
      { featuredImage: null },
      { featuredImage: DEFAULT_IMG },
    ]
  }).lean();

  console.log(`📷 ${blogs.length} blogs need images.\n`);

  const tmpDir = '/tmp/blog-ai-imgs';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    const prompt = makePrompt(blog.title);
    const encoded = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 99999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=450&seed=${seed}&nologo=true`;
    const tmpFile = path.join(tmpDir, `${blog.slug || 'blog'}-${seed}.jpg`);

    console.log(`   🎨 [${i + 1}/${blogs.length}] "${blog.title.substring(0, 55)}…"`);

    try {
      const buf = downloadWithCurl(url, tmpFile, 120);
      const ikUrl = await uploadToImageKit(buf, `${blog.slug || 'blog'}-cover.jpg`);
      await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: ikUrl } });
      console.log(`      ✅ ${ikUrl}`);
      uploaded++;
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
      failed++;
    }

    // Clean up temp file
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    // 30 second delay to avoid rate limiting (except after last)
    if (i < blogs.length - 1) {
      console.log(`      ⏳ Waiting 30s…`);
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log('════════════════════════════════\n');

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

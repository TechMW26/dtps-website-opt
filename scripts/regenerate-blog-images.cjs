/**
 * Regenerate ALL blog AI images with Indian-face prompts.
 * Overwrites existing featuredImage for every blog.
 *
 * Usage: node scripts/regenerate-blog-images.cjs
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

/* ─── Download image via curl ─── */
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

/* ─── Prompts with Indian faces/people ─── */
const PROMPT_MAP = {
  'thyroid': 'Indian woman preparing healthy thyroid-friendly meal in modern kitchen, warm lighting, top-down food photography',
  'fertility': 'Indian couple eating colorful healthy fertility-boosting meal together, bright natural light, food photography',
  'what is diet': 'beautiful Indian thali with colorful balanced diet food, overhead flat lay, food photography, warm tones',
  'bmi': 'Indian fitness woman measuring waist with tape, healthy food on table, bright studio lighting',
  'ozempic': 'Indian doctor discussing weight loss medication with patient, modern clinic, warm professional lighting',
  'energy drink': 'Indian woman choosing between energy drink and fresh coconut water, bright kitchen, lifestyle photography',
  'bloat': 'Indian woman holding stomach with healthy probiotic foods on table, soft natural light, wellness photography',
  'metabolism': 'Indian woman doing yoga with healthy breakfast spread nearby, morning sunlight, lifestyle wellness photography',
  'pcos': 'Indian woman eating home-cooked ghar ka khana thali for PCOS management, warm kitchen setting, food photography',
  'diwali': 'Indian family enjoying healthy Diwali drinks and beverages, festive decorations, warm golden lighting',
  'wedding skin': 'beautiful Indian bride with glowing skin eating healthy food, bridal makeup, warm lighting portrait',
  'wedding': 'Indian bride with radiant skin and healthy food platter, bridal setting, golden hour warm photography',
  'sweet': 'Indian woman making healthy Diwali sweets ladoo in kitchen, festive setting, warm food photography',
  'namkeen': 'healthy Indian namkeen snacks in brass bowls with spices, overhead food photography, warm rustic tones',
  'superfood': 'Indian grandmother and granddaughter with ghee haldi chana superfoods, warm kitchen, lifestyle photography',
  'skin': 'Indian woman with clear glowing skin next to turmeric and healthy foods, beauty and wellness photography',
  'bride': 'Indian bride-to-be eating nutritious meal for bridal glow, elegant setting, soft warm portrait lighting',
  'ghar ka khana': 'Indian woman cooking traditional home food in kitchen, warm homely setting, lifestyle photography',
};

function makePrompt(title) {
  const lower = title.toLowerCase();
  for (const [key, prompt] of Object.entries(PROMPT_MAP)) {
    if (lower.includes(key)) return prompt;
  }
  return 'Indian woman enjoying healthy balanced meal, warm natural light, food and wellness photography';
}

/* ─── MAIN ─── */
async function main() {
  console.log('🔗 Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
  console.log('   Connected.\n');

  // Get ALL published blogs
  const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 }).lean();
  console.log(`📷 ${blogs.length} published blogs to regenerate images for.\n`);

  const tmpDir = '/tmp/blog-ai-imgs-v2';
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
    console.log(`      Prompt: ${prompt.substring(0, 70)}…`);

    try {
      const buf = downloadWithCurl(url, tmpFile, 120);
      const ikUrl = await uploadToImageKit(buf, `${blog.slug || 'blog'}-cover-v2.jpg`);
      await Blog.updateOne({ _id: blog._id }, { $set: { featuredImage: ikUrl } });
      console.log(`      ✅ ${ikUrl}`);
      uploaded++;
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
      failed++;
    }

    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

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

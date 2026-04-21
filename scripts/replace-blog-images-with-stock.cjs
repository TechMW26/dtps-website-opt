/**
 * Replace AI-generated blog covers with curated stock photos from Pexels.
 * Downloads the image, uploads it to ImageKit, and updates the blog document.
 *
 * Usage: node scripts/replace-blog-images-with-stock.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { MongoClient } = require('mongodb');
const ImageKit = require('imagekit');

const envPath = path.join(__dirname, '..', '.env');
const envText = fs.readFileSync(envPath, 'utf8');

function env(key) {
  const match = envText.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

const MONGO_URI = env('MONGODB_URI');
const imagekit = new ImageKit({
  publicKey: env('IMAGEKIT_PUBLIC_KEY'),
  privateKey: env('IMAGEKIT_PRIVATE_KEY'),
  urlEndpoint: env('IMAGEKIT_URL_ENDPOINT'),
});

const STOCK_BY_SLUG = {
  'desi-superfoods-that-outshine-any-facial-ghee-haldi-and-chana': 'https://images.pexels.com/photos/33709317/pexels-photo-33709317/free-photo-of-authentic-indian-cuisine-with-lentil-dishes.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'pre-wedding-nutrition-tips-every-bride-should-know-for-a-natural-glow': 'https://images.pexels.com/photos/29148133/pexels-photo-29148133/free-photo-of-traditional-indian-thali-meal-with-naan-bread.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'healthy-namkeen-recipes-that-dont-mess-with-your-weight': 'https://images.pexels.com/photos/8489804/pexels-photo-8489804.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'healthy-indian-sweet-recipes-for-gut-skin-dtps-diwali-special': 'https://images.pexels.com/photos/34217295/pexels-photo-34217295/free-photo-of-flat-lay-of-indian-stuffed-eggplants-on-dual-tone-background.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'what-to-eat-before-your-wedding-for-clear-skin-and-strong-hair': 'https://images.pexels.com/photos/26245461/pexels-photo-26245461/free-photo-of-bowls-of-appetizers-on-tray.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '4-healthier-beverages-for-the-festive-season-diwali-edition-by-dtps': 'https://images.pexels.com/photos/17223835/pexels-photo-17223835/free-photo-of-photo-of-a-meal-on-a-tray.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'is-your-slow-metabolism-actually-your-fault': 'https://images.pexels.com/photos/29066704/pexels-photo-29066704/free-photo-of-indian-breakfast-with-roti-and-chana-dish.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'why-do-i-feel-bloated-even-after-eating-healthy-explains-dtps': 'https://images.pexels.com/photos/12093415/pexels-photo-12093415.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '6-reasons-to-stop-drinking-energy-drinks-right-now-and-what-to-drink-instead': 'https://images.pexels.com/photos/35041652/pexels-photo-35041652/free-photo-of-indian-curry-and-garnishes-flat-lay-on-white-background.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'ozempic-for-weight-loss-reality-risks-and-myths': 'https://images.pexels.com/photos/12737912/pexels-photo-12737912.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'bmi-explained-why-this-common-health-metric-isnt-always-accurate': 'https://images.pexels.com/photos/12669168/pexels-photo-12669168.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'what-is-diet-learn-everything-about-a-perfect-diet': 'https://images.pexels.com/photos/36478888/pexels-photo-36478888/free-photo-of-traditional-indian-thali-with-roti-and-sabzi.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'can-diet-improve-your-fertility-naturally': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'can-thyroid-patients-lose-weight-without-extreme-diets': 'https://images.pexels.com/photos/28674705/pexels-photo-28674705/free-photo-of-indian-dal-and-rice-in-traditional-utensils.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'dtps-explains-how-ghar-ka-khana-help-with-pcos-diabetes-and-thyroid': 'https://images.pexels.com/photos/28674708/pexels-photo-28674708/free-photo-of-delicious-indian-dal-and-rice-with-herbs.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'do-you-gain-weight-after-stopping-ozempic-heres-the-truth': 'https://images.pexels.com/photos/11115801/pexels-photo-11115801.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'does-drinking-less-water-slow-down-your-weight-loss': 'https://images.pexels.com/photos/13823417/pexels-photo-13823417.jpeg?auto=compress&cs=tinysrgb&w=1200',
  '30-days-ghar-ka-khana-wedding-special-weight-loss-diet-plan-with-dtps': 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

function selectStock(slug) {
  return STOCK_BY_SLUG[slug] || 'https://images.pexels.com/photos/6544380/pexels-photo-6544380.jpeg?auto=compress&cs=tinysrgb&w=1200';
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadBuffer(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToImageKit(buffer, fileName) {
  const result = await imagekit.upload({
    file: buffer.toString('base64'),
    fileName,
    folder: '/DTPS-Ecommerce/blogs/stock-covers/',
    useUniqueFileName: true,
  });

  return result.url;
}

async function main() {
  console.log('🔗 Connecting to MongoDB...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db('DTPS-Ecommerce');

  const blogs = await db.collection('blogs').find({ published: true }).sort({ createdAt: -1 }).toArray();
  console.log(`📷 ${blogs.length} published blogs to update.\n`);

  let updated = 0;
  let failed = 0;

  for (const [index, blog] of blogs.entries()) {
    const imageUrl = selectStock(blog.slug);
    const fileName = `${blog.slug}-stock-cover.jpg`;
    const shortTitle = blog.title.length > 55 ? `${blog.title.slice(0, 55)}…` : blog.title;

    console.log(`   🖼️ [${index + 1}/${blogs.length}] ${shortTitle}`);

    try {
      const buffer = await downloadBuffer(imageUrl);
      const uploadedUrl = await uploadToImageKit(buffer, fileName);

      await db.collection('blogs').updateOne(
        { _id: blog._id },
        { $set: { featuredImage: uploadedUrl } }
      );

      console.log(`      ✅ ${uploadedUrl}`);
      updated++;
    } catch (error) {
      console.log(`      ❌ ${error.message}`);
      failed++;
    }
  }

  console.log('\n════════════════════════════════');
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log('════════════════════════════════');

  await client.close();
}

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});
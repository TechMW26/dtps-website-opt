/**
 * Fix deformed AI face images by regenerating with FOOD-ONLY prompts (no people/faces).
 * Pollinations.ai free tier can't do faces well, so we focus on food photography only.
 */
const { MongoClient } = require('mongodb');
const { execSync } = require('child_process');
const https = require('https');

const MONGO_URI = 'mongodb+srv://avirajsharma_db_user:NjqypCD9sr0JNxvi@dtpscluster.hjx2qyc.mongodb.net/DTPS-Ecommerce?retryWrites=true&w=majority';
const IK_PRIVATE = 'private_XeTyz2/wpwhzpvxNpEa9KNapjQY=';
const IK_FOLDER = '/DTPS-Ecommerce/blogs/ai-generated';

// Food-only prompts — NO people, NO faces
const FIXES = {
  'wedding': {
    prompt: 'beautiful Indian bridal food platter with turmeric haldi milk, almonds, fresh fruits, mehndi hands holding golden plate, decorated wedding table with marigold flowers, warm golden lighting, overhead food photography, no face',
  },
  'pre-wedding': {
    prompt: 'gorgeous Indian pre-wedding nutrition spread with fresh salads, dry fruits, coconut water, turmeric latte on brass tray with rose petals and bangles, warm golden hour lighting, food flat lay photography, no people',
  },
  'superfood': {
    prompt: 'desi superfoods ghee haldi chana dal in traditional brass bowls on wooden table with fresh turmeric roots and green leaves, warm kitchen lighting, overhead Indian food photography, no people',
  },
  'diwali-sweet': {
    prompt: 'healthy Indian Diwali sweets and mithai made with dates jaggery and nuts on decorated brass plate with diyas and rangoli, festive warm lighting, food photography, no people',
  },
  'diwali-drink': {
    prompt: 'healthy festive Indian Diwali drinks thandai rose milk golden turmeric latte in copper glasses with diyas marigolds and rangoli decorations, warm festive lighting, beverage photography, no people',
  },
  'metabolism': {
    prompt: 'healthy Indian breakfast spread with idli sambar poha upma fruits and green tea on wooden table, morning sunlight, overhead food photography, no people',
  },
  'bloated': {
    prompt: 'probiotic Indian foods curd raita buttermilk fermented pickles with fresh herbs and spices on rustic table, soft natural lighting, food photography, no people',
  },
  'energy-drink': {
    prompt: 'fresh Indian beverages nimbu pani coconut water jaljeera lassi vs energy drink cans, bright colorful contrast, product photography, no people',
  },
  'ozempic': {
    prompt: 'healthy weight loss Indian diet plate with measured portions dal roti sabzi salad and measuring tape, clean medical aesthetic, overhead food photography, no people',
  },
  'bmi': {
    prompt: 'balanced Indian diet thali with perfectly portioned dal rice roti vegetables raita and salad with measuring tape, bright clean photography, no people',
  },
  'thyroid': {
    prompt: 'thyroid-friendly Indian foods iodine rich seafood nuts seeds dairy coconut on banana leaf, warm natural lighting, overhead food photography, no people',
  },
  'pcod': {
    prompt: 'PCOD-friendly Indian diet foods whole grains green vegetables nuts seeds cinnamon fenugreek on wooden board, warm kitchen lighting, food photography, no people',
  },
  'diet': {
    prompt: 'beautiful colorful Indian thali with balanced diet food dal rice chapati sabzi raita salad chutney on banana leaf, vibrant overhead food photography, no people',
  },
  'calorie': {
    prompt: 'Indian diet foods with calorie counts written on small cards beside each dish, dal roti sabzi fruits, clean bright food photography, no people',
  },
  'weight-loss': {
    prompt: 'Indian weight loss meal prep containers with measured healthy food portions, dal quinoa grilled paneer salad, bright modern kitchen, food photography, no people',
  },
  'default': {
    prompt: 'healthy balanced Indian meal with colorful fresh vegetables dal rice and roti on traditional plate, warm natural lighting, food photography, no people',
  }
};

// Match blog slug to the right fix prompt
function getPrompt(slug, title) {
  const s = (slug + ' ' + title).toLowerCase();
  if (s.includes('pre-wedding')) return FIXES['pre-wedding'].prompt;
  if (s.includes('wedding') || s.includes('bride') || s.includes('bridal')) return FIXES['wedding'].prompt;
  if (s.includes('superfood') || s.includes('ghee') || s.includes('haldi') || s.includes('facial')) return FIXES['superfood'].prompt;
  if (s.includes('sweet') || s.includes('mithai') || s.includes('ladoo')) return FIXES['diwali-sweet'].prompt;
  if (s.includes('beverage') || s.includes('diwali') && s.includes('drink')) return FIXES['diwali-drink'].prompt;
  if (s.includes('metabolism')) return FIXES['metabolism'].prompt;
  if (s.includes('bloat')) return FIXES['bloated'].prompt;
  if (s.includes('energy drink')) return FIXES['energy-drink'].prompt;
  if (s.includes('ozempic')) return FIXES['ozempic'].prompt;
  if (s.includes('bmi')) return FIXES['bmi'].prompt;
  if (s.includes('thyroid')) return FIXES['thyroid'].prompt;
  if (s.includes('pcod') || s.includes('pcos')) return FIXES['pcod'].prompt;
  if (s.includes('diet') && s.includes('perfect')) return FIXES['diet'].prompt;
  if (s.includes('calorie')) return FIXES['calorie'].prompt;
  if (s.includes('weight') && s.includes('loss')) return FIXES['weight-loss'].prompt;
  return FIXES['default'].prompt;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function uploadToImageKit(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const fileData = fs.readFileSync(filePath);
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    let body = '';
    body += `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: image/jpeg\r\n\r\n`;
    const bodyEnd = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="fileName"\r\n\r\n${fileName}\r\n--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n${IK_FOLDER}\r\n--${boundary}\r\nContent-Disposition: form-data; name="useUniqueFileName"\r\n\r\ntrue\r\n--${boundary}--\r\n`;
    const payload = Buffer.concat([Buffer.from(body), fileData, Buffer.from(bodyEnd)]);

    const options = {
      hostname: 'upload.imagekit.io',
      path: '/api/v1/files/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Authorization': 'Basic ' + Buffer.from(IK_PRIVATE + ':').toString('base64'),
      },
    };

    const req = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { reject(new Error(d)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('🔗 Connecting to MongoDB…');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('   Connected.\n');
  const db = client.db('DTPS-Ecommerce');

  const blogs = await db.collection('blogs').find({ published: true }).toArray();
  console.log(`📷 ${blogs.length} published blogs to fix.\n`);

  let ok = 0, fail = 0;

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    const shortTitle = blog.title.length > 55 ? blog.title.slice(0, 55) + '…' : blog.title;
    console.log(`   🎨 [${i + 1}/${blogs.length}] "${shortTitle}"`);

    const prompt = getPrompt(blog.slug, blog.title);
    console.log(`      Prompt: ${prompt.slice(0, 70)}…`);

    const seed = Math.floor(Math.random() * 99999);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&seed=${seed}&nologo=true`;
    const tmpFile = `/tmp/fix-blog-${i}.jpg`;

    try {
      // Download with curl (more reliable)
      execSync(`curl -sL -o "${tmpFile}" --max-time 180 "${url}"`, { timeout: 200000 });

      // Verify it's an actual image
      const fileInfo = execSync(`file "${tmpFile}"`).toString();
      if (!fileInfo.includes('image') && !fileInfo.includes('JPEG') && !fileInfo.includes('PNG')) {
        console.log(`      ❌ Not a valid image (${fileInfo.trim()})`);
        fail++;
        await sleep(15000);
        continue;
      }

      const fileName = blog.slug + '-cover-v3.jpg';
      const result = await uploadToImageKit(tmpFile, fileName);

      if (result.url) {
        await db.collection('blogs').updateOne(
          { _id: blog._id },
          { $set: { featuredImage: result.url } }
        );
        console.log(`      ✅ ${result.url}`);
        ok++;
      } else {
        console.log(`      ❌ Upload failed: ${JSON.stringify(result).slice(0, 100)}`);
        fail++;
      }
    } catch (err) {
      console.log(`      ❌ Error: ${err.message.slice(0, 100)}`);
      fail++;
    }

    if (i < blogs.length - 1) {
      console.log(`      ⏳ Waiting 35s…`);
      await sleep(35000);
    }
  }

  console.log(`\n✅ Done! ${ok} uploaded, ${fail} failed.`);
  await client.close();
  process.exit(0);
})();

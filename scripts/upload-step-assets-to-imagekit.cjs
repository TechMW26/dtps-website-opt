const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');

const envPath = path.join(__dirname, '..', '.env');
const envRaw = fs.readFileSync(envPath, 'utf8');

for (const line of envRaw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }
    process.env[key] = val;
}

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('Missing IMAGEKIT credentials in .env');
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const base = path.join(__dirname, '..', 'public', 'images');
const files = [
    { local: 'icondiv1.png', name: 'step-icon-choose-plan-v2.png' },
    { local: 'icondiv2.png', name: 'step-icon-counsellor-connect-v2.png' },
    { local: 'icondiv3.png', name: 'step-icon-dietitian-assessment-v2.png' },
    { local: 'icondiv4.png', name: 'step-icon-plan-delivery-v2.png' },
    { local: 'icondiv5.png', name: 'step-icon-followups-tracking-v2.png' },
    { local: 'Lines.png', name: 'step-connector-dashed-arrow-v2.png' },
];

(async () => {
    for (const f of files) {
        const sourcePath = path.join(base, f.local);
        const data = fs.readFileSync(sourcePath);
        const res = await imagekit.upload({
            file: data,
            fileName: f.name,
            folder: '/DTPS-Ecommerce/static/home/how-it-work',
            useUniqueFileName: false,
            tags: ['home', 'how-it-work', 'steps', 'v2'],
        });

        console.log(`${f.name} => ${res.url}`);
    }
})();

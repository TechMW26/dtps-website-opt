const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const ImageKit = require('imagekit');
const { readFileSync, writeFileSync } = require('fs');
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

const ik = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const ids = [
    '69b7c6b6a14dfc9fbf5ad565',
    '69b7c6e6a14dfc9fbf5ad596',
    '69b7c725a14dfc9fbf5ad6fc',
    '69b7c6e6a14dfc9fbf5ad598',
    '69b7c713a14dfc9fbf5ad6b7',
    '69b7c714a14dfc9fbf5ad6c0',
];

(async () => {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('DTPS-Ecommerce');
    const bucket = new GridFSBucket(db, { bucketName: 'images' });
    const mappingPath = path.join(ROOT, 'scripts', 'gridfs-imagekit-mapping.json');
    const mapping = JSON.parse(readFileSync(mappingPath, 'utf-8'));

    for (const id of ids) {
        const oldUrl = '/api/images/' + id;
        if (mapping[oldUrl]) {
            console.log('Skip', id);
            continue;
        }
        const oid = new ObjectId(id);
        const files = await bucket.find({ _id: oid }).toArray();
        if (files.length === 0) {
            console.log('Not found:', id);
            continue;
        }
        const f = files[0];
        const ct = (f.metadata && f.metadata.contentType) || 'image/jpeg';
        const ext = ct.includes('png') ? '.png' : ct.includes('webp') ? '.webp' : '.jpg';
        const stream = bucket.openDownloadStream(oid);
        const chunks = [];
        for await (const c of stream) chunks.push(c);
        const buf = Buffer.concat(chunks);
        console.log('Downloaded', id, (buf.length / 1024).toFixed(1) + 'KB');
        const res = await ik.upload({
            file: buf,
            fileName: 'gridfs-' + id + ext,
            folder: '/DTPS-Ecommerce/static',
            useUniqueFileName: false,
            tags: ['gridfs-migration', 'static'],
        });
        mapping[oldUrl] = res.url;
        console.log('Uploaded:', res.url);
        writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    }
    await client.close();
    console.log('Done uploading. Now replacing in files...');

    // Replace in pcod/page.tsx
    const pcodPath = path.join(ROOT, 'app', 'pcod', 'page.tsx');
    let content = readFileSync(pcodPath, 'utf-8');
    let count = 0;
    for (const [old, newUrl] of Object.entries(mapping)) {
        if (content.includes(old)) {
            content = content.split(old).join(newUrl);
            count++;
        }
    }
    writeFileSync(pcodPath, content);
    console.log('Replaced', count, 'URLs in pcod/page.tsx');
})();

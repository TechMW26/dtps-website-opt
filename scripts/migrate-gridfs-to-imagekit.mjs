/**
 * Migration script: GridFS images → ImageKit CDN
 * 
 * Downloads all hardcoded GridFS images from MongoDB and uploads them to ImageKit.
 * Outputs a JSON mapping file that maps old /api/images/ID URLs to new ImageKit URLs.
 * 
 * Usage: node scripts/migrate-gridfs-to-imagekit.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId, GridFSBucket } from 'mongodb';
import ImageKit from 'imagekit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env manually
function loadEnv() {
    const envPath = resolve(ROOT, '.env');
    if (!existsSync(envPath)) throw new Error('.env file not found');
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (!MONGODB_URI) throw new Error('MONGODB_URI not set');
if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit env vars not set');
}

const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

// All unique GridFS file IDs extracted from the codebase
const FILE_IDS = [
    '69b7c66ea14dfc9fbf5ad4ef', // Hero image
    '69b7c675a14dfc9fbf5ad523', // Logo (Navbar + Footer)
    '69b7c64aa14dfc9fbf5ad48f', // ExpertGuidance card
    '69b7c6f2a14dfc9fbf5ad5ea', // ExpertGuidance card
    '69b7c6eaa14dfc9fbf5ad5ba', // ExpertGuidance card
    '69b7c662a14dfc9fbf5ad4d0', // ExpertGuidance gallery
    '69b7c64aa14dfc9fbf5ad48d', // ExpertGuidance gallery
    '69b7c659a14dfc9fbf5ad4bc', // ExpertGuidance gallery
    '69b7c649a14dfc9fbf5ad48b', // ExpertGuidance gallery
    '69b7c668a14dfc9fbf5ad4dd', // ExpertGuidance gallery
    '69b7c6f6a14dfc9fbf5ad602', // ExpertGuidance
    '69b7c6ffa14dfc9fbf5ad639', // OurTeam
    '69b7c65ca14dfc9fbf5ad4c4', // OurTeam
    '69b7c701a14dfc9fbf5ad644', // OurTeam
    '69b7c707a14dfc9fbf5ad665', // OurTeam
    '69b7c6e9a14dfc9fbf5ad5a5', // OurTeam main
    '69b7c789a14dfc9fbf5ad89e', // OurExpertise
    '69b7c765a14dfc9fbf5ad807', // FAQ
    '69b7c75da14dfc9fbf5ad7e2', // FAQ
    '69b7c659a14dfc9fbf5ad4be', // WhatWeDo
    '69b7c65ba14dfc9fbf5ad4c1', // WhatWeDo
    '69b7c909bfd19f93f09dc3e7', // page.tsx services
    '69b7c909bfd19f93f09dc3e9', // page.tsx services
    '69b7c909bfd19f93f09dc3eb', // page.tsx services
    '69b7c6f2a14dfc9fbf5ad5ec', // page.tsx
    '69b7c909bfd19f93f09dc3e3', // Recognition default
    '69b7c909bfd19f93f09dc3e1', // Testimonial default
    '69b7c908bfd19f93f09dc3df', // Blog default
    '69b7c909bfd19f93f09dc3e5', // Transformation default
    // weight-loss page
    '69b7c744a14dfc9fbf5ad78c',
    '69b7c744a14dfc9fbf5ad78e',
    '69b7c75ca14dfc9fbf5ad7de',
    '69b7c66ea14dfc9fbf5ad4f4',
    '69b7c6b6a14dfc9fbf5ad567',
    '69b7c6caa14dfc9fbf5ad56f',
    '69b7c729a14dfc9fbf5ad70f',
    '69b7c710a14dfc9fbf5ad6a4',
    '69b7c711a14dfc9fbf5ad6ab',
    '69b7c732a14dfc9fbf5ad73f',
    '69b7c73ca14dfc9fbf5ad766',
    // therapeutic page
    '69b7c711a14dfc9fbf5ad6ad',
    '69b7c6faa14dfc9fbf5ad61a',
    '69b7c725a14dfc9fbf5ad6fa',
    '69b7c719a14dfc9fbf5ad6d5',
    '69b7c70fa14dfc9fbf5ad69d',
    '69b7c674a14dfc9fbf5ad51f',
    '69b7c674a14dfc9fbf5ad521',
    '69b7c6b3a14dfc9fbf5ad562',
    '69b7c66fa14dfc9fbf5ad4fe',
    '69b7c66da14dfc9fbf5ad4ed',
    '69b7c70ea14dfc9fbf5ad693',
    '69b7c70ea14dfc9fbf5ad697',
    '69b7c70ea14dfc9fbf5ad68f',
    '69b7c70ea14dfc9fbf5ad695',
    '69b7c6e6a14dfc9fbf5ad59a',
    '69b7c726a14dfc9fbf5ad702',
    '69b7c70ca14dfc9fbf5ad684',
    '69b7c70aa14dfc9fbf5ad679',
    // pcod page
    '69b7c70ea14dfc9fbf5ad691',
    '69b7c6ffa14dfc9fbf5ad637',
    '69b7c70ea14dfc9fbf5ad699',
    '69b7c709a14dfc9fbf5ad677',
    '69b7c70fa14dfc9fbf5ad69f',
    '69b7c712a14dfc9fbf5ad6b5',
    '69b7c711a14dfc9fbf5ad6af',
    '69b7c669a14dfc9fbf5ad4e3',
    '69b7c68ba14dfc9fbf5ad53d',
    '69b7c6d1a14dfc9fbf5ad572',
    '69b7c66fa14dfc9fbf5ad500',
    '69b7c6faa14dfc9fbf5ad61c',
    '69b7c707a14dfc9fbf5ad663',
    '69b7c719a14dfc9fbf5ad6d7',
    '69b7c71fa14dfc9fbf5ad6ec',
    '69b7c654a14dfc9fbf5ad4ad',
    // wedding page
    '69b7c727a14dfc9fbf5ad706',
    '69b7c70fa14dfc9fbf5ad6a1',
    '69b7c709a14dfc9fbf5ad671',
    '69b7c66fa14dfc9fbf5ad4f6',
    '69b7c6e6a14dfc9fbf5ad594',
    '69b7c6b3a14dfc9fbf5ad560',
    '69b7c716a14dfc9fbf5ad6c9',
    '69b7c70fa14dfc9fbf5ad69b',
    '69b7c6e9a14dfc9fbf5ad5a3',
    '69b7c66fa14dfc9fbf5ad4fa',
];

// Deduplicate
const uniqueIds = [...new Set(FILE_IDS)];

async function main() {
    const mappingPath = resolve(ROOT, 'scripts', 'gridfs-imagekit-mapping.json');

    // Resume from previous run if mapping exists
    let mapping = {};
    if (existsSync(mappingPath)) {
        mapping = JSON.parse(readFileSync(mappingPath, 'utf-8'));
        console.log(`Resuming: ${Object.keys(mapping).length} already migrated`);
    }

    console.log(`Connecting to MongoDB...`);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log(`Connected!`);

    const db = client.db('DTPS-Ecommerce');
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const fileId of uniqueIds) {
        const oldUrl = `/api/images/${fileId}`;

        // Skip if already migrated
        if (mapping[oldUrl]) {
            skipped++;
            continue;
        }

        try {
            // Download from GridFS
            const objectId = new ObjectId(fileId);
            const files = await bucket.find({ _id: objectId }).toArray();

            if (files.length === 0) {
                console.warn(`⚠️  File not found: ${fileId}`);
                failed++;
                continue;
            }

            const file = files[0];
            const contentType = file.metadata?.contentType || 'image/jpeg';
            const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : contentType.includes('svg') ? '.svg' : '.jpg';

            const stream = bucket.openDownloadStream(objectId);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            console.log(`📥 Downloaded ${fileId} (${(buffer.length / 1024).toFixed(1)} KB)`);

            // Upload to ImageKit
            const fileName = `gridfs-${fileId}${ext}`;
            const response = await imagekit.upload({
                file: buffer,
                fileName,
                folder: '/DTPS-Ecommerce/static',
                useUniqueFileName: false,
                tags: ['gridfs-migration', 'static'],
            });

            mapping[oldUrl] = response.url;
            success++;
            console.log(`✅ Uploaded: ${response.url}`);

            // Save mapping after each successful upload (resume-friendly)
            writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
        } catch (err) {
            console.error(`❌ Failed ${fileId}: ${err.message}`);
            failed++;
        }
    }

    await client.close();

    writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`\n=== Migration Complete ===`);
    console.log(`✅ Success: ${success}`);
    console.log(`⏭️  Skipped (already done): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\nMapping saved to: ${mappingPath}`);
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});

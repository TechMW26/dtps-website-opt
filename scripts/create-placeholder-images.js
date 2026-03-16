/**
 * Create and upload placeholder/default images to GridFS for fallback references.
 * These images previously didn't exist on disk.
 *
 * Usage: node scripts/create-placeholder-images.js
 */

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const match = line.match(/^([A-Z_]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2].trim();
        }
    }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set.');
    process.exit(1);
}

const DB_NAME = 'DTPS-Ecommerce';
const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');

// 1x1 transparent PNG (smallest valid PNG)
const PLACEHOLDER_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
);

// 1x1 white JPEG
const PLACEHOLDER_JPG = Buffer.from(
    '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AKwA//',
    'base64'
);

const PLACEHOLDERS = [
    { path: '/api/images/69b7c908bfd19f93f09dc3df', filename: 'default-blog.png', buffer: PLACEHOLDER_PNG, mime: 'image/png' },
    { path: '/api/images/69b7c909bfd19f93f09dc3e1', filename: 'default-avatar.png', buffer: PLACEHOLDER_PNG, mime: 'image/png' },
    { path: '/api/images/69b7c909bfd19f93f09dc3e3', filename: 'default-award.png', buffer: PLACEHOLDER_PNG, mime: 'image/png' },
    { path: '/api/images/69b7c909bfd19f93f09dc3e5', filename: 'placeholder.jpg', buffer: PLACEHOLDER_JPG, mime: 'image/jpeg' },
    { path: '/api/images/69b7c909bfd19f93f09dc3e7', filename: 'testimonial-1.jpg', buffer: PLACEHOLDER_JPG, mime: 'image/jpeg' },
    { path: '/api/images/69b7c909bfd19f93f09dc3e9', filename: 'testimonial-2.jpg', buffer: PLACEHOLDER_JPG, mime: 'image/jpeg' },
    { path: '/api/images/69b7c909bfd19f93f09dc3eb', filename: 'testimonial-3.jpg', buffer: PLACEHOLDER_JPG, mime: 'image/jpeg' },
];

async function main() {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    const mapping = fs.existsSync(MAPPING_FILE) ? JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8')) : [];
    const existingPaths = new Set(mapping.map((m) => m.originalPath));

    for (const ph of PLACEHOLDERS) {
        if (existingPaths.has(ph.path)) {
            console.log(`⏭️  Already exists: ${ph.path}`);
            continue;
        }

        const uploadStream = bucket.openUploadStream(ph.filename, {
            contentType: ph.mime,
            metadata: { originalFilename: ph.filename, originalPath: ph.path, mimeType: ph.mime, placeholder: true, uploadedAt: new Date() },
        });

        await new Promise((resolve, reject) => {
            uploadStream.on('error', reject);
            uploadStream.on('finish', resolve);
            uploadStream.end(ph.buffer);
        });

        const entry = {
            originalPath: ph.path,
            filename: ph.filename,
            gridfsId: uploadStream.id.toString(),
            newUrl: `/api/images/${uploadStream.id.toString()}`,
        };
        mapping.push(entry);
        console.log(`✅ Created placeholder: ${ph.path} → ${entry.newUrl}`);
    }

    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`\n📋 Mapping updated (${mapping.length} entries total)`);

    await mongoose.disconnect();
    console.log('✅ Done!');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

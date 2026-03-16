/**
 * Migration script: Upload all images from public/images, public/img, public/assets
 * into MongoDB GridFS and create a mapping file.
 *
 * Usage: node scripts/migrate-images-to-gridfs.js
 *
 * Idempotent: skips files already migrated (based on mapping file).
 */

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env file
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
    console.error('❌ MONGODB_URI not set. Add it to .env or pass as environment variable.');
    process.exit(1);
}
const DB_NAME = 'DTPS-Ecommerce';
const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');

const IMAGE_DIRS = [
    path.join(__dirname, '..', 'public', 'images'),
    path.join(__dirname, '..', 'public', 'img'),
    path.join(__dirname, '..', 'public', 'assets'),
];

const IMAGE_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico', '.bmp', '.tiff',
]);

const MIME_TYPES = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.avif': 'image/avif',
};

function getAllImageFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getAllImageFiles(fullPath));
        } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            results.push(fullPath);
        }
    }
    return results;
}

function getPublicPath(filePath) {
    const publicDir = path.join(__dirname, '..', 'public');
    return '/' + path.relative(publicDir, filePath);
}

function loadExistingMapping() {
    if (fs.existsSync(MAPPING_FILE)) {
        return JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    }
    return [];
}

async function uploadFile(bucket, filePath, filename) {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: mimeType,
            metadata: {
                originalFilename: filename,
                originalPath: getPublicPath(filePath),
                mimeType,
                uploadedAt: new Date(),
            },
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.end(buffer);
    });
}

async function main() {
    console.log('🚀 Starting image migration to GridFS...');
    console.log(`📦 MongoDB: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log(`📁 Scanning directories: ${IMAGE_DIRS.join(', ')}\n`);

    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    // Gather all image files
    const allFiles = [];
    for (const dir of IMAGE_DIRS) {
        const files = getAllImageFiles(dir);
        allFiles.push(...files);
    }

    console.log(`📷 Found ${allFiles.length} image files to process\n`);

    // Load existing mapping for idempotency
    const existingMapping = loadExistingMapping();
    const alreadyMigrated = new Set(existingMapping.map((m) => m.originalPath));

    let succeeded = 0;
    let skipped = 0;
    let failed = 0;
    const newMappings = [...existingMapping];

    for (const filePath of allFiles) {
        const originalPath = getPublicPath(filePath);
        const filename = path.basename(filePath);

        if (alreadyMigrated.has(originalPath)) {
            console.log(`⏭️  Skipping (already migrated): ${originalPath}`);
            skipped++;
            continue;
        }

        try {
            const gridfsId = await uploadFile(bucket, filePath, filename);
            const newUrl = `/api/images/${gridfsId.toString()}`;

            newMappings.push({
                originalPath,
                filename,
                gridfsId: gridfsId.toString(),
                newUrl,
                verified: false,
            });

            console.log(`✅ Uploaded: ${originalPath} → ${newUrl}`);
            succeeded++;
        } catch (err) {
            console.error(`❌ Failed: ${originalPath} — ${err.message}`);
            failed++;
        }
    }

    // Save mapping file
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(newMappings, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`   Total files found:  ${allFiles.length}`);
    console.log(`   Succeeded:          ${succeeded}`);
    console.log(`   Skipped (existing): ${skipped}`);
    console.log(`   Failed:             ${failed}`);
    console.log(`   Mapping saved to:   ${MAPPING_FILE}`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Done! MongoDB connection closed.');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

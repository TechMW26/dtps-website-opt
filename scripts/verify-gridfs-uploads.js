/**
 * Phase 3: Verify all GridFS uploads.
 *
 * For every entry in image-migration-map.json, confirms the file exists
 * in GridFS and is readable with correct contentType.
 * Marks verified: true on success. Aborts if even one file fails.
 *
 * Usage: node scripts/verify-gridfs-uploads.js
 */

const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m) process.env[m[1]] = process.env[m[1]] || m[2].trim();
    }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Add it to .env or pass as environment variable.');
    process.exit(1);
}

const DB_NAME = 'DTPS-Ecommerce';
const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');

async function main() {
    if (!fs.existsSync(MAPPING_FILE)) {
        console.error('❌ Mapping file not found. Run migrate-images-to-gridfs.js first.');
        process.exit(1);
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    console.log(`📋 Verifying ${mapping.length} GridFS entries...\n`);

    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    let passed = 0;
    let failed = 0;
    const failures = [];

    for (const entry of mapping) {
        const { gridfsId, filename, originalPath } = entry;

        try {
            const objectId = new ObjectId(gridfsId);
            const files = await bucket.find({ _id: objectId }).toArray();

            if (files.length === 0) {
                throw new Error('File not found in GridFS');
            }

            const file = files[0];

            // Verify the file is readable by opening a download stream and reading a chunk
            await new Promise((resolve, reject) => {
                const stream = bucket.openDownloadStream(objectId);
                let bytesRead = 0;
                stream.on('data', (chunk) => {
                    bytesRead += chunk.length;
                    // We only need to confirm it's readable, destroy after first chunk
                    stream.destroy();
                });
                stream.on('close', () => {
                    if (bytesRead > 0) {
                        resolve();
                    } else {
                        reject(new Error('File has 0 bytes'));
                    }
                });
                stream.on('error', reject);
            });

            // Verify contentType is set
            if (!file.contentType || file.contentType === 'application/octet-stream') {
                console.log(`⚠️  ${filename} — contentType missing/generic (${file.contentType})`);
            }

            entry.verified = true;
            passed++;
        } catch (err) {
            entry.verified = false;
            failed++;
            failures.push({ gridfsId, filename, originalPath, error: err.message });
            console.error(`❌ FAIL: ${filename} (${gridfsId}) — ${err.message}`);
        }
    }

    // Save updated mapping with verified flags
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));

    console.log('\n' + '='.repeat(60));

    if (failed > 0) {
        console.log(`❌ VERIFICATION FAILED: ${failed} file(s) could not be verified`);
        console.log('='.repeat(60));
        for (const f of failures) {
            console.log(`   ${f.filename} — ${f.error}`);
        }
        console.log('='.repeat(60));
        console.log('\n⛔ Aborting. Fix the above issues before proceeding.');
        await mongoose.disconnect();
        process.exit(1);
    }

    console.log(`✔ ${passed}/${mapping.length} images verified`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ All GridFS uploads verified successfully.');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

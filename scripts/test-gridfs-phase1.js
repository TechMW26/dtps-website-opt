/**
 * Phase 1 test: Verify GridFS infrastructure works.
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

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db, { bucketName: 'images' });

        // Load first entry from map
        const map = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-migration-map.json'), 'utf8'));
        const testId = map[0].gridfsId;

        const files = await bucket.find({ _id: new ObjectId(testId) }).toArray();
        if (files.length > 0) {
            const f = files[0];
            console.log('✅ GridFS test PASSED');
            console.log('  File:', f.filename);
            console.log('  ContentType:', f.contentType);
            console.log('  Size:', f.length, 'bytes');

            const allFiles = await bucket.find({}).toArray();
            console.log('  Total files in GridFS:', allFiles.length);
        } else {
            console.log('❌ GridFS test FAILED — file not found');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();

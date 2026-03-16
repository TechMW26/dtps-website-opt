/**
 * Fix existing GridFS files: add contentType if missing, and add verified:false to map entries.
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

const MIME_TYPES = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif',
    '.ico': 'image/x-icon', '.bmp': 'image/bmp', '.tiff': 'image/tiff',
    '.avif': 'image/avif',
};

const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'DTPS-Ecommerce' });
        const db = mongoose.connection.db;
        const filesCollection = db.collection('images.files');

        // Fix contentType on GridFS files where it's missing
        const missingCT = await filesCollection.find({ contentType: { $in: [null, undefined] } }).toArray();
        let fixed = 0;
        for (const file of missingCT) {
            const ext = path.extname(file.filename).toLowerCase();
            const ct = MIME_TYPES[ext] || 'application/octet-stream';
            await filesCollection.updateOne({ _id: file._id }, { $set: { contentType: ct } });
            fixed++;
        }
        console.log(`✅ Fixed contentType on ${fixed} GridFS files`);

        // Add verified: false to map entries that don't have it
        const map = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
        let updated = 0;
        for (const entry of map) {
            if (entry.verified === undefined) {
                entry.verified = false;
                updated++;
            }
        }
        fs.writeFileSync(MAPPING_FILE, JSON.stringify(map, null, 2));
        console.log(`✅ Added verified:false to ${updated} map entries`);

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();

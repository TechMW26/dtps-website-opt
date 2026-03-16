/**
 * Phase 5: Cleanup public image folders.
 *
 * Safety gates:
 *   1. Re-run Phase 3 verification (all GridFS files must be verified)
 *   2. Re-run Phase 4 grep (zero old image paths must remain in source)
 *   3. List folders to be deleted with sizes
 *   4. Require manual "yes" confirmation via stdin
 *   5. Delete folders recursively and report storage reclaimed
 *
 * Usage: node scripts/cleanup-public-images.js
 */

const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
    console.error('❌ MONGODB_URI not set.');
    process.exit(1);
}

const DB_NAME = 'DTPS-Ecommerce';
const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');
const PROJECT_ROOT = path.join(__dirname, '..');

const FOLDERS_TO_DELETE = [
    path.join(PROJECT_ROOT, 'public', 'images'),
    path.join(PROJECT_ROOT, 'public', 'img'),
    path.join(PROJECT_ROOT, 'public', 'assets'),
];

const SOURCE_DIRS = [
    path.join(PROJECT_ROOT, 'app'),
    path.join(PROJECT_ROOT, 'components'),
    path.join(PROJECT_ROOT, 'lib'),
    path.join(PROJECT_ROOT, 'models'),
];

const SOURCE_EXTENSIONS = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.mdx',
]);

function getAllSourceFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.next') continue;
            results.push(...getAllSourceFiles(fullPath));
        } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
            results.push(fullPath);
        }
    }
    return results;
}

function getDirSize(dir) {
    if (!fs.existsSync(dir)) return 0;
    let total = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            total += getDirSize(fullPath);
        } else {
            total += fs.statSync(fullPath).size;
        }
    }
    return total;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

function askConfirmation(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

// ─── GATE 1: GridFS Verification ───────────────────────────
async function verifyGridFS() {
    console.log('🔍 GATE 1: Verifying all files exist in GridFS...\n');

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'images' });

    let passed = 0;
    let failed = 0;

    for (const entry of mapping) {
        try {
            const objectId = new ObjectId(entry.gridfsId);
            const files = await bucket.find({ _id: objectId }).toArray();
            if (files.length === 0) throw new Error('Not found');

            // Confirm readable
            await new Promise((resolve, reject) => {
                const stream = bucket.openDownloadStream(objectId);
                let bytesRead = 0;
                stream.on('data', (chunk) => {
                    bytesRead += chunk.length;
                    stream.destroy();
                });
                stream.on('close', () => bytesRead > 0 ? resolve() : reject(new Error('0 bytes')));
                stream.on('error', reject);
            });

            passed++;
        } catch (err) {
            failed++;
            console.error(`   ❌ ${entry.filename} (${entry.gridfsId}) — ${err.message}`);
        }
    }

    await mongoose.disconnect();

    if (failed > 0) {
        console.error(`\n⛔ GATE 1 FAILED: ${failed}/${mapping.length} files missing from GridFS.`);
        console.error('   Cannot proceed with deletion. Fix uploads first.');
        process.exit(1);
    }

    console.log(`   ✔ ${passed}/${mapping.length} files verified in GridFS\n`);
    return true;
}

// ─── GATE 2: Reference Grep ───────────────────────────────
function verifyNoOldReferences() {
    console.log('🔍 GATE 2: Checking for remaining old image references...\n');

    const sourceFiles = [];
    for (const dir of SOURCE_DIRS) {
        sourceFiles.push(...getAllSourceFiles(dir));
    }

    const oldPathPattern = /(?<!\/api)(?:\/images\/|\/img\/|\/assets\/img\/)[^\s"'`,)}\]>]+/g;
    const remaining = [];

    for (const filePath of sourceFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const matches = lines[i].match(oldPathPattern);
            if (matches) {
                for (const m of matches) {
                    remaining.push({
                        file: path.relative(PROJECT_ROOT, filePath),
                        line: i + 1,
                        match: m,
                    });
                }
            }
        }
    }

    if (remaining.length > 0) {
        console.error(`⛔ GATE 2 FAILED: ${remaining.length} old reference(s) still exist:`);
        for (const r of remaining) {
            console.error(`   ${r.file}:${r.line} — ${r.match}`);
        }
        console.error('\n   Run update-image-refs.js first. Cannot proceed with deletion.');
        process.exit(1);
    }

    console.log(`   ✔ Zero old image references found across ${sourceFiles.length} source files\n`);
    return true;
}

// ─── DELETION ─────────────────────────────────────────────
async function main() {
    console.log('='.repeat(60));
    console.log('🗑️  Phase 5: Cleanup Public Image Folders');
    console.log('='.repeat(60) + '\n');

    // Gate 1
    await verifyGridFS();

    // Gate 2
    verifyNoOldReferences();

    // List folders to delete with sizes
    console.log('📂 Folders to be deleted:\n');
    let totalSize = 0;
    const existingFolders = [];

    for (const folder of FOLDERS_TO_DELETE) {
        if (fs.existsSync(folder)) {
            const size = getDirSize(folder);
            totalSize += size;
            existingFolders.push({ path: folder, size });
            console.log(`   ${path.relative(PROJECT_ROOT, folder)}/  →  ${formatBytes(size)}`);
        } else {
            console.log(`   ${path.relative(PROJECT_ROOT, folder)}/  →  (already deleted)`);
        }
    }

    if (existingFolders.length === 0) {
        console.log('\n✅ All image folders are already deleted. Nothing to do.');
        process.exit(0);
    }

    console.log(`\n   Total storage to reclaim: ${formatBytes(totalSize)}\n`);
    console.log('⚠️  This action is IRREVERSIBLE. Files will be permanently deleted.');
    console.log('   The image-migration-map.json will be preserved.\n');

    // Manual confirmation
    const answer = await askConfirmation('   Type "yes" to confirm deletion: ');

    if (answer !== 'yes') {
        console.log('\n❌ Deletion cancelled by user.');
        process.exit(0);
    }

    console.log('\n🗑️  Deleting folders...\n');

    for (const { path: folderPath, size } of existingFolders) {
        const rel = path.relative(PROJECT_ROOT, folderPath);
        try {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`   ✅ Deleted ${rel}/  (${formatBytes(size)})`);
        } catch (err) {
            console.error(`   ❌ Failed to delete ${rel}/: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Storage reclaimed: ${formatBytes(totalSize)}`);
    console.log('   image-migration-map.json preserved for traceability.');
    console.log('='.repeat(60));
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

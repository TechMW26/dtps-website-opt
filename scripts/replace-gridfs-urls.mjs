/**
 * Replace all /api/images/ GridFS URLs with ImageKit CDN URLs in source files.
 * 
 * Usage: node scripts/replace-gridfs-urls.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const mappingPath = resolve(ROOT, 'scripts', 'gridfs-imagekit-mapping.json');
const mapping = JSON.parse(readFileSync(mappingPath, 'utf-8'));

// Files that contain /api/images/ references (from grep)
const targetGlobs = [
    'components/**/*.tsx',
    'app/**/*.tsx',
    'models/**/*.ts',
    'lib/gridfs.ts',
];

// Get all matching files
const files = new Set();
for (const glob of targetGlobs) {
    try {
        const result = execSync(`find ${ROOT} -path '${ROOT}/node_modules' -prune -o -path '${ROOT}/.next' -prune -o -name '*.tsx' -print -o -name '*.ts' -print`, { encoding: 'utf-8' });
        result.trim().split('\n').filter(Boolean).forEach(f => files.add(f));
    } catch { }
}

let totalReplacements = 0;
let filesChanged = 0;

for (const filePath of files) {
    let content = readFileSync(filePath, 'utf-8');
    let changed = false;

    for (const [oldUrl, newUrl] of Object.entries(mapping)) {
        if (content.includes(oldUrl)) {
            const count = content.split(oldUrl).length - 1;
            content = content.replaceAll(oldUrl, newUrl);
            totalReplacements += count;
            changed = true;
        }
    }

    if (changed) {
        writeFileSync(filePath, content);
        filesChanged++;
        console.log(`✅ Updated: ${filePath.replace(ROOT + '/', '')}`);
    }
}

console.log(`\n=== Replacement Complete ===`);
console.log(`📁 Files changed: ${filesChanged}`);
console.log(`🔄 Total replacements: ${totalReplacements}`);

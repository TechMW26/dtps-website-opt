/**
 * Add ImageKit transformations to all hardcoded static ImageKit URLs in source files.
 * Converts: https://ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static/gridfs-XXX.jpg
 * To:       https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/DTPS-Ecommerce/static/gridfs-XXX.jpg
 *
 * Usage: node scripts/add-imagekit-transforms.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Pattern: bare static URL without any /tr: segment
const BARE_STATIC = /https:\/\/ik\.imagekit\.io\/br0mssyqj\/(?!tr:)(DTPS-Ecommerce\/static\/[^"'\s>]+)/g;
const TRANSFORM = 'https://ik.imagekit.io/br0mssyqj/tr:q-80,f-auto/$1';

// Find all .tsx and .ts source files
const output = execSync(
    `find ${ROOT} -type f \\( -name '*.tsx' -o -name '*.ts' \\) ! -path '*/node_modules/*' ! -path '*/.next/*' ! -path '*/scripts/*'`,
    { encoding: 'utf-8' }
);
const files = output.trim().split('\n').filter(Boolean);

let filesChanged = 0;
let totalReplacements = 0;

for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8');

    // Skip files that don't have static ImageKit URLs
    if (!content.includes('ik.imagekit.io/br0mssyqj/DTPS-Ecommerce/static')) continue;

    // Skip if already all transformed (all occurrences already have /tr:)
    const bareMatches = content.match(BARE_STATIC);
    if (!bareMatches || bareMatches.length === 0) continue;

    const updated = content.replace(BARE_STATIC, TRANSFORM);
    writeFileSync(filePath, updated);
    filesChanged++;
    totalReplacements += bareMatches.length;
    console.log(`✅ ${filePath.replace(ROOT + '/', '')} (${bareMatches.length} URLs)`);
}

console.log(`\n=== Done ===`);
console.log(`Files changed: ${filesChanged}`);
console.log(`URLs transformed: ${totalReplacements}`);

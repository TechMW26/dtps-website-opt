/**
 * Update all image references in source files from old paths to GridFS URLs.
 *
 * Usage: node scripts/update-image-refs.js
 *
 * Reads image-migration-map.json and replaces all occurrences of old paths
 * in .js, .jsx, .ts, .tsx, .css, .html, .mdx files.
 */

const fs = require('fs');
const path = require('path');

const MAPPING_FILE = path.join(__dirname, 'image-migration-map.json');
const PROJECT_ROOT = path.join(__dirname, '..');

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

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function main() {
    if (!fs.existsSync(MAPPING_FILE)) {
        console.error('❌ Mapping file not found. Run migrate-images-to-gridfs.js first.');
        process.exit(1);
    }

    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    console.log(`📋 Loaded ${mapping.length} mappings from migration map\n`);

    // Build lookup by exact originalPath
    const pathLookup = new Map();
    for (const entry of mapping) {
        pathLookup.set(entry.originalPath, entry.newUrl);
    }

    // Build lookup by filename (for cross-folder references like /img/file.png -> /images/file.png)
    const filenameLookup = new Map();
    for (const entry of mapping) {
        const fn = entry.filename;
        if (!filenameLookup.has(fn)) {
            filenameLookup.set(fn, entry.newUrl);
        }
    }

    // Known path prefixes — code references like /img/file.png, /images/file.png, /assets/img/file.png
    const PATH_PREFIXES = ['/images/', '/img/', '/assets/img/'];

    // Sort by path length (longest first) so more specific paths match first
    mapping.sort((a, b) => b.originalPath.length - a.originalPath.length);

    // Gather all source files
    const sourceFiles = [];
    for (const dir of SOURCE_DIRS) {
        sourceFiles.push(...getAllSourceFiles(dir));
    }
    console.log(`📁 Found ${sourceFiles.length} source files to scan\n`);

    let totalReplacements = 0;
    let filesModified = 0;
    const unmatchedRefs = new Set();

    for (const filePath of sourceFiles) {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileReplacements = 0;
        const relativePath = path.relative(PROJECT_ROOT, filePath);

        // Match any reference to /images/..., /img/..., /assets/img/...
        // Negative lookbehind excludes already-converted /api/images/ URLs
        const pattern = /(?<!\/api)(?:\/images\/|\/img\/|\/assets\/img\/)[^\s"'`,)}\]>]+/g;

        content = content.replace(pattern, (match) => {
            // Try exact path lookup
            if (pathLookup.has(match)) {
                fileReplacements++;
                return pathLookup.get(match);
            }

            // Try filename-based lookup (handles cross-folder refs)
            const filename = match.split('/').pop();
            if (filenameLookup.has(filename)) {
                fileReplacements++;
                return filenameLookup.get(filename);
            }

            // Unmatched — likely a non-existent fallback/default image
            unmatchedRefs.add(match);
            return match;
        });

        if (fileReplacements > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${relativePath} — ${fileReplacements} replacement(s)`);
            totalReplacements += fileReplacements;
            filesModified++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Reference Update Summary');
    console.log('='.repeat(60));
    console.log(`   Files scanned:      ${sourceFiles.length}`);
    console.log(`   Files modified:     ${filesModified}`);
    console.log(`   Total replacements: ${totalReplacements}`);
    if (unmatchedRefs.size > 0) {
        console.log(`\n⚠️  Unmatched references (no file in mapping):`);
        for (const ref of unmatchedRefs) {
            console.log(`     ${ref}`);
        }
    }
    console.log('='.repeat(60));

    return { totalReplacements, unmatchedRefs };
}

/**
 * Post-replacement grep verification.
 * Scans for any remaining old image paths that are NOT /api/images/ URLs.
 * Returns array of remaining matches.
 */
function grepForOldPaths() {
    const results = [];
    const sourceFiles = [];
    for (const dir of SOURCE_DIRS) {
        sourceFiles.push(...getAllSourceFiles(dir));
    }

    const oldPathPattern = /(?<!\/api)(?:\/images\/|\/img\/|\/assets\/img\/)[^\s"'`,)}\]>]+/g;

    for (const filePath of sourceFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const matches = lines[i].match(oldPathPattern);
            if (matches) {
                for (const m of matches) {
                    results.push({
                        file: path.relative(PROJECT_ROOT, filePath),
                        line: i + 1,
                        match: m,
                    });
                }
            }
        }
    }

    return results;
}

/**
 * Main loop: run replacements, then grep, repeat until zero old paths remain.
 */
function run() {
    const MAX_ITERATIONS = 5;

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
        console.log(`\n🔄 Iteration ${iteration}/${MAX_ITERATIONS}`);
        console.log('-'.repeat(60));

        const { totalReplacements } = main();

        // Grep for remaining old paths
        const remaining = grepForOldPaths();

        if (remaining.length === 0) {
            console.log('\n✅ Confirmation grep: ZERO old image paths remain.');
            console.log('   Phase 4 complete — safe to proceed to Phase 5.');
            return;
        }

        console.log(`\n⚠️  ${remaining.length} old reference(s) still remain:`);
        for (const r of remaining) {
            console.log(`   ${r.file}:${r.line} — ${r.match}`);
        }

        if (iteration === MAX_ITERATIONS) {
            console.log(`\n❌ After ${MAX_ITERATIONS} iterations, ${remaining.length} old reference(s) could not be auto-replaced.`);
            console.log('   These may be unmapped files or dynamic references that need manual attention.');
            process.exit(1);
        }
    }
}

run();

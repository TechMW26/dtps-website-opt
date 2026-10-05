/** Read-only recovery of website media already stored in the existing Blob store.
 * Run: node --env-file=.env.local scripts/recover-website-media.mjs
 * Never treats surviving images as evidence of recovered database records.
 */
import { list } from '@vercel/blob';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const prefixes = ['DTPS-Ecommerce/', 'DTPS_Ecommerce/', 'dtps/'];
const blobs = [];
for (const prefix of prefixes) {
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}
const verified = [];
const unavailable = [];
for (let start = 0; start < blobs.length; start += 8) {
  await Promise.all(blobs.slice(start, start + 8).map(async blob => {
    try {
      const response = await fetch(blob.url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      verified.push({ ...blob, contentType: response.headers.get('content-type') });
    } catch (error) {
      unavailable.push({ pathname: blob.pathname, error: error.message });
    }
  }));
}
verified.sort((a, b) => a.pathname.localeCompare(b.pathname));
const legacy = JSON.parse(await readFile('scripts/gridfs-imagekit-mapping.json', 'utf8'));
const redirects = {};
const unresolved = [];
for (const [route, oldUrl] of Object.entries(legacy)) {
  const id = route.split('/').pop();
  // Require the original exact storage path, not just a similar filename.
  const pathname = new URL(oldUrl).pathname.replace(/^\/[^/]+\//, '');
  const matches = verified.filter(blob => blob.pathname === pathname);
  if (/^[a-f\d]{24}$/i.test(id) && matches.length === 1) redirects[id] = matches[0].url;
  else unresolved.push(route);
}
await mkdir('.recovery', { recursive: true });
await mkdir('data/recovery', { recursive: true });
const manifest = JSON.stringify(redirects, null, 2) + '\n';
await writeFile('data/recovery/legacy-image-urls.json', manifest);
await writeFile('.recovery/website-media-report.json', JSON.stringify({
  capturedAt: new Date().toISOString(), prefixes,
  listed: blobs.length, verified: verified.length, legacyImagesRecovered: Object.keys(redirects).length,
  manifestSha256: createHash('sha256').update(manifest).digest('hex'),
  unavailable, unresolved, blobs: verified,
  databaseRecordsRecovered: false,
}, null, 2));
console.log(JSON.stringify({ listed: blobs.length, verified: verified.length, legacyImagesRecovered: Object.keys(redirects).length, unavailable: unavailable.length, unresolved: unresolved.length }));

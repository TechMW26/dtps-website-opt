import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Public reads only: no customer/admin data, credentials, payments or submissions.
export const publicCutoverPaths = [
  '/api/pricing', '/api/site-banners', '/api/transformations',
  '/api/success-stories', '/api/plan-299-page', '/api/plan-banners',
  '/api/page-heroes?page=home', '/api/marquee', '/api/testimonials',
  '/api/recognitions', '/api/blogs',
];
export function publicHash(value) {
  function ordered(v) {
    if (Array.isArray(v)) return v.map(ordered);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, ordered(v[k])]));
    return v;
  }
  return createHash('sha256').update(JSON.stringify(ordered(value))).digest('hex');
}
export async function publicSnapshot(base, fetcher = fetch) {
  const results = await Promise.all(publicCutoverPaths.map(async path => {
    const response = await fetcher(new URL(path, base), { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    if (response.status !== 200) throw new Error('Public API check failed');
    return [path, { status: response.status, hash: publicHash(await response.json()) }];
  }));
  return Object.fromEntries(results);
}
async function main() {
  const args = process.argv.slice(2);
  const value = flag => { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; };
  const capture = value('--capture'), verify = value('--verify');
  if (Boolean(capture) === Boolean(verify)) throw new Error('Choose capture or verify');
  const file = resolve(capture || verify);
  if (!file.startsWith(`${resolve('.recovery')}/`)) throw new Error('Baseline must remain in recovery');
  const snapshot = await publicSnapshot(value('--base') || 'https://dtpoonamsagar.com');
  if (capture) await writeFile(file, JSON.stringify(snapshot, null, 2), { flag: 'wx', mode: 0o600 });
  else {
    const baseline = JSON.parse(await readFile(file, 'utf8'));
    const mismatches = publicCutoverPaths.filter(path => baseline[path]?.hash !== snapshot[path].hash);
    if (mismatches.length) { console.error(JSON.stringify({ verified: false, mismatches })); process.exitCode = 1; return; }
  }
  console.log(JSON.stringify({ mode: capture ? 'capture' : 'verify', checkedPublicEndpoints: publicCutoverPaths.length, verified: true }));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Public cutover check failed; baseline preserved.'); process.exitCode = 1; });
}

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const css = fs.readFileSync('app/fonts.css', 'utf8');
const faces = css.match(/@font-face\{[^}]+\}/g) || [];
const files = [...new Set([...css.matchAll(/url\(\/fonts\/([^)]*)\)/g)].map(match => match[1]))];

test('font binaries preserve the successful build hashes and valid WOFF2 headers', () => {
  const manifest = JSON.parse(fs.readFileSync('public/fonts/manifest.json', 'utf8'));
  assert.equal(files.length, 22);
  assert.deepEqual(files.slice().sort(), Object.keys(manifest.files).sort());
  for (const file of files) {
    const bytes = fs.readFileSync(path.join('public/fonts', file));
    assert.equal(bytes.toString('ascii', 0, 4), 'wOF2');
    assert.equal(bytes.readUInt32BE(8), bytes.length);
    assert.equal(bytes.length, manifest.files[file].bytes);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), manifest.files[file].sha256);
  }
});

test('all original font subsets, weights, swap behavior and fallback metrics remain intact', () => {
  assert.equal(faces.length, 51);
  const expected = {
    Poppins: { weights: [400, 500, 600, 700], subsets: 3, metrics: ['93.62%', '31.21%', '8.92%', '112.16%'] },
    Epilogue: { weights: [400, 500, 600, 700, 800], subsets: 3, metrics: ['71.15%', '21.16%', '0.00%', '111.04%'] },
    Inter: { weights: [400, 500, 600], subsets: 7, metrics: ['90.44%', '22.52%', '0.00%', '107.12%'] },
  };
  for (const [family, specification] of Object.entries(expected)) {
    const loaded = faces.filter(rule => rule.includes(`font-family:${family};`));
    assert.equal(loaded.length, specification.weights.length * specification.subsets);
    for (const weight of specification.weights) {
      const subsetRules = loaded.filter(rule => rule.includes(`font-weight:${weight};`));
      assert.equal(subsetRules.length, specification.subsets);
      assert.equal(new Set(subsetRules.map(rule => rule.match(/unicode-range:([^}]+)/)[1])).size, specification.subsets);
      for (const rule of subsetRules) {
        assert.match(rule, /font-display:swap;/);
        assert.match(rule, /font-style:normal;/);
        assert.match(rule, /src:url\(\/fonts\/[^)]+\.woff2\) format\("woff2"\)/);
      }
    }
    const fallback = faces.find(rule => rule.includes(`font-family:${family} Fallback;`));
    assert.ok(fallback);
    assert.match(fallback, /src:local\("Arial"\)/);
    ['ascent-override', 'descent-override', 'line-gap-override', 'size-adjust'].forEach((property, index) => {
      assert.ok(fallback.includes(`${property}:${specification.metrics[index]}`));
    });
    assert.match(fs.readFileSync(`public/fonts/${family.toLowerCase()}-OFL.txt`, 'utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
  }
});

test('font classes and CSS variables remain unchanged and only Latin faces are preloaded', () => {
  const mappings = fs.readFileSync('lib/fonts.ts', 'utf8');
  for (const className of ['__className_cf84ab', '__variable_cf84ab', '__className_ce71e5', '__variable_ce71e5', '__className_c51512', '__className_ae80e8', '__className_69d019']) {
    assert.ok(mappings.includes(className));
    assert.ok(css.includes(`.${className}{`));
  }
  assert.ok(css.includes('--font-poppins:"Poppins","Poppins Fallback"'));
  assert.ok(css.includes('--font-epilogue:"Epilogue","Epilogue Fallback"'));
  const preloads = [...mappings.matchAll(/'\/fonts\/([^']+)'/g)].map(match => match[1]);
  assert.equal(preloads.length, 6);
  for (const preload of preloads) assert.ok(faces.some(rule => rule.includes(`/fonts/${preload}`) && rule.includes('unicode-range:u+00??,')));
  assert.match(fs.readFileSync('app/layout.tsx', 'utf8'), /import '\.\/fonts\.css'/);
});

test('application has no external font build imports or Google font network references', () => {
  function inspect(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, item.name);
      if (item.isDirectory()) inspect(file);
      else if (/\.(?:tsx?|jsx?|css)$/.test(file)) {
        const content = fs.readFileSync(file, 'utf8');
        assert.doesNotMatch(content, /(?:@next|next)\/font\/google|fonts\.googleapis\.com|fonts\.gstatic\.com/, file);
      }
    }
  }
  ['app', 'components', 'lib'].forEach(inspect);
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const images = require('../data/recovery/legacy-image-urls.json');
const code = ts.transpileModule(fs.readFileSync('app/api/images/[fileId]/route.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const exportsObject = {};
vm.runInNewContext(code, {
  exports: exportsObject,
  require: name => {
    if (name === '@/data/recovery/legacy-image-urls.json') return images;
    if (name === 'next/server') return require('next/server');
    throw new Error(`Unexpected dependency: ${name}`);
  },
});
const get = id => exportsObject.GET(new Request('http://localhost/api/images/' + id), { params: Promise.resolve({ fileId: id }) });
test('recovered legacy images redirect to verified existing Blob URLs without a database', async () => {
  assert.ok(Object.keys(images).length > 0);
  for (const [id, url] of Object.entries(images)) {
    assert.match(new URL(url).hostname, /^[a-z\d]+\.public\.blob\.vercel-storage\.com$/);
    const response = await get(id.toUpperCase());
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), url);
  }
});
test('unknown and malformed IDs remain missing rather than showing unrelated media', async () => {
  assert.equal((await get('bad-id')).status, 400);
  assert.equal((await get('000000000000000000000000')).status, 404);
});

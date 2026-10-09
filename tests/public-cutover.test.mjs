import test from 'node:test';
import assert from 'node:assert/strict';
import { publicHash, publicSnapshot, publicCutoverPaths } from '../scripts/verify-public-cutover.mjs';

test('public cutover hashes normalize keys without hiding changed values or list order', () => {
  assert.equal(publicHash({ b: { x: 1, y: 2 }, a: 3 }), publicHash({ a: 3, b: { y: 2, x: 1 } }));
  assert.notEqual(publicHash({ price: 299 }), publicHash({ price: 199 }));
  assert.notEqual(publicHash([1, 2]), publicHash([2, 1]));
});
test('public cutover checks every allowlisted endpoint without transmitting cookies or bodies', async () => {
  let count = 0;
  const snapshot = await publicSnapshot('https://example.com', async (url, options) => {
    assert.equal(url.origin, 'https://example.com');
    assert.equal(options.body, undefined);
    assert.equal(options.headers, undefined);
    count++;
    return { status: 200, json: async () => ({ content: [] }) };
  });
  assert.equal(count, publicCutoverPaths.length);
  assert.equal(Object.keys(snapshot).length, count);
});
test('public cutover refuses failed API responses instead of accepting empty fallback data', async () => {
  await assert.rejects(publicSnapshot('https://example.com', async () => ({ status: 503 })), /check failed/);
});

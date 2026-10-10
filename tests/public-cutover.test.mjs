import test from 'node:test';
import assert from 'node:assert/strict';
import { publicHash, publicSnapshot, publicCutoverPaths, normalizePublicPayload } from '../scripts/verify-public-cutover.mjs';

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

test('pricing cutover normalizes only equal numeric order/price groups by original ID', () => {
  const a = { _id: 'a', order: 1, price: 299, page: 'category-one', features: ['first', 'second'] };
  const b = { _id: 'b', order: 1, price: 299, page: 'category-two', features: ['first', 'second'] };
  const c = { _id: 'c', order: 2, price: 499 };
  const source = { success: true, pricing: [b, a, c] };
  const target = { success: true, pricing: [a, b, c] };
  assert.equal(publicHash(source, '/api/pricing'), publicHash(target, '/api/pricing'));
  assert.deepEqual(normalizePublicPayload('/api/pricing', source).pricing.map(plan => plan._id), ['a', 'b', 'c']);
  assert.deepEqual(source.pricing.map(plan => plan._id), ['b', 'a', 'c'], 'normalization does not mutate the baseline response');
  assert.notEqual(publicHash(source), publicHash(target));
  assert.notEqual(publicHash(source, '/api/testimonials'), publicHash(target, '/api/testimonials'));
});

test('pricing cutover still detects changed order, price, other values and feature-list order', () => {
  const a = { _id: 'a', order: 1, price: 299, planName: 'Visible plan', features: ['first', 'second'] };
  const b = { _id: 'b', order: 1, price: 299, planName: 'Other plan', features: ['first', 'second'] };
  const baseline = { success: true, pricing: [a, b] };
  const hash = publicHash(baseline, '/api/pricing');
  for (const changes of [{ order: 2 }, { price: 199 }, { planName: 'Changed' }, { features: ['second', 'first'] }, { price: '299' }]) {
    assert.notEqual(hash, publicHash({ ...baseline, pricing: [{ ...a, ...changes }, b] }, '/api/pricing'));
  }
  const differentKeys = { success: true, pricing: [a, { ...b, order: 2 }] };
  assert.notEqual(publicHash(differentKeys, '/api/pricing'), publicHash({ ...differentKeys, pricing: [...differentKeys.pricing].reverse() }, '/api/pricing'));
});

test('pricing tie fallback matches numeric nullish defaults but leaves other arrays untouched', () => {
  const a = { _id: 'a', price: 299, features: ['one', 'two'] };
  const b = { _id: 'b', order: null, price: 299 };
  const source = { pricing: [b, a], banners: [1, 2] };
  assert.equal(publicHash(source, '/api/pricing'), publicHash({ ...source, pricing: [a, b] }, '/api/pricing'));
  assert.notEqual(publicHash(source, '/api/pricing'), publicHash({ ...source, banners: [2, 1] }, '/api/pricing'));
});

test('public snapshot passes endpoint identity to pricing-only normalization', async () => {
  const pricing = [{ _id: 'b', order: 1, price: 299 }, { _id: 'a', order: 1, price: 299 }];
  const snapshot = await publicSnapshot('https://example.com', async () => ({ status: 200, json: async () => ({ pricing }) }));
  assert.equal(snapshot['/api/pricing'].hash, publicHash({ pricing: [...pricing].reverse() }, '/api/pricing'));
  assert.equal(snapshot['/api/testimonials'].hash, publicHash({ pricing }));
  assert.notEqual(snapshot['/api/pricing'].hash, snapshot['/api/testimonials'].hash);
});

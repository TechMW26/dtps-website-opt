const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, globals = {}, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, AbortSignal, ...globals, require: name => imports[name] }, { filename: file });
  return exports;
}
const policy = load('lib/meta-policy.ts');
const storage = () => { const values = new Map(); return { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v) }; };
const order = () => ({ orderId: 'opaque-123', paymentStatus: 'completed', total: 179,
  customer: { email: 'private@example.com' }, products: [{ id: 'pcod', name: 'PCOD Care', price: 199, quantity: 1 }] });
function setup(shared = {}) {
  const calls = []; const ga = []; let seq = 0;
  const state = { accepts: true, fetches: 0, response: { success: true, order: order() }, fail: false };
  const stores = { localStorage: shared.localStorage || storage(), sessionStorage: shared.sessionStorage || storage() };
  const mod = load('lib/meta-funnel.ts', { ...stores, fetch: async () => {
    state.fetches++; if (state.fail) throw Error('offline');
    return { ok: true, json: async () => state.response };
  } }, { './meta-config': { META_PIXEL_ID: '1444341400930947' }, './meta-policy': policy,
    './pixel': { generateEventId: () => `selection-${++seq}`,
      trackEvent: (...args) => { if (!state.accepts) return false; calls.push(args); return true; }, gaEvent: (...args) => ga.push(args) } });
  return { ...mod, calls, ga, state, ...stores };
}
test('only confirmed matching orders qualify, including free completed orders', () => {
  const h = setup();
  assert(h.isVerifiedPurchase(order(), 'opaque-123'));
  for (const change of [{ paymentStatus: undefined }, { paymentStatus: 'pending' }, { paymentStatus: 'failed' },
    { paymentStatus: 'cancelled' }, { orderId: 'other' }, { total: NaN }, { total: -1 }, { total: '179' },
    { products: [] }, { products: [{ quantity: 0 }] }, { products: [{ quantity: 1.5 }] }, { products: [{}] }]) {
    assert.equal(h.isVerifiedPurchase({ ...order(), ...change }, 'opaque-123'), false);
  }
  assert(h.isVerifiedPurchase({ ...order(), total: 0 }, 'opaque-123'));
});
test('purchase uses actual discounted total, strips private data and deduplicates callbacks and refreshes', async () => {
  const h = setup();
  const a = h.trackPurchaseForOrder('opaque-123');
  const b = h.trackPurchaseForOrder('opaque-123');
  assert.equal(a, b); assert(await a); assert.equal(h.state.fetches, 1);
  assert.equal(JSON.stringify(h.calls[0][1]), JSON.stringify({ value: 179, currency: 'INR', num_items: 1 }));
  assert(!/PCOD|pcod|private@example/.test(JSON.stringify(h.calls)));
  assert.equal(h.ga[0][1].items[0].item_name, 'PCOD Care');
  await h.trackPurchaseForOrder('opaque-123'); assert.equal(h.calls.length, 1);
  const refresh = setup(h); assert(await refresh.trackPurchaseForOrder('opaque-123')); assert.equal(refresh.calls.length, 0);
});
test('fetch failure, pending status and unavailable pixel do not poison retries', async () => {
  const h = setup(); h.state.fail = true;
  assert.equal(await h.trackPurchaseForOrder('opaque-123'), false);
  h.state.fail = false; h.state.response.order.paymentStatus = 'pending';
  assert.equal(await h.trackPurchaseForOrder('opaque-123'), false);
  h.state.response.order.paymentStatus = 'completed'; h.state.accepts = false;
  assert.equal(await h.trackPurchaseForOrder('opaque-123'), false);
  h.state.accepts = true; assert(await h.trackPurchaseForOrder('opaque-123')); assert.equal(h.calls.length, 1);
});
test('old suppression markers cannot suppress newly enabled purchase events', async () => {
  const h = setup(); h.sessionStorage.setItem('pixel:purchase:opaque-123', '1');
  assert(await h.trackPurchaseForOrder('opaque-123')); assert.equal(h.calls.length, 1);
});
test('cart retains visible data; funnel sends only amounts and counts once per selection', () => {
  const h = setup(); const products = order().products;
  h.storeCheckoutProducts(products);
  assert.deepEqual(JSON.parse(h.sessionStorage.getItem('checkoutProducts')), products);
  const params = { value: 199, currency: 'INR', num_items: 1, content_name: 'PCOD Care' };
  h.trackCheckoutArrival(params); h.trackCheckoutArrival(params);
  assert.deepEqual(h.calls.map(c => c[0]), ['AddToCart', 'InitiateCheckout']);
  assert(!/PCOD|content_name/.test(JSON.stringify(h.calls)));
  const refreshed = setup(h); refreshed.trackCheckoutArrival(params); assert.equal(refreshed.calls.length, 0);
  h.storeCheckoutProducts(products); h.trackCheckoutArrival(params); assert.equal(h.calls.length, 4);
});
test('empty checkout emits nothing; direct checkout does not invent AddToCart; failures can retry', () => {
  const h = setup(); h.trackCheckoutArrival({}); assert.equal(h.calls.length, 0);
  h.state.accepts = false; h.trackCheckoutArrival({ value: 199 });
  h.state.accepts = true; h.trackCheckoutArrival({ value: 199 });
  assert.deepEqual(h.calls.map(c => c[0]), ['InitiateCheckout']);
});
test('unavailable persistence retains same-tab purchase deduplication', async () => {
  const denied = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
  const h = setup({ localStorage: denied });
  assert(await h.trackPurchaseForOrder('opaque-123')); assert(await h.trackPurchaseForOrder('opaque-123'));
  assert.equal(h.calls.length, 1);
});
test('payment verification binds provider payment to exact order, amount and INR', () => {
  const { paymentMatchesOrder: matches } = load('lib/payment-verification.ts');
  const saved = { razorpayOrderId: 'order-1', total: 179 };
  const payment = { order_id: 'order-1', amount: 17900, currency: 'INR' };
  assert(matches(payment, saved, 'order-1'));
  for (const change of [{ order_id: 'order-2' }, { amount: 19900 }, { amount: 0 }, { currency: 'USD' }]) {
    assert.equal(matches({ ...payment, ...change }, saved, 'order-1'), false);
  }
  assert.equal(matches(payment, saved, 'order-2'), false);
  assert.equal(matches(payment, { total: 179 }, 'order-1'), false);
});

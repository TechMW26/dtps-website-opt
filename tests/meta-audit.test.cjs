const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { PUBLIC_ROUTES, toPublicUrl } = require('../lib/public-routes');
const config = require('../next.config');

// Execute the actual TypeScript modules, replacing only browser/network APIs.
function loadTs(file, globals = {}, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, console, URL, process, ...globals,
    require: (name) => Object.hasOwn(imports, name) ? imports[name] : name === './meta-config' ? loadTs('lib/meta-config.ts') : require(name),
  }, { filename: file });
  return exports;
}
const policy = loadTs('lib/meta-policy.ts');

test('Meta allowlist drops product identity, nested fields and malformed scalar values without mutating orders', () => {
  const order = Object.freeze({ value: 299, currency: 'INR', num_items: 1, content_name: 'PCOD Care', content_ids: ['thyroid-plan'], contents: [{ name: 'PCOD Care' }], items: [{ item_name: 'PCOD Care' }], diagnosis: 'PCOD', order_id: 'private-reference' });
  assert.equal(JSON.stringify(policy.sanitizeMetaCustomData(order)), JSON.stringify({ value: 299, currency: 'INR', num_items: 1 }));
  assert.equal(order.content_name, 'PCOD Care');
  for (const value of [null, undefined, [], 'PCOD', { value: NaN, currency: 'PCOD', num_items: 1.5 }, { value: -1, num_items: Infinity }, { value: '299', num_items: '1' }]) {
    assert.equal(JSON.stringify(policy.sanitizeMetaCustomData(value)), '{}');
  }
  assert.equal(JSON.stringify(policy.sanitizeMetaCustomData({ value: 0, num_items: 0 })), '{"value":0,"num_items":0}');
});

test('Meta source URLs remove query/fragment data and reject condition, foreign and credential-bearing URLs', () => {
  assert.equal(policy.sanitizeMetaSourceUrl('https://www.dtpoonamsagar.com/checkout?product=PCOD&email=test@example.com#thyroid'), 'https://www.dtpoonamsagar.com/checkout');
  for (const url of ['/checkout', 'invalid', 'https://example.com/checkout', 'https://user:pass@www.dtpoonamsagar.com/checkout', 'https://www.dtpoonamsagar.com/pcdtps', 'https://www.dtpoonamsagar.com/weight-loss-plan', 'https://www.dtpoonamsagar.com/checkout/PCOD']) {
    assert.equal(policy.sanitizeMetaSourceUrl(url), undefined);
  }
});

test('browser transport keeps product details out even if transmission policy later changes', () => {
  const sent = [];
  const cart = Object.freeze({ content_name: 'Thyroid Plan', content_ids: ['PCOD'], contents: [{ id: 'PCOD', name: 'Thyroid Plan' }], value: 199, currency: 'INR', num_items: 1 });
  const pixel = loadTs('lib/pixel.ts', {
    window: { fbq: (...args) => sent.push(args), location: { href: 'https://www.dtpoonamsagar.com/checkout?plan=PCOD' } },
    fetch: (_url, options) => { sent.push(JSON.parse(options.body)); return Promise.resolve(); },
  }, { './meta-policy': { ...policy, canSendMetaEvents: () => true } });
  pixel.trackEvent('Purchase', cart, { eventID: 'random-event' });
  pixel.trackCustom('GenericEvent', cart, { eventID: 'random-event' });
  pixel.fireCapi('Purchase', 'random-event', cart);
  assert.equal(sent.length, 3);
  assert(!/PCOD|Thyroid|content_name|content_ids|contents/.test(JSON.stringify(sent)));
  assert.equal(cart.content_name, 'Thyroid Plan');
});

test('server independently filters product details without trusting browser filtering', async () => {
  const sent = [];
  const capi = loadTs('lib/meta-capi.ts', {
    process: { env: { META_CAPI_ACCESS_TOKEN: 'test-only', META_PIXEL_IDS: '123' } },
    AbortSignal,
    fetch: async (_url, options) => { sent.push(JSON.parse(options.body)); return { ok: true, status: 200, json: async () => ({}) }; },
  }, { './meta-policy': { ...policy, canSendMetaEvents: () => true } });
  await capi.sendCapiEvent({ eventName: 'Purchase', eventId: 'random-event', eventSourceUrl: 'https://www.dtpoonamsagar.com/checkout?product=PCOD', userData: {}, customData: { value: 299, currency: 'INR', content_name: 'PCOD', contents: [{ id: 'Thyroid Plan' }] } });
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].data[0].custom_data, { value: 299, currency: 'INR' });
  assert.equal(sent[0].data[0].event_source_url, 'https://www.dtpoonamsagar.com/checkout');
  assert(!/PCOD|Thyroid|content_name|contents/.test(JSON.stringify(sent)));
});

test('every legacy URL redirects directly to a working abbreviated route', async () => {
  const redirects = await config.redirects();
  const rewrites = (await config.rewrites()).beforeFiles;
  for (const route of PUBLIC_ROUTES) {
    assert(rewrites.some(r => r.source === route.path && r.destination === route.internal));
    assert(['tsx', 'jsx'].some(ext => fs.existsSync(`app${route.internal}/page.${ext}`)));
    for (const legacy of route.legacy) {
      const redirect = redirects.find(r => r.source === legacy);
      assert.equal(redirect?.destination, route.path);
      assert.equal(redirect?.permanent, true);
      assert(!redirects.some(r => r.source === route.path), 'public URL must not redirect in a loop');
    }
  }
});

test('CMS links retain query/hash and only exact first-party page paths change', () => {
  assert.equal(toPublicUrl('/weight-loss-plan?utm_source=mail#plans'), '/wldtps?utm_source=mail#plans');
  assert.equal(toPublicUrl('/pcod/'), '/pcdtps');
  assert.equal(toPublicUrl('https://dtpoonamsagar.com/thyroid#plans'), 'https://dtpoonamsagar.com/thydtps#plans');
  assert.equal(toPublicUrl('/weight-loss/Leadform/1/thankyou'), '/wldtps/lead/1/thankyou');
  for (const value of ['/pcodicon.svg', '/blog/pcod-guide', '/wldtps', 'https://example.com/pcod', 'mailto:test@example.com', 'tel:+911234567890', '']) {
    assert.equal(toPublicUrl(value), value);
  }
});

test('saved marquee page targeting works on new routes and stays scoped', () => {
  const { marqueeMatchesPath: matches } = loadTs('lib/marquee.ts', {}, { './public-routes': { toPublicUrl } });
  assert(matches('/wldtps', ['/weight-loss-plan']));
  assert(matches('/pcdtps', ['/pcod']));
  assert(matches('/thydtps', ['/plans']));
  assert(matches('/tpdtps', ['/plans/therapeutic']));
  assert(matches('/thydtps', ['/plans/therapeutic']));
  assert(!matches('/pcdtps', ['/weight-loss-plan']));
  assert(!matches('/checkout', ['/plans']));
});

test('allowed browser events strip identity while custom events and CAPI remain blocked', () => {
  const calls = [];
  const pixel = loadTs('lib/pixel.ts', {
    window: { fbq: (...args) => calls.push(args), location: { href: 'https://www.dtpoonamsagar.com/pcdtps?email=person@example.com' } },
    fetch: () => { throw Error('unexpected network'); },
  }, { './meta-policy': policy });
  for (const event of ['ViewContent', 'Lead', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase']) {
    pixel.trackEvent(event, { content_name: 'PCOD Plan' });
    pixel.fireCapi(event, 'test', { diagnosis: 'PCOD' }, { email: 'person@example.com' });
  }
  pixel.trackCustom('ThyroidConsultation', { phone: '1234567890' });
  pixel.trackEvent('Search', { search_string: 'PCOD' });
  pixel.trackEvent('CompleteRegistration', { email: 'person@example.com' });
  assert.equal(calls.length, 5);
  assert(!/PCOD|person@example|phone|content_name/.test(JSON.stringify(calls)));
});

test('server purchase sender is blocked even with configured credentials', async () => {
  let calls = 0;
  const capi = loadTs('lib/meta-capi.ts', {
    process: { env: { META_CAPI_ACCESS_TOKEN: 'test-token', META_PIXEL_IDS: '123' } },
    fetch: () => { calls++; throw Error('unexpected network'); },
  }, { './meta-policy': policy });
  const result = await capi.sendCapiEvent({ eventName: 'Purchase', eventId: 'order', userData: { email: 'person@example.com' }, customData: { content_name: 'Thyroid Plan' } });
  assert.equal(result.length, 0);
  assert.equal(calls, 0);
});

test('old clients and direct CAPI requests are suppressed before reading PII or invalid JSON', async () => {
  const route = loadTs('app/api/meta/capi/route.ts', {}, {
    '@/lib/meta-policy': policy,
    '@/lib/meta-capi': { sendCapiEvent: () => { throw Error('unexpected send'); } },
    'next/server': { NextResponse: { json: (data, options) => Response.json(data, options) } },
  });
  const response = await route.POST({ json: () => { throw Error('body must not be read'); } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: true, sent: 0, suppressed: true });
});

test('only the replacement pixel is bootstrapped, automatic events are off, and CSP permits it', async () => {
  const { META_PIXEL_ID, META_PIXEL_BOOTSTRAP } = loadTs('lib/meta-config.ts');
  assert.equal(META_PIXEL_ID, '1444341400930947');
  const inserted = [];
  const window = {};
  const document = { createElement: () => ({}), getElementsByTagName: () => [{ parentNode: { insertBefore: (el) => inserted.push(el) } }] };
  const context = vm.createContext({ window, document });
  // Browser global names resolve through window.
  Object.defineProperty(context, 'fbq', { get: () => window.fbq });
  vm.runInContext(META_PIXEL_BOOTSTRAP, context);
  const queue = window.fbq.queue.map(args => Array.from(args));
  assert.equal(inserted[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(JSON.stringify(queue), JSON.stringify([
    ['set', 'autoConfig', false, META_PIXEL_ID], ['init', META_PIXEL_ID], ['trackSingle', META_PIXEL_ID, 'PageView'],
  ]));
  const layout = fs.readFileSync('app/layout.tsx', 'utf8');
  assert(layout.includes('strategy="beforeInteractive"'));
  assert.equal((layout.match(/facebook.com\/tr/g) || []).length, 1);
  for (const entry of await config.headers()) {
    const csp = entry.headers.find(h => h.key === 'Content-Security-Policy');
    if (csp) {
      assert(csp.value.includes('https://connect.facebook.net'));
      assert(csp.value.includes('https://www.facebook.com'));
      assert(!csp.value.includes('conversionsapigateway'));
    }
  }
});

test('SPA PageView targets only the replacement pixel with no custom data; CAPI stays blocked', () => {
  const calls = [];
  const pixel = loadTs('lib/pixel.ts', {
    window: { fbq: (...args) => calls.push(args) },
    fetch: () => { throw Error('CAPI must stay blocked'); },
  }, { './meta-policy': policy });
  pixel.trackEvent('PageView', { content_name: 'PCOD', value: 199 }, { eventID: 'page-event' });
  pixel.fireCapi('PageView', 'page-event');
  assert.equal(JSON.stringify(calls), JSON.stringify([['trackSingle', '1444341400930947', 'PageView', {}, { eventID: 'page-event' }]]));
  const retired = /1249607162337272|451000204060350|28310721625213137|1499311531960054/;
  for (const file of ['app/layout.tsx', 'lib/meta-config.ts', 'lib/meta-capi.ts', 'lib/pixel.ts']) assert(!retired.test(fs.readFileSync(file, 'utf8')));
});

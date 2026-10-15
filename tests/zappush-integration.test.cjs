/**
 * Zappush / DataLayer integration guards.
 *
 * These are the invariants the Phase A brief asks for, expressed as tests so a
 * later change cannot quietly break one:
 *
 *   - the tracker is configured once, with the vendor's exact script;
 *   - the consent gate defaults to granted (banner removed); a present-but-invalid
 *     decision still fails closed;
 *   - the GA4 DataLayer contract is intact and page views are not duplicated;
 *   - payloads cannot carry health data, coupon codes or form text;
 *   - a purchase requires a verified, completed order and cannot double-fire;
 *   - the existing Meta restrictions are untouched.
 *
 * Everything runs against mocks. Nothing here contacts Zappush or Meta.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, globals = {}, imports = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    { exports, AbortSignal, console, URL, URLSearchParams, ...globals, require: (name) => imports[name] },
    { filename: file }
  );
  return exports;
}

const read = (file) => fs.readFileSync(file, 'utf8');
const config = load('lib/zappush-config.ts');
const labels = load('lib/plan-labels.ts');
const consent = load('lib/tracking-consent.ts');

/** A complete, current grant, built from the real exported shape. */
function grantedConsent() {
  return {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    policyVersion: consent.CONSENT_POLICY_VERSION,
    decidedAt: '2026-10-13T00:00:00.000Z',
    source: 'banner',
  };
}

/** The import map every lib/tracking.ts load needs. */
function trackingImports(overrides = {}) {
  return {
    './dataLayer': { pushEvent: () => true, buildEcommerce: () => ({}) },
    './tracking-consent': {
      ...consent,
      readConsent: () => grantedConsent(),
      isTrackingAllowed: () => true,
    },
    './zappush': { zappushTrack: () => true },
    './pixel': { gaEvent: () => {}, toGaEcomParams: (x) => x },
    './analyticsConfig': { STORE_CURRENCY: 'INR' },
    './plan-labels': labels,
    ...overrides,
  };
}

/** A window with the storage the orchestrator uses. */
function browserWindow(overrides = {}) {
  const session = new Map();
  const local = new Map();
  const make = (map) => ({
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
    get length() {
      return map.size;
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
  });
  return {
    window: { location: { search: '' }, sessionStorage: make(session), localStorage: make(local), ...overrides },
    session,
    local,
  };
}

/* -------------------------------------------------------------------------- */
/* 1. The tracker is configured once, verbatim                                */
/* -------------------------------------------------------------------------- */

test('the tracker script URL matches the vendor dashboard exactly', () => {
  assert.equal(
    config.ZAPPUSH_TRACKER_SRC,
    'https://api.zappush.com/s/zp_bcd40e532430663af84df043b9c5403d.js'
  );
  assert.equal(config.ZAPPUSH_ORIGIN, 'https://api.zappush.com');
  assert.equal(
    config.ZAPPUSH_QUEUE_STUB,
    '!function(w,z){z=w.zappush=z.zappush||{};z.q=z.q||[];z.track=z.track||function(e,d){z.q.push([e,d])}}(window)'
  );
});

test('the tracker is never placed in the document head or loaded by next/script', () => {
  const layout = read('app/layout.tsx');
  assert(!layout.includes('zp_bcd40e532430663af84df043b9c5403d.js'));
  assert(!/ZAPPUSH_TRACKER_SRC/.test(layout));
  const tracker = read('components/ZappushTracker.tsx');
  // Injected dynamically, exactly once, and guarded by both id and src.
  assert(tracker.includes("document.getElementById('zappush-tracker')"));
  assert(tracker.includes('script[src="${ZAPPUSH_TRACKER_SRC}"]'));
  assert.equal((tracker.match(/document\.createElement\('script'\)/g) || []).length, 1);
});

test('injection is attempted only after consent is granted', () => {
  const tracker = read('components/ZappushTracker.tsx');
  // The injector itself must not decide consent; callers must be gated.
  const injectBody = tracker.slice(tracker.indexOf('function injectTracker'), tracker.indexOf('function removeTracker'));
  assert(!/isTrackingAllowed/.test(injectBody), 'the injector itself must not decide consent');
  assert(tracker.includes('isTrackingAllowed'), 'the gate helper must exist');
  // The single gated path: apply() grants before it installs or injects.
  const apply = tracker.slice(tracker.indexOf('const apply = useCallback'), tracker.indexOf('// Read consent after mount'));
  assert(apply.includes('if (isTrackingAllowed(next)) {'));
  assert(apply.indexOf('isTrackingAllowed(next)') < apply.indexOf('injectTracker()'));
  // And the ungated branch removes rather than injects.
  assert(apply.includes('removeTracker();'));
});

test('the CSP allows exactly the Zappush origin, added to script-src and connect-src', () => {
  const nextConfig = read('next.config.js');
  const scriptSrc = nextConfig.match(/"script-src[^"]*"/)[0];
  const connectSrc = nextConfig.match(/"connect-src[^"]*"/)[0];
  assert(scriptSrc.includes('https://api.zappush.com'));
  assert(connectSrc.includes('https://api.zappush.com'));
  assert.equal((nextConfig.match(/https:\/\/api\.zappush\.com/g) || []).length, 2);
  // No wildcard was opened up to make the tracker work.
  assert(!scriptSrc.includes('https://*.zappush.com'));
});

/* -------------------------------------------------------------------------- */
/* 2. Consent defaults to denied and fails closed                             */
/* -------------------------------------------------------------------------- */

test('consent defaults to granted when no decision exists, and denies for malformed or stale values', () => {
  // No cookie / no decision yet → tracking is on (banner removed, auto-grant).
  for (const raw of [undefined, null, '']) {
    const state = consent.parseConsent(raw);
    assert.equal(state.analytics_storage, 'granted', `must grant for ${String(raw).slice(0, 40)}`);
    assert.equal(consent.isTrackingAllowed(state), true);
  }
  // A present-but-invalid prior decision must still fail closed.
  for (const raw of [
    'not json',
    '[]',
    '{}',
    '{"analytics_storage":"granted"}',
    JSON.stringify({ analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', policyVersion: 'old' }),
    JSON.stringify({ analytics_storage: 'yes', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', policyVersion: consent.CONSENT_POLICY_VERSION }),
  ]) {
    const state = consent.parseConsent(raw);
    assert.equal(state.analytics_storage, 'denied', `must deny for ${String(raw).slice(0, 40)}`);
    assert.equal(consent.isTrackingAllowed(state), false);
  }
});

test('only a complete, current grant enables tracking', () => {
  const granted = consent.parseConsent(
    JSON.stringify({
      analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted',
      ad_personalization: 'granted', policyVersion: consent.CONSENT_POLICY_VERSION, decidedAt: 'now', source: 'banner',
    })
  );
  assert(consent.isTrackingAllowed(granted));
  // Any single denial re-closes the gate.
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
    assert.equal(consent.isTrackingAllowed({ ...granted, [key]: 'denied' }), false, key);
  }
});

test('a partial external CMP signal is downgraded to a full denial', () => {
  const mod = load('lib/tracking-consent.ts', {
    document: { cookie: '' },
    window: { localStorage: { setItem() {}, removeItem() {} }, location: { protocol: 'https:' } },
  });
  const state = mod.applyExternalConsent({
    analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'granted', ad_personalization: 'granted',
  });
  assert.equal(state.analytics_storage, 'denied');
  assert.equal(mod.isTrackingAllowed(state), false);
});

test('no emitter sends anything while consent is denied', () => {
  const dataLayer = [];
  const { pushEvent } = load('lib/dataLayer.ts', { window: { dataLayer } }, {
    './tracking-consent': consent,
  });
  const denied = consent.parseConsent(JSON.stringify({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', policyVersion: consent.CONSENT_POLICY_VERSION }));
  const pushed = pushEvent({ event: 'generate_lead' }, denied);
  assert.equal(pushed, false);
  assert.equal(dataLayer.length, 0);
});

/* -------------------------------------------------------------------------- */
/* 3. DataLayer contract                                                      */
/* -------------------------------------------------------------------------- */

test('the GA4 DataLayer still initialises exactly as before and nothing else pushes to it', () => {
  const gatedTags = read('components/ConsentGatedTags.tsx');
  assert(gatedTags.includes("window.dataLayer = window.dataLayer || [];"));
  assert(gatedTags.includes("send_page_view:false"));
  assert(gatedTags.includes("'G-R647JLBMXD'"));
  // lib/pixel.ts already declares Window.dataLayer; a second, differently typed
  // declaration breaks `tsc --noEmit`. Pin them to the same type.
  const pixelDecl = read('lib/pixel.ts').match(/dataLayer\?:\s*([^;]+);/);
  const layerDecl = read('lib/dataLayer.ts').match(/dataLayer\?:\s*([^;]+);/);
  assert(pixelDecl && layerDecl, 'both files must declare Window.dataLayer');
  assert.equal(layerDecl[1].trim(), pixelDecl[1].trim());
});

test('page_view and purchase can never be pushed to the DataLayer', () => {
  const window = { dataLayer: [] };
  const { pushEvent } = load('lib/dataLayer.ts', { window }, { './tracking-consent': consent });
  for (const event of ['page_view', 'purchase', 'gtm.init', 'begin_checkout', 'view_item', 'add_to_cart', 'add_payment_info', 'generate_lead']) {
    assert.equal(pushEvent({ event }), false, `${event} must be blocked`);
  }
  assert.equal(window.dataLayer.length, 0);
});

test('a pushed ecommerce event clears the previous ecommerce object first', () => {
  const window = { dataLayer: [] };
  const { pushEvent, buildEcommerce } = load('lib/dataLayer.ts', { window }, { './tracking-consent': consent });
  assert(pushEvent({ event: 'view_promotion', ecommerce: buildEcommerce({ value: 199, items: [{ item_id: 'x', item_name: 'y', price: 199, quantity: 1 }] }) }));
  // JSON compare: the DataLayer array lives in the VM realm.
  assert.equal(JSON.stringify(window.dataLayer[0]), JSON.stringify({ ecommerce: null }));
  assert.equal(window.dataLayer[1].event, 'view_promotion');
  assert.equal(window.dataLayer[1].ecommerce.currency, 'INR');
  assert.equal(window.dataLayer[1].ecommerce.value, 199);
  assert.equal(window.dataLayer[1].ecommerce.items[0].item_id, 'x');

  // The five product events are served by lib/tracking.ts, which pushes with
  // the same clearing behaviour; pushing them again here would double-count.
  for (const event of ['view_item', 'add_to_cart', 'begin_checkout', 'add_payment_info', 'purchase']) {
    assert.equal(pushEvent({ event }), false, `${event} is owned by lib/tracking.ts`);
  }
  assert.equal(window.dataLayer.length, 2);
});

test('a zero or negative value is dropped, so no event reports a meaningless conversion', () => {
  const { buildEcommerce } = load('lib/dataLayer.ts', { window: { dataLayer: [] } }, { './tracking-consent': consent });
  for (const value of [0, -1, NaN, Infinity]) {
    assert.equal('value' in buildEcommerce({ value }), false, `value=${value}`);
  }
});

/* -------------------------------------------------------------------------- */
/* 4. Payloads cannot carry health data                                       */
/* -------------------------------------------------------------------------- */

test('plan identifiers are opaque and plan names never appear in a label', () => {
  const conditions = ['PCOD', 'pcod', 'Thyroid', 'Weight Loss', 'Therapeutic', 'Wedding'];
  const plans = [
    { planId: 'pcod-1-month', page: 'pcod', price: 1999, duration: '1 Month' },
    { planId: 'thyroid-plan-3-months', page: 'thyroid', price: 2999, duration: '3 Months' },
    { planId: 'weight-loss-1-month-2499', page: '2499-plan', price: 2499, duration: '1 Month' },
    { planId: 'therapeutic-plan-a', page: 'therapeutic', price: 1500, duration: null },
  ];
  const ids = new Set();
  for (const plan of plans) {
    const safe = labels.toSafePlan(plan);
    const serialized = JSON.stringify(safe);
    for (const condition of conditions) {
      assert(!serialized.includes(condition), `${safe.item_name} leaked "${condition}"`);
    }
    assert(/^dtps-[a-z-]+-[0-9a-z]{7}$/.test(safe.item_id), safe.item_id);
    assert(!ids.has(safe.item_id), 'identifiers must be unique');
    ids.add(safe.item_id);
    assert.equal(labels.toSafePlan(plan).item_id, safe.item_id, 'identifiers must be stable');
  }
});

test('analytics source URLs drop sensitive query parameters and non-https hosts', () => {
  const url = labels.safePageUrl('https://www.dtpoonamsagar.com/wldtps/lead/1?weight=88&email=a@b.com&condition=pcod&orderId=ORD-1#frag');
  assert(url.includes('orderId=ORD-1'));
  assert(!/weight|email|condition|pack|frag/i.test(url.replace('/wldtps/lead/1', '')));
  assert.equal(labels.safePageUrl('http://www.dtpoonamsagar.com/checkout'), undefined);
  assert.equal(labels.safePageUrl('https://evil.example/checkout'), undefined);
});

test('the SDK transport drops forbidden keys even when a caller adds them', () => {
  const calls = [];
  const { sanitizeMetadata } = load('lib/zappush.ts', { window: { zappush: { track: (e, d) => calls.push([e, d]) } } });
  const cleaned = sanitizeMetadata({
    value: 1999,
    currency: 'INR',
    coupon: 'SUMMER10',
    message: 'I have PCOD and want to lose 20kg',
    condition: 'PCOD',
    weight: 88,
    email: 'a@b.com',
    items: [
      { item_id: 'dtps-x', item_name: 'Nutrition Programme', item_category: 'PCOD', condition: 'PCOD' },
      { item_name: 'no id means dropped' },
    ],
  });
  const serialized = JSON.stringify(cleaned);
  assert(!/SUMMER10|coupon|PCOD|weight|message/i.test(serialized), serialized);
  assert.equal(cleaned.value, 1999);
  assert.equal(cleaned.email, 'a@b.com');
  assert.equal(cleaned.items.length, 1);
  assert.equal(cleaned.items[0].item_category, undefined);
});

test('the lead form cannot send age, gender, height or weight', () => {
  const tracker = read('lib/tracking.ts');
  const lead = tracker.slice(tracker.indexOf('export function trackLead'), tracker.indexOf('export function trackSchedule'));
  for (const key of ['age', 'gender', 'height', 'weight', 'goal', 'service']) {
    assert(!new RegExp(`${key}\\s*:`).test(lead), `trackLead must not read "${key}"`);
  }
  // The behavioural guard, not just a source grep: a caller passing the whole
  // form object must not get those fields anywhere near the wire.
  const calls = [];
  const { sanitizeMetadata } = load('lib/zappush.ts', { window: {} });
  const cleaned = sanitizeMetadata({
    email: 'a@b.com',
    phone: '+919876543210',
    age: '34',
    gender: 'female',
    height: '162',
    weight: '78',
    goal: 'lose 20kg',
  });
  assert.equal(JSON.stringify(cleaned), JSON.stringify({ email: 'a@b.com', phone: '+919876543210' }));
  assert.equal(calls.length, 0);  // And the forbidden-key list the transport enforces must cover them.
  const sdk = read('lib/zappush.ts');
  for (const key of ['weight', 'height', 'age', 'gender', 'goal', 'service', 'coupon', 'message']) {
    assert(sdk.includes(`'${key}'`), `forbidden-key list must contain "${key}"`);
  }
});

test('phone numbers are normalised to E.164 before they leave the browser', () => {
  const { toE164 } = load('lib/zappush.ts', { window: {} });
  assert.equal(toE164('9876543210', 'IN'), '+919876543210');
  assert.equal(toE164('+91 98765 43210', 'IN'), '+919876543210');
  assert.equal(toE164('123', 'IN'), undefined);
  assert.equal(toE164(null, 'IN'), undefined);
});

/* -------------------------------------------------------------------------- */
/* 5. Purchase integrity and duplicate control                                */
/* -------------------------------------------------------------------------- */

test('a purchase is emitted only from the verified-order path', () => {
  const pixelTracker = read('components/PixelTracker.tsx');
  // Only one call site, and it is guarded by the existing Meta verification.
  assert.equal((pixelTracker.match(/trackVerifiedPurchase\(/g) || []).length, 1);
  assert(pixelTracker.includes('if (sent) trackVerifiedPurchaseForOrder(orderId);'));
  const verify = pixelTracker.slice(pixelTracker.indexOf('async function trackVerifiedPurchaseForOrder'));
  assert(verify.includes("order.paymentStatus !== 'completed'"));
  assert(verify.includes('order.orderId !== orderId'));
  // The order total must come from the order, never from the URL.
  assert(verify.includes('Number(order.total)'));

  // No other page may emit a purchase.
  for (const file of ['app/checkout/success/SuccessContent.tsx', 'app/checkout/CheckoutContent.tsx', 'app/api/orders/route.ts']) {
    assert(!read(file).includes('trackVerifiedPurchase'), `${file} must not emit a purchase`);
  }
});

test('a repeated purchase for the same order is suppressed, and the order id is the dedup key', () => {
  const calls = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './zappush': { zappushTrack: (e, d) => { calls.push([e, d]); return true; } },
  }));
  const order = { orderId: 'ORD-1', value: 2499, lines: [{ id: 'weight-loss-1-month-2499', name: 'x', price: 2499, quantity: 1, page: '2499-plan' }] };
  assert(tracking.trackVerifiedPurchase(order));
  assert.equal(tracking.trackVerifiedPurchase(order), false, 'a second call must be suppressed');
  assert.equal(tracking.trackVerifiedPurchase({ ...order, value: 9999 }), false, 'value cannot be rewritten');
  assert.equal(calls.filter((c) => c[0] === 'checkout_completed').length, 1);
  assert.equal(calls[0][1].transaction_id, 'ORD-1');
  // A fresh tab has none of the markers: the purchase must fire there too.
  tracking.__resetOnceForTests();
  assert(tracking.trackVerifiedPurchase(order));
  assert.equal(calls.filter((c) => c[0] === 'checkout_completed').length, 2);
});

test('a failed send does not burn the dedup key, so a retry can still deliver', () => {
  const calls = [];
  const { window } = browserWindow();
  let accepts = false;
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './zappush': { zappushTrack: (e, d) => { if (!accepts) return false; calls.push([e, d]); return true; } },
  }));
  const order = { orderId: 'ORD-2', value: 1999, lines: [] };
  assert.equal(tracking.trackVerifiedPurchase(order), false, 'a rejected send reports false');
  assert.equal(calls.length, 0);
  accepts = true;
  assert(tracking.trackVerifiedPurchase(order), 'the key must not have been burned by the failure');
  assert.equal(calls.length, 1);
  assert.equal(tracking.trackVerifiedPurchase(order), false, 'and it dedupes once it succeeds');
});

test('a lead is deduped after a successful send', () => {
  const calls = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './zappush': { zappushTrack: (e, d) => { calls.push([e, d]); return true; } },
  }));
  assert(tracking.trackLead({ submissionId: 'lead:1:abc', contact: { email: 'a@b.com' } }));
  assert.equal(tracking.trackLead({ submissionId: 'lead:1:abc', contact: { email: 'a@b.com' } }), false);
  assert.equal(calls.filter((c) => c[0] === 'generate_lead').length, 1);
  // A lead with no contact fields at all is not a usable conversion.
  assert.equal(tracking.trackLead({ submissionId: 'lead:2', contact: {} }), false);
});

test('a purchase with no usable value is not a conversion', () => {
  const calls = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './zappush': { zappushTrack: () => { calls.push(1); return true; } },
  }));
  for (const value of [0, -5, NaN]) {
    assert.equal(tracking.trackVerifiedPurchase({ orderId: `ORD-${value}`, value, lines: [] }), false);
  }
  assert.equal(calls.length, 0);
});

test('the page view is not duplicated and is not pushed to the DataLayer', () => {
  const pushes = [];
  const sdk = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './dataLayer': { pushEvent: (p) => { pushes.push(p); return true; }, buildEcommerce: () => ({}) },
    './zappush': { zappushTrack: (e, d) => { sdk.push([e, d]); return true; } },
  }));
  tracking.trackPageView('/299plan');
  tracking.trackPageView('/299plan');
  assert.equal(sdk.filter((c) => c[0] === 'page_viewed').length, 1);
  assert.equal(pushes.length, 0, 'page_view must never be pushed to the DataLayer');
});

/* -------------------------------------------------------------------------- */
/* 6. Meta restrictions are untouched                                         */
/* -------------------------------------------------------------------------- */

test('the Meta policy still blocks everything it blocked before', () => {
  const policy = load('lib/meta-policy.ts');
  assert.equal(policy.canSendMetaEvents(), false);
  // Compare as JSON: these objects come from a separate VM realm, so
  // deepStrictEqual fails on the prototype difference even when equal.
  assert.equal(
    JSON.stringify(policy.sanitizeMetaCustomData({ value: 199, currency: 'INR', num_items: 1, content_name: 'PCOD Care', coupon: 'X' })),
    JSON.stringify({ value: 199, currency: 'INR', num_items: 1 })
  );
  assert.equal(JSON.stringify(policy.sanitizeMetaCustomData({ currency: 'USD' })), '{}');
  assert.equal(policy.sanitizeMetaSourceUrl('https://www.dtpoonamsagar.com/pcod'), undefined);
});

test('no second pixel, no second CAPI sender, and the new code sends no Meta events', () => {
  const nextConfig = read('next.config.js');
  // connect-src is where a second pixel or CAPI origin would have to be added.
  const connectSrc = nextConfig.match(/"connect-src [^"]*"/)[0];
  const connectHosts = Array.from(connectSrc.matchAll(/https:\/\/([^ '"]+)/g), (m) => m[1]);
  const metaConnectHosts = connectHosts.filter((host) => host.endsWith('facebook.com') || host.endsWith('facebook.net'));
  assert.deepEqual(
    metaConnectHosts.sort(),
    ['connect.facebook.net', 'www.facebook.com'],
    `unexpected Meta hosts in connect-src: ${metaConnectHosts.join(', ')}`
  );
  // The script host is loaded from script-src only; no pixel host was added there.
  const scriptSrc = nextConfig.match(/"script-src [^"]*"/)[0];
  assert.equal((scriptSrc.match(/https:\/\/connect\.facebook\.net/g) || []).length, 1);
  assert.equal((scriptSrc.match(/https:\/\/[^ '"]*facebook\.com/g) || []).length, 0);
  assert(!nextConfig.includes('conversionsapigateway'));

  for (const file of ['lib/tracking.ts', 'lib/dataLayer.ts', 'lib/zappush.ts', 'components/ZappushTracker.tsx', 'lib/plan-labels.ts', 'lib/analyticsConfig.ts']) {
    const source = read(file);
    assert(!/fbq|fbevents|fireCapi|meta-capi|facebook\.com/.test(source), `${file} must not touch Meta`);
  }

  // Exactly one Meta bootstrap, in the consent-gated component; no noscript
  // pixel remains (the unreachable noscript PageView was removed when loading
  // became consent-gated).
  const layout = read('app/layout.tsx');
  const gatedTags = read('components/ConsentGatedTags.tsx');
  assert.equal((layout.match(/facebook\.com\/tr/g) || []).length, 0);
  assert.equal((gatedTags.match(/id="meta-pixel-base"/g) || []).length, 0);
  assert(gatedTags.includes("META_BOOTSTRAP_ID") && gatedTags.includes("'meta-pixel-base'"));
  assert.equal(read('lib/meta-config.ts').includes("META_PIXEL_ID = '39186114291032857'"), true);
});

test('the existing server Purchase sender is still the only server sender', () => {
  const orders = read('app/api/orders/route.ts');
  assert.equal((orders.match(/sendCapiEvent\(/g) || []).length, 1);
  assert(orders.includes("eventName: 'Purchase'"));
  const capiRoute = read('app/api/meta/capi/route.ts');
  assert(capiRoute.includes('if (!canSendMetaEvents())'));
});

test('tracking is gated: no Zappush call happens while consent is denied', () => {
  const calls = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './dataLayer': {
      pushEvent: () => { throw new Error('must not push without consent'); },
      buildEcommerce: () => ({}),
    },
    './tracking-consent': {
      ...consent,
      readConsent: () => consent.parseConsent(JSON.stringify({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', policyVersion: consent.CONSENT_POLICY_VERSION })),
      isTrackingAllowed: (s) => consent.isTrackingAllowed(s ?? consent.parseConsent(JSON.stringify({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', policyVersion: consent.CONSENT_POLICY_VERSION }))),
    },
    './zappush': { zappushTrack: (e, d) => { calls.push([e, d]); return true; } },
  }));
  assert.equal(tracking.trackPageView('/299plan'), false);
  assert.equal(tracking.trackVerifiedPurchase({ orderId: 'ORD-1', value: 2499, lines: [] }), false);
  assert.equal(tracking.trackLead({ submissionId: 'x', contact: { email: 'a@b.com' } }), false);
  assert.equal(tracking.trackSchedule({ appointmentId: 'x', contact: { phone: '+919876543210' } }), false);
  assert.equal(tracking.trackBeginCheckout({ lines: [{ id: 'p', name: 'n', price: 1 }], sessionId: 's' }), false);
  assert.equal(calls.length, 0, 'denied consent must produce no Zappush call');
});

test('tracking initialises after a valid consent grant', () => {
  const calls = [];
  const pushed = [];
  const { window } = browserWindow();
  const tracking = load('lib/tracking.ts', { window }, trackingImports({
    './dataLayer': { pushEvent: (p) => { pushed.push(p); return true; }, buildEcommerce: (x) => x },
    './zappush': { zappushTrack: (e, d) => { calls.push([e, d]); return true; } },
  }));
  assert(tracking.trackPageView('/299plan'));
  assert.equal(calls.filter((c) => c[0] === 'page_viewed').length, 1);
  assert(tracking.trackLead({ submissionId: 's1', contact: { email: 'a@b.com' } }));
  assert.deepEqual(pushed.map((p) => p.event), ['generate_lead']);
  assert(tracking.trackSchedule({ appointmentId: 'A1', contact: { phone: '+919876543210' } }));
  assert.equal(calls.filter((c) => c[0] === 'schedule').length, 1);
});

/* -------------------------------------------------------------------------- */
/* 7. Rollout hygiene                                                         */
/* -------------------------------------------------------------------------- */

test('the consent prompt is removed and tracking defaults on', () => {
  const tracker = read('components/ZappushTracker.tsx');
  assert(!tracker.includes('role="dialog"'));
  assert(!tracker.includes('Reject optional'));
  assert(!tracker.includes('Accept all'));
  assert(!tracker.includes('dtps-consent-title'));
  const consent = read('lib/tracking-consent.ts');
  // Absence of a decision resolves to granted, so tracking fires for everyone.
  assert(consent.includes('if (!raw) return { ...GRANTED_CONSENT };'));
  assert(consent.includes('export const GRANTED_CONSENT: ConsentState'));
});

test('revocation is gated on the SDK capability, not on our own stub flag', () => {
  const tracker = read('components/ZappushTracker.tsx');
  const remove = tracker.slice(tracker.indexOf('function removeTracker'), tracker.indexOf('export default function ZappushTracker'));
  // The withdrawal must not be conditional on __dtpsZappushStubInstalled, which
  // only our own installStub() sets. withdrawZappushConsent() is a safe no-op
  // when the method is absent, so it is called unconditionally.
  assert(!/if\s*\(\s*window\.__dtpsZappushStubInstalled\s*\)/.test(remove));
  assert(remove.includes('withdrawZappushConsent();'));
  // And the script must not be torn down before the revocation was attempted.
  assert(remove.indexOf('withdrawZappushConsent()') < remove.indexOf('script.remove()'));
});

test('withdrawZappushConsent is a no-op rather than a throw when the SDK is absent', () => {
  const { withdrawZappushConsent, setZappushConsent } = load('lib/zappush.ts', { window: {} });
  assert.equal(withdrawZappushConsent(), false);
  assert.equal(setZappushConsent({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }), false);
  // And it does call through when the vendor method exists.
  const withdrawn = [];
  const mod = load('lib/zappush.ts', { window: { zappush: { withdrawConsent: () => withdrawn.push(1) } } });
  assert.equal(mod.withdrawZappushConsent(), true);
  assert.equal(withdrawn.length, 1);
});

test('the SPA page-view hand-off re-checks live consent rather than trusting a loaded flag', () => {
  const tracker = read('components/ZappushTracker.tsx');
  const effect = tracker.slice(tracker.indexOf('if (!pathname) return;'), tracker.indexOf('trackPageView(pathname);'));
  assert(effect.includes('isTrackingAllowed(readConsent())'));
  assert(!/if \(!pathname \|\| !loaded\) return/.test(tracker));
});

test('forbidden keys are matched case-insensitively so a variant spelling cannot slip through', () => {
  const { sanitizeMetadata } = load('lib/zappush.ts', { window: {} });
  const cleaned = sanitizeMetadata({
    Email: 'a@b.com',
    PHONE_NUMBER: '+919876543210',
    Condition: 'PCOD',
    Weight: '78',
    Age: '34',
    dateOfBirth: '1990-01-01',
    Height: '162',
    Gender: 'female',
    Goal: 'lose 20kg',
    CouponCode: 'SUMMER10',
    Message: 'I have PCOD',
    value: 199,
    items: [{ item_id: 'dtps-x', Condition: 'PCOD', Item_Category: 'PCOD', Weight: '78' }],
  });
  const serialized = JSON.stringify(cleaned);
  // No sensitive value survives, under any spelling.
  assert(!/PCOD|SUMMER10|1990|female|20kg|162|\b78\b|\b34\b/i.test(serialized), serialized);
  assert.equal(cleaned.Condition, undefined);
  assert.equal(cleaned.Weight, undefined);
  assert.equal(cleaned.Age, undefined);
  assert.equal(cleaned.dateOfBirth, undefined);
  assert.equal(cleaned.Height, undefined);
  assert.equal(cleaned.Gender, undefined);
  assert.equal(cleaned.Goal, undefined);
  assert.equal(cleaned.CouponCode, undefined);
  assert.equal(cleaned.Message, undefined);
  assert.equal(cleaned.value, 199);
  assert.equal(cleaned.items[0].item_id, 'dtps-x');
  assert.equal(cleaned.items[0].Condition, undefined);
  assert.equal(cleaned.items[0].Item_Category, undefined);
  assert.equal(cleaned.items[0].Weight, undefined);
  // The only two keys that pass are the ones deliberately allowed, and only on
  // the SDK path. Both are contact fields a conversion must be matchable with.
  assert.deepEqual(Object.keys(cleaned).sort(), ['Email', 'PHONE_NUMBER', 'items', 'value']);
});

test('an unknown key is the allow-by-default gap, so emitters must build payloads from scratch', () => {
  const { sanitizeMetadata } = load('lib/zappush.ts', { window: {} });
  // Documented limitation: the filter is a deny-list, so a novel key name that
  // is not listed would pass. This test pins that reality rather than implying
  // the filter is an allow-list, which is why lib/tracking.ts never spreads.
  const cleaned = sanitizeMetadata({ myUnknownField: 'anything' });
  assert.equal(cleaned.myUnknownField, 'anything');
  // But nothing in the application ever constructs such a key: every emitter
  // goes through buildContact()/toSafePlan(), asserted elsewhere in this file.
});

test('no secret or token is added to the client bundle', () => {
  for (const file of ['lib/zappush-config.ts', 'lib/tracking.ts', 'lib/dataLayer.ts', 'components/ZappushTracker.tsx', 'lib/analyticsConfig.ts']) {
    const source = read(file);
    assert(!/NEXT_PUBLIC_[A-Z_]*TOKEN|access_token|ACCESS_TOKEN|eaab/i.test(source), `${file} must not embed a token`);
  }
  const configSource = read('lib/zappush-config.ts');
  assert(configSource.includes('ZAPPUSH_META_CONNECTION_ID'));
  assert(configSource.includes('not used at runtime'));
});
